const prisma = require('../services/prismaClient');
const { validateCheckInInput } = require('../services/validatorService');
const { generateCoaching, GeminiUnavailableError } = require('../services/geminiService');
const { todayString } = require('../services/dateUtils');

function formatCoaching(coaching) {
  if (!coaching) return null;
  if (coaching.status === 'UNAVAILABLE') {
    return { status: 'UNAVAILABLE' };
  }
  return {
    status: 'SUCCESS',
    dailyMessage: coaching.dailyMessage,
    nudgePlan: JSON.parse(coaching.nudgePlan)
  };
}

async function createCheckIn(req, res, next) {
  try {
    const { valid, errors, data } = validateCheckInInput(req.body);
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const goal = await prisma.goal.findUnique({ where: { sessionId: req.sessionId } });
    if (!goal) {
      return res.status(404).json({ error: 'Set a goal before checking in' });
    }

    const today = todayString();

    const recentCheckIns = await prisma.checkIn.findMany({
      where: { sessionId: req.sessionId, date: { not: today } },
      orderBy: { date: 'desc' },
      take: 7
    });

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

    const coaching = await prisma.coachingResponse.upsert({
      where: { checkInId: checkIn.id },
      update: coachingResult
        ? { status: 'SUCCESS', dailyMessage: coachingResult.dailyMessage, nudgePlan: JSON.stringify(coachingResult.nudgePlan) }
        : { status: 'UNAVAILABLE', dailyMessage: null, nudgePlan: null },
      create: coachingResult
        ? { checkInId: checkIn.id, status: 'SUCCESS', dailyMessage: coachingResult.dailyMessage, nudgePlan: JSON.stringify(coachingResult.nudgePlan) }
        : { checkInId: checkIn.id, status: 'UNAVAILABLE' }
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
    const limit = Math.min(parseInt(req.query.limit, 10) || 14, 50);
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
