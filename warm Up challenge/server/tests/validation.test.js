const { validateInput, validateGeminiResponse } = require('../services/validatorService');
const { calculateBudgetFeasibility } = require('../services/budgetService');

describe('Validation Services', () => {
  describe('validateInput', () => {
    test('should validate correct input', () => {
      const input = {
        schedule: 'meetings till 6 PM, 30 min for dinner',
        people: 2,
        diet: 'Vegetarian',
        budget: 50,
        currency: '$'
      };
      expect(validateInput(input)).toEqual({ isValid: true, error: null });
    });

    test('should reject empty required fields', () => {
      const input = {
        schedule: '',
        people: 2,
        diet: 'Vegetarian',
        budget: 50,
        currency: '$'
      };
      expect(validateInput(input).isValid).toBe(false);
      expect(validateInput(input).error).toContain('Schedule');
    });

    test('should reject non-positive budget', () => {
      const input = {
        schedule: 'some context',
        people: 2,
        diet: 'Vegetarian',
        budget: 0,
        currency: '$'
      };
      expect(validateInput(input).isValid).toBe(false);
      expect(validateInput(input).error).toContain('Budget');
    });

    test('should reject non-positive people count', () => {
      const input = {
        schedule: 'some context',
        people: -1,
        diet: 'Vegetarian',
        budget: 50,
        currency: '$'
      };
      expect(validateInput(input).isValid).toBe(false);
      expect(validateInput(input).error).toContain('people');
    });

    test('should reject decimal people count', () => {
      const input = {
        schedule: 'some context',
        people: 2.5,
        diet: 'Vegetarian',
        budget: 50,
        currency: '$'
      };
      expect(validateInput(input).isValid).toBe(false);
      expect(validateInput(input).error).toContain('people');
    });

    test('should reject excessively long text', () => {
      const input = {
        schedule: 'a'.repeat(1001),
        people: 2,
        diet: 'Vegetarian',
        budget: 50,
        currency: '$'
      };
      expect(validateInput(input).isValid).toBe(false);
      expect(validateInput(input).error).toContain('exceed');
    });

    test('should reject invalid currency', () => {
      const input = {
        schedule: 'some context',
        people: 2,
        diet: 'Vegetarian',
        budget: 50,
        currency: 'EUR'
      };
      expect(validateInput(input).isValid).toBe(false);
      expect(validateInput(input).error).toContain('Currency');
    });
  });

  describe('validateGeminiResponse', () => {
    test('should approve standard Gemini JSON format', () => {
      const payload = {
        breakfast: { title: 'Eggs', description: 'Quick scramble', cookTime: '10m' },
        lunch: { title: 'Salad', description: 'Green veggies', cookTime: '15m' },
        dinner: { title: 'Pasta', description: 'Marinara sauce', cookTime: '25m' },
        groceryList: ['eggs', 'greens', 'pasta'],
        substitutions: ['Tofu for paneer'],
        budget: { fits: true, estimatedCost: '$35.00', note: 'Fits budget' }
      };
      expect(validateGeminiResponse(payload)).toBe(true);
    });

    test('should reject malformed structural response', () => {
      const payload = {
        breakfast: { title: 'Eggs', description: 'Quick scramble' }, // missing cookTime
        lunch: { title: 'Salad', description: 'Green veggies', cookTime: '15m' },
        dinner: { title: 'Pasta', description: 'Marinara sauce', cookTime: '25m' },
        groceryList: ['eggs'],
        substitutions: [],
        budget: { fits: true, estimatedCost: '$35.00', note: 'Fits' }
      };
      expect(validateGeminiResponse(payload)).toBe(false);
    });
  });

  describe('calculateBudgetFeasibility', () => {
    test('should mark as fitting budget when under target', () => {
      const result = calculateBudgetFeasibility('$45.00', 50, '$');
      expect(result.fits).toBe(true);
      expect(result.estimatedCost).toBe('$45.00');
      expect(result.note).toContain('fits within');
    });

    test('should mark as over budget when above target', () => {
      const result = calculateBudgetFeasibility('₹600.00', 500, '₹');
      expect(result.fits).toBe(false);
      expect(result.estimatedCost).toBe('₹600.00');
      expect(result.note).toContain('exceeds');
    });
  });
});
