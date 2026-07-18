const prisma = require('../services/prismaClient');
const { computeStats } = require('../services/statsService');

async function getStats(req, res, next) {
  try {
    const [goal, checkIns] = await Promise.all([
      prisma.goal.findUnique({ where: { sessionId: req.sessionId } }),
      prisma.checkIn.findMany({
        where: { sessionId: req.sessionId },
        select: { date: true, screenTimeMinutes: true }
      })
    ]);

    const stats = computeStats(checkIns, goal ? goal.dailyTargetMinutes : null);
    return res.status(200).json(stats);
  } catch (err) {
    return next(err);
  }
}

module.exports = { getStats };
