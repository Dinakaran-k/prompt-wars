const prisma = require('../services/prismaClient');
const { validateGoalInput } = require('../services/validatorService');

async function upsertGoal(req, res, next) {
  try {
    const { valid, errors, data } = validateGoalInput(req.body);
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const goal = await prisma.goal.upsert({
      where: { sessionId: req.sessionId },
      update: { habitLabel: data.habitLabel, dailyTargetMinutes: data.dailyTargetMinutes },
      create: { sessionId: req.sessionId, habitLabel: data.habitLabel, dailyTargetMinutes: data.dailyTargetMinutes }
    });

    return res.status(200).json(goal);
  } catch (err) {
    return next(err);
  }
}

async function getGoal(req, res, next) {
  try {
    const goal = await prisma.goal.findUnique({ where: { sessionId: req.sessionId } });
    if (!goal) {
      return res.status(404).json({ error: 'No goal set for this session yet' });
    }
    return res.status(200).json(goal);
  } catch (err) {
    return next(err);
  }
}

module.exports = { upsertGoal, getGoal };
