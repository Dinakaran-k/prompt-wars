const prisma = require('../services/prismaClient');
const { validateCheckInInput } = require('../services/validatorService');
const { generateCoaching, GeminiUnavailableError } = require('../services/geminiService');
const { todayString } = require('../services/dateUtils');

function formatCoaching(coaching) {
  if (!coaching) return null;
  if (coaching.status === 'UNAVAILABLE') {
    return { status: 'UNAVAILABLE' };
  }
  try {
    return {
      status: 'SUCCESS',
      dailyMessage: coaching.dailyMessage,
      nudgePlan: JSON.parse(coaching.nudgePlan)
    };
  } catch (err) {
    console.error('Failed to parse stored nudgePlan JSON:', err);
    return { status: 'UNAVAILABLE' };
  }
}

async function createCheckIn(req, res, next) {
  try {
    const { valid, errors, data } = validateCheckInInput(req.body);
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const today = todayString();
    const [goal, recentCheckIns] = await Promise.all([
      prisma.goal.findUnique({ where: { sessionId: req.sessionId } }),
      prisma.checkIn.findMany({
        where: { sessionId: req.sessionId, date: { not: today } },
        orderBy: { date: 'desc' },
        take: 7
      })
    ]);
    if (!goal) {
      return res.status(404).json({ error: 'Set a goal before checking in' });
    }

    const checkIn = await prisma.checkIn.upsert({
      where: { sessionId_date: { sessionId: req.sessionId, date: today } },
      update: {
        screenTimeMinutes: data.screenTimeMinutes,
        triggerNote: data.triggerNote,
        moodContext: data.moodContext
      },
      create: {
        sessionId: req.sessionId,
        date: today,
        screenTimeMinutes: data.screenTimeMinutes,
        triggerNote: data.triggerNote,
        moodContext: data.moodContext
      }
    });

    let coachingResult;
    try {
      coachingResult = await generateCoaching({
        habitLabel: goal.habitLabel,
        dailyTargetMinutes: goal.dailyTargetMinutes,
        todayCheckIn: data,
        recentCheckIns
      });
    } catch (err) {
      if (!(err instanceof GeminiUnavailableError)) {
        console.error('Unexpected error generating coaching:', err);
      }
      coachingResult = null;
    }

    const coachingData = coachingResult
      ? { status: 'SUCCESS', dailyMessage: coachingResult.dailyMessage, nudgePlan: JSON.stringify(coachingResult.nudgePlan) }
      : { status: 'UNAVAILABLE', dailyMessage: null, nudgePlan: null };

    // Intentionally NOT wrapped in a transaction with the checkIn upsert: the Gemini call
    // (generateCoaching, above) sits between the two writes and can take up to ~30s with
    // retries, so holding a DB transaction open across it risks exhausting the connection
    // pool. If this upsert fails after the checkIn was already saved, the error propagates
    // to the try/catch below and the client gets a 500 — the check-in row persists without
    // coaching (a degraded but recoverable state), and the failure is surfaced, not swallowed.
    const coaching = await prisma.coachingResponse.upsert({
      where: { checkInId: checkIn.id },
      update: coachingData,
      create: { checkInId: checkIn.id, ...coachingData }
    });

    return res.status(201).json({
      checkIn,
      coaching: formatCoaching(coaching)
    });
  } catch (err) {
    return next(err);
  }
}

async function listCheckIns(req, res, next) {
  try {
    const parsedLimit = parseInt(req.query.limit, 10);
    const limit = Math.min(Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 14, 50);
    const cursor = req.query.cursor;

    const where = {
      sessionId: req.sessionId,
      ...(cursor ? { date: { lt: cursor } } : {})
    };

    const rows = await prisma.checkIn.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit + 1,
      include: { coaching: true }
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;

    return res.status(200).json({
      checkIns: page.map((c) => ({
        id: c.id,
        date: c.date,
        screenTimeMinutes: c.screenTimeMinutes,
        triggerNote: c.triggerNote,
        moodContext: c.moodContext,
        createdAt: c.createdAt,
        coaching: formatCoaching(c.coaching)
      })),
      nextCursor: hasMore ? page[page.length - 1].date : null
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createCheckIn, listCheckIns };
