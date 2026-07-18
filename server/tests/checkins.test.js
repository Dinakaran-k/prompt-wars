jest.mock('../services/geminiService', () => {
  const actual = jest.requireActual('../services/geminiService');
  return { ...actual, generateCoaching: jest.fn() };
});

const request = require('supertest');
const app = require('../app');
const prisma = require('../services/prismaClient');
const geminiService = require('../services/geminiService');

const SESSION_ID = '11111111-1111-1111-1111-111111111111';

beforeEach(async () => {
  await prisma.coachingResponse.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.goal.deleteMany();
  geminiService.generateCoaching.mockReset();
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function createGoal() {
  return request(app)
    .post('/api/goal')
    .set('X-Session-Id', SESSION_ID)
    .send({ habitLabel: 'Late-night scrolling', dailyTargetMinutes: 60 });
}

describe('session requirement', () => {
  test('POST /api/checkins without X-Session-Id returns 400', async () => {
    const res = await request(app).post('/api/checkins').send({ screenTimeMinutes: 30 });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/checkins', () => {
  test('returns 404 if no goal has been set for the session', async () => {
    const res = await request(app)
      .post('/api/checkins')
      .set('X-Session-Id', SESSION_ID)
      .send({ screenTimeMinutes: 30 });

    expect(res.status).toBe(404);
  });

  test('returns 400 for invalid input', async () => {
    await createGoal();
    const res = await request(app)
      .post('/api/checkins')
      .set('X-Session-Id', SESSION_ID)
      .send({ screenTimeMinutes: -5 });

    expect(res.status).toBe(400);
  });

  test('happy path: persists check-in and returns SUCCESS coaching', async () => {
    await createGoal();
    geminiService.generateCoaching.mockResolvedValueOnce({
      dailyMessage: 'Great job cutting back today.',
      nudgePlan: ['Put your phone in another room after 10pm']
    });

    const res = await request(app)
      .post('/api/checkins')
      .set('X-Session-Id', SESSION_ID)
      .send({ screenTimeMinutes: 45, triggerNote: 'couldn\'t sleep', moodContext: 'STRESSED' });

    expect(res.status).toBe(201);
    expect(res.body.checkIn.screenTimeMinutes).toBe(45);
    expect(res.body.coaching.status).toBe('SUCCESS');
    expect(res.body.coaching.dailyMessage).toContain('Great job');
    expect(res.body.coaching.nudgePlan).toHaveLength(1);

    const stored = await prisma.checkIn.findMany({ where: { sessionId: SESSION_ID } });
    expect(stored).toHaveLength(1);
  });

  test('failure path: Gemini failing twice still saves the check-in with UNAVAILABLE coaching', async () => {
    await createGoal();
    geminiService.generateCoaching.mockRejectedValueOnce(
      new geminiService.GeminiUnavailableError('down')
    );

    const res = await request(app)
      .post('/api/checkins')
      .set('X-Session-Id', SESSION_ID)
      .send({ screenTimeMinutes: 20 });

    expect(res.status).toBe(201);
    expect(res.body.coaching.status).toBe('UNAVAILABLE');

    const stored = await prisma.checkIn.findMany({ where: { sessionId: SESSION_ID } });
    expect(stored).toHaveLength(1);
  });
});

describe('GET /api/checkins', () => {
  test('lists check-ins for the session', async () => {
    await createGoal();
    geminiService.generateCoaching.mockResolvedValueOnce({
      dailyMessage: 'Nice work.',
      nudgePlan: ['Try a short walk instead']
    });

    await request(app)
      .post('/api/checkins')
      .set('X-Session-Id', SESSION_ID)
      .send({ screenTimeMinutes: 40 });

    const res = await request(app)
      .get('/api/checkins')
      .set('X-Session-Id', SESSION_ID);

    expect(res.status).toBe(200);
    expect(res.body.checkIns).toHaveLength(1);
    expect(res.body.checkIns[0].coaching.status).toBe('SUCCESS');
  });
});
