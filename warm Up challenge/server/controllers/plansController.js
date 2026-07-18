const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validateInput, validateGeminiResponse } = require('../services/validatorService');
const { generateMealPlan } = require('../services/geminiService');
const { calculateBudgetFeasibility } = require('../services/budgetService');

// Create a plan
async function createPlan(req, res) {
  try {
    // 1. Sanitize & validate request parameters
    const inputValidation = validateInput(req.body);
    if (!inputValidation.isValid) {
      return res.status(400).json({ error: inputValidation.error });
    }

    const { schedule, people, diet, budget, currency } = req.body;

    // 2. Call Gemini API to generate the plan
    let generatedPlan;
    try {
      generatedPlan = await generateMealPlan({
        schedule,
        people: parseInt(people, 10),
        diet,
        budget: parseFloat(budget),
        currency
      });
    } catch (error) {
      console.error('Gemini Generation Error:', error);
      return res.status(502).json({ error: `Gemini AI failed: ${error.message}` });
    }

    // 3. Validate Gemini output JSON
    const isGeminiValid = validateGeminiResponse(generatedPlan);
    if (!isGeminiValid) {
      console.error('Malformed Gemini JSON Structure:', generatedPlan);
      return res.status(502).json({ 
        error: 'The AI service returned a plan in an unexpected format. Please try again.' 
      });
    }

    // 4. Calculate budget feasibility server-side to guarantee consistency
    const budgetAnalysis = calculateBudgetFeasibility(
      generatedPlan.budget.estimatedCost,
      parseFloat(budget),
      currency
    );
    generatedPlan.budget = budgetAnalysis;

    // 5. Save to Database
    const savedPlan = await prisma.cookingPlan.create({
      data: {
        schedule,
        people: parseInt(people, 10),
        diet,
        budget: parseFloat(budget),
        currency,
        generatedPlan: JSON.stringify(generatedPlan)
      }
    });

    // 6. Respond with saved plan (including parsed JSON)
    const formattedPlan = {
      ...savedPlan,
      generatedPlan: JSON.parse(savedPlan.generatedPlan)
    };

    return res.status(201).json(formattedPlan);
  } catch (error) {
    console.error('Create Plan Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error while generating plan' });
  }
}

// Get all plans
async function getAllPlans(req, res) {
  try {
    const plans = await prisma.cookingPlan.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedPlans = plans.map(plan => ({
      ...plan,
      generatedPlan: JSON.parse(plan.generatedPlan)
    }));

    return res.status(200).json(formattedPlans);
  } catch (error) {
    console.error('Get All Plans Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve plans from database' });
  }
}

// Get a single plan by ID
async function getPlanById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    const plan = await prisma.cookingPlan.findUnique({
      where: { id }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Cooking plan not found' });
    }

    const formattedPlan = {
      ...plan,
      generatedPlan: JSON.parse(plan.generatedPlan)
    };

    return res.status(200).json(formattedPlan);
  } catch (error) {
    console.error('Get Plan By ID Error:', error);
    return res.status(500).json({ error: 'Failed to retrieve plan' });
  }
}

// Delete a plan by ID
async function deletePlan(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Check if the plan exists first
    const existingPlan = await prisma.cookingPlan.findUnique({
      where: { id }
    });

    if (!existingPlan) {
      return res.status(404).json({ error: 'Cooking plan not found' });
    }

    await prisma.cookingPlan.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Cooking plan deleted successfully', id });
  } catch (error) {
    console.error('Delete Plan Error:', error);
    return res.status(500).json({ error: 'Failed to delete cooking plan' });
  }
}

module.exports = {
  createPlan,
  getAllPlans,
  getPlanById,
  deletePlan
};
