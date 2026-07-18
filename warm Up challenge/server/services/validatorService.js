/**
 * Validates the planning form request body
 * @param {object} input 
 * @returns {{isValid: boolean, error: string|null}}
 */
function validateInput(input) {
  if (!input) {
    return { isValid: false, error: 'Request body is empty' };
  }

  const { schedule, people, diet, budget, currency } = input;

  // Validate schedule
  if (schedule === undefined || schedule === null) {
    return { isValid: false, error: 'Schedule/context is required' };
  }
  if (typeof schedule !== 'string' || schedule.trim() === '') {
    return { isValid: false, error: 'Schedule/context must be a non-empty string' };
  }
  if (schedule.length > 1000) {
    return { isValid: false, error: 'Schedule/context must not exceed 1000 characters' };
  }

  // Validate people
  if (people === undefined || people === null) {
    return { isValid: false, error: 'Number of people is required' };
  }
  const parsedPeople = Number(people);
  if (!Number.isInteger(parsedPeople) || parsedPeople <= 0) {
    return { isValid: false, error: 'Number of people must be a positive integer' };
  }

  // Validate diet
  const validDiets = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'No Restriction'];
  if (!diet) {
    return { isValid: false, error: 'Dietary preference is required' };
  }
  if (!validDiets.includes(diet)) {
    return { isValid: false, error: `Dietary preference must be one of: ${validDiets.join(', ')}` };
  }

  // Validate budget
  if (budget === undefined || budget === null) {
    return { isValid: false, error: 'Budget is required' };
  }
  const parsedBudget = Number(budget);
  if (isNaN(parsedBudget) || parsedBudget <= 0) {
    return { isValid: false, error: 'Budget must be a positive number' };
  }

  // Validate currency
  const validCurrencies = ['₹', '$'];
  if (!currency) {
    return { isValid: false, error: 'Currency is required' };
  }
  if (!validCurrencies.includes(currency)) {
    return { isValid: false, error: `Currency must be either ₹ or $` };
  }

  return { isValid: true, error: null };
}

/**
 * Validates the Gemini JSON response structure
 * @param {object} data 
 * @returns {boolean}
 */
function validateGeminiResponse(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check structure fields
  const meals = ['breakfast', 'lunch', 'dinner'];
  for (const meal of meals) {
    if (!data[meal] || typeof data[meal] !== 'object') {
      return false;
    }
    if (typeof data[meal].title !== 'string' || 
        typeof data[meal].description !== 'string' || 
        typeof data[meal].cookTime !== 'string') {
      return false;
    }
  }

  // Check lists
  if (!Array.isArray(data.groceryList) || !data.groceryList.every(i => typeof i === 'string')) {
    return false;
  }
  if (!Array.isArray(data.substitutions) || !data.substitutions.every(i => typeof i === 'string')) {
    return false;
  }

  // Check budget
  if (!data.budget || typeof data.budget !== 'object') {
    return false;
  }
  if (typeof data.budget.fits !== 'boolean' || 
      typeof data.budget.estimatedCost !== 'string' || 
      typeof data.budget.note !== 'string') {
    return false;
  }

  return true;
}

module.exports = {
  validateInput,
  validateGeminiResponse
};
