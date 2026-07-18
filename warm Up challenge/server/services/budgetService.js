/**
 * Calculates budget feasibility by comparing estimated cost with target budget.
 * @param {string} estimatedCostStr E.g., "$45.00" or "350" or "₹120"
 * @param {number} targetBudget User's target budget limit
 * @param {string} currency User's selected currency ($ or ₹)
 * @returns {{fits: boolean, estimatedCost: string, note: string}}
 */
function calculateBudgetFeasibility(estimatedCostStr, targetBudget, currency) {
  if (!estimatedCostStr || typeof estimatedCostStr !== 'string') {
    return {
      fits: false,
      estimatedCost: `${currency}0.00`,
      note: 'Estimated cost was not provided in the correct format.'
    };
  }

  // Extract digits and decimal point
  const numericValue = parseFloat(estimatedCostStr.replace(/[^0-9.]/g, ''));
  if (isNaN(numericValue) || numericValue <= 0) {
    return {
      fits: false,
      estimatedCost: `${currency}0.00`,
      note: `Estimated cost "${estimatedCostStr}" is invalid.`
    };
  }

  const fits = numericValue <= targetBudget;
  const difference = Math.abs(targetBudget - numericValue).toFixed(2);
  
  let note = '';
  if (fits) {
    note = `Estimated cost of ${currency}${numericValue.toFixed(2)} fits within your target budget of ${currency}${targetBudget.toFixed(2)} (under by ${currency}${difference}).`;
  } else {
    note = `Estimated cost of ${currency}${numericValue.toFixed(2)} exceeds your budget of ${currency}${targetBudget.toFixed(2)} by ${currency}${difference}. Suggestions: Replace brand name goods, buy in bulk, or use standard substitutions.`;
  }

  return {
    fits,
    estimatedCost: `${currency}${numericValue.toFixed(2)}`,
    note
  };
}

module.exports = {
  calculateBudgetFeasibility
};
