const MOOD_VALUES = ['STRESSED', 'BORED', 'HABIT', 'SOCIAL', 'OTHER'];

// Strips all HTML tags and neutralizes any remaining angle brackets, so
// free-text fields can never inject markup when rendered in the DOM later.
function sanitizeText(value) {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

function validateGoalInput(body) {
  const errors = [];
  const { habitLabel, dailyTargetMinutes } = body || {};

  if (typeof habitLabel !== 'string' || habitLabel.trim().length === 0) {
    errors.push('habitLabel is required');
  } else if (habitLabel.trim().length > 100) {
    errors.push('habitLabel must be 100 characters or fewer');
  }

  let cleanTarget = null;
  if (dailyTargetMinutes !== undefined && dailyTargetMinutes !== null) {
    if (!Number.isInteger(dailyTargetMinutes) || dailyTargetMinutes <= 0) {
      errors.push('dailyTargetMinutes must be a positive integer');
    } else {
      cleanTarget = dailyTargetMinutes;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      habitLabel: sanitizeText(habitLabel),
      dailyTargetMinutes: cleanTarget
    }
  };
}

function validateCheckInInput(body) {
  const errors = [];
  const { screenTimeMinutes, triggerNote, moodContext } = body || {};

  if (!Number.isInteger(screenTimeMinutes) || screenTimeMinutes < 0) {
    errors.push('screenTimeMinutes must be a non-negative integer');
  }

  if (triggerNote !== undefined && triggerNote !== null) {
    if (typeof triggerNote !== 'string') {
      errors.push('triggerNote must be a string');
    } else if (triggerNote.length > 280) {
      errors.push('triggerNote must be 280 characters or fewer');
    }
  }

  if (moodContext !== undefined && moodContext !== null && !MOOD_VALUES.includes(moodContext)) {
    errors.push(`moodContext must be one of ${MOOD_VALUES.join(', ')}`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      screenTimeMinutes,
      triggerNote: triggerNote ? sanitizeText(triggerNote) : null,
      moodContext: moodContext || null
    }
  };
}

module.exports = { validateGoalInput, validateCheckInInput, MOOD_VALUES };
