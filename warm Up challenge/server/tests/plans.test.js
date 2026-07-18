const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const geminiService = require('../services/geminiService');

jest.mock('../services/geminiService');

beforeEach(async () => {
  await prisma.cookingPlan.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/plans Integration Tests', () => {
  const validForm = {
    schedule: 'meetings till 6 PM, 30 min for dinner',
    people: 2,
    diet: 'Vegetarian',
    budget: 40,
    currency: '$'
  };

  test('Happy Path: should successfully generate and save meal plan', async () => {
    const mockGeminiResponse = {
      breakfast: { title: 'Oatmeal', description: 'Quick oats', cookTime: '5 mins' },
      lunch: { title: 'Greek Salad', description: 'Fresh veggies', cookTime: '10 mins' },
      dinner: { title: 'Tofu stir fry', description: 'Quick stir fry', cookTime: '15 mins' },
      groceryList: ['Oats', 'Cucumber', 'Tofu'],
      substitutions: ['Tofu for paneer'],
      budget: { fits: true, estimatedCost: '$25.00', note: 'Fits budget' }
    };

    geminiService.generateMealPlan.mockResolvedValueOnce(mockGeminiResponse);

    const res = await request(app)
      .post('/api/plans')
      .send(validForm);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.schedule).toBe(validForm.schedule);
    expect(res.body.generatedPlan.breakfast.title).toBe('Oatmeal');

    // Confirm stored in DB
    const plansInDb = await prisma.cookingPlan.findMany();
    expect(plansInDb.length).toBe(1);
    expect(JSON.parse(plansInDb[0].generatedPlan).breakfast.title).toBe('Oatmeal');
  });

  test('Gemini Failure Path: should return 502 if Gemini API throws error', async () => {
    geminiService.generateMealPlan.mockRejectedValueOnce(new Error('API quota exceeded'));

    const res = await request(app)
      .post('/api/plans')
      .send(validForm);

    expect(res.status).toBe(502);
    expect(res.body.error).toContain('Gemini AI failed: API quota exceeded');

    // Confirm nothing stored in DB
    const plansInDb = await prisma.cookingPlan.findMany();
    expect(plansInDb.length).toBe(0);
  });

  test('Gemini Malformed JSON Path: should return 502 if Gemini API returns invalid structure', async () => {
    const malformedResponse = {
      breakfast: { title: 'Oatmeal' }, // missing description and cookTime
      groceryList: []
    };

    geminiService.generateMealPlan.mockResolvedValueOnce(malformedResponse);

    const res = await request(app)
      .post('/api/plans')
      .send(validForm);

    expect(res.status).toBe(502);
    expect(res.body.error).toContain('unexpected format');

    const plansInDb = await prisma.cookingPlan.findMany();
    expect(plansInDb.length).toBe(0);
  });

  test('Input Validation Path: should return 400 for invalid request body', async () => {
    const invalidForm = {
      ...validForm,
      budget: -10 // Invalid budget
    };

    const res = await request(app)
      .post('/api/plans')
      .send(invalidForm);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Budget must be a positive number');

    const plansInDb = await prisma.cookingPlan.findMany();
    expect(plansInDb.length).toBe(0);
  });
});
