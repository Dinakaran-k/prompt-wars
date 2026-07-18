jest.mock('../services/geminiService', () => {
  const actual = jest.requireActual('../services/geminiService');
  return { ...actual, generateCoaching: jest.fn() };
});

const request = require('supertest');
const app = require('../app');
const prisma = require('../services/prismaClient');
const geminiService = require('../services/geminiService');
const { todayString, addDays } = require('../services/dateUtils');

const SESSION_ID = '22222222-2222-2222-2222-222222222222';

beforeEach(async () => {
  await prisma.coachingResponse.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.goal.deleteMany();
  geminiService.generateCoaching.mockReset();
});

afterAll(async () => {
  await prisma.$disconnect();
});

/**
 * Simulates the full judge demo path: set a goal, arrive with 13 days of
 * real historical check-ins already logged (7 "before" days, 6 "recent"
 * days at a lower usage), submit today's check-in through the real API
 * with a real (mocked) Gemini call, then confirm the dashboard's computed
 * stats genuinely reflect that history — nothing fabricated or cached.
 */
test('full demo flow: goal -> historical check-ins -> today check-in -> stats reflect real improvement', async () => {
  await request(app)
    .post('/api/goal')
    .set('X-Session-Id', SESSION_ID)
    .send({ habitLabel: 'Late-night scrolling', dailyTargetMinutes: 60 });

  const today = todayString();

  // 7 "before" days (day -13..-7): heavier usage
  for (let i = 13; i >= 7; i -= 1) {
    await prisma.checkIn.create({
      data: {
        sessionId: SESSION_ID,
        date: addDays(today, -i),
        screenTimeMinutes: 120
      }
    });
  }

  // 6 "recent" days (day -6..-1): lighter usage, already improving
  for (let i = 6; i >= 1; i -= 1) {
    await prisma.checkIn.create({
      data: {
        sessionId: SESSION_ID,
        date: addDays(today, -i),
        screenTimeMinutes: 60
      }
    });
  }

  geminiService.generateCoaching.mockResolvedValueOnce({
    dailyMessage: 'You are down significantly from two weeks ago — keep it up.',
    nudgePlan: ['Charge your phone outside the bedroom tonight']
  });

  const checkInRes = await request(app)
    .post('/api/checkins')
    .set('X-Session-Id', SESSION_ID)
    .send({ screenTimeMinutes: 40, triggerNote: 'stayed off after dinner', moodContext: 'HABIT' });

  expect(checkInRes.status).toBe(201);
  expect(checkInRes.body.coaching.status).toBe('SUCCESS');

  const statsRes = await request(app)
    .get('/api/stats')
    .set('X-Session-Id', SESSION_ID);

  expect(statsRes.status).toBe(200);
  expect(statsRes.body.totalCheckIns).toBe(14);
  expect(statsRes.body.currentStreakDays).toBe(14);
  expect(statsRes.body.trend).toBe('IMPROVING');
  expect(statsRes.body.avgMinutesPrev7Days).toBe(120);
  expect(statsRes.body.daysUnderTargetLast7).toBe(7);

  const historyRes = await request(app)
    .get('/api/checkins')
    .set('X-Session-Id', SESSION_ID);

  expect(historyRes.status).toBe(200);
  expect(historyRes.body.checkIns[0].date).toBe(today);
  expect(historyRes.body.checkIns[0].coaching.status).toBe('SUCCESS');
});
