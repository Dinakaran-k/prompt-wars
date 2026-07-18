const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generates a meal plan using Google Gemini API
 * @param {object} params
 * @param {string} params.schedule
 * @param {number} params.people
 * @param {string} params.diet
 * @param {number} params.budget
 * @param {string} params.currency
 * @returns {Promise<object>}
 */
async function generateMealPlan({ schedule, people, diet, budget, currency }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API key is not configured on the server. Please add GEMINI_API_KEY in server/.env');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Use gemini-3.5-flash for fast responses and reliable JSON mode
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    }
  });

  const prompt = `
You are an expert personalized meal planner.
Given the following context, generate a meal plan for a single day:
- Day's schedule/context: "${schedule}"
- Number of people: ${people}
- Dietary preference: ${diet}
- Budget: ${budget} ${currency}

Your task is to plan breakfast, lunch, and dinner.
The meal plan must fit the budget and the schedule. If it exceeds the budget, flag it in the budget notes and suggest cost reduction ideas.

You MUST respond with EXACTLY this JSON structure:
{
  "breakfast": { "title": "Dish name", "description": "Short description and why it fits the user's schedule", "cookTime": "Estimated cook time (e.g. 15 mins)" },
  "lunch": { "title": "Dish name", "description": "Short description and why it fits the user's schedule", "cookTime": "Estimated cook time (e.g. 20 mins)" },
  "dinner": { "title": "Dish name", "description": "Short description and why it fits the user's schedule", "cookTime": "Estimated cook time (e.g. 30 mins)" },
  "groceryList": ["item 1", "item 2", ...],
  "substitutions": ["No paneer? Use tofu.", ...],
  "budget": { "fits": true/false, "estimatedCost": "Estimated total cost of these meals in ${currency}", "note": "Why it fits the budget, and cost-reduction suggestions if over budget" }
}

Ensure the response is valid JSON and contains all required keys. Do not return any other text or markdown formatting.
`;

  try {
    // Generate text with a 15-second timeout to handle network issues
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API request timed out')), 15000))
    ]);

    if (!result || !result.response) {
      throw new Error('Empty response received from Gemini API');
    }

    const responseText = result.response.text();
    if (!responseText) {
      throw new Error('No text content returned from Gemini API');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      // Strip markdown code blocks if the JSON mode failed to omit them
      const cleanText = responseText.replace(/```json|```/g, '').trim();
      parsedData = JSON.parse(cleanText);
    }

    return parsedData;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Failed to call Gemini API');
  }
}

module.exports = {
  generateMealPlan
};
