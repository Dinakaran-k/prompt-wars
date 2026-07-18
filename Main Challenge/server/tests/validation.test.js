const { validateGoalInput, validateCheckInInput } = require('../services/validatorService');

describe('validateGoalInput', () => {
  test('accepts a valid goal', () => {
    const result = validateGoalInput({ habitLabel: 'Late-night scrolling', dailyTargetMinutes: 60 });
    expect(result.valid).toBe(true);
    expect(result.data.habitLabel).toBe('Late-night scrolling');
    expect(result.data.dailyTargetMinutes).toBe(60);
  });

  test('rejects missing habitLabel', () => {
    const result = validateGoalInput({});
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('habitLabel is required');
  });

  test('rejects a non-positive dailyTargetMinutes', () => {
    const result = validateGoalInput({ habitLabel: 'Scrolling', dailyTargetMinutes: -5 });
    expect(result.valid).toBe(false);
  });

  test('strips HTML tags from habitLabel', () => {
    const result = validateGoalInput({ habitLabel: '<script>alert(1)</script>Doomscrolling' });
    expect(result.valid).toBe(true);
    expect(result.data.habitLabel).not.toContain('<script>');
    expect(result.data.habitLabel).toContain('Doomscrolling');
  });
});

describe('validateCheckInInput', () => {
  test('accepts a valid check-in', () => {
    const result = validateCheckInInput({ screenTimeMinutes: 90, triggerNote: 'bored at night', moodContext: 'BORED' });
    expect(result.valid).toBe(true);
    expect(result.data.screenTimeMinutes).toBe(90);
  });

  test('rejects negative screenTimeMinutes', () => {
    const result = validateCheckInInput({ screenTimeMinutes: -1 });
    expect(result.valid).toBe(false);
  });

  test('rejects a non-integer screenTimeMinutes', () => {
    const result = validateCheckInInput({ screenTimeMinutes: 12.5 });
    expect(result.valid).toBe(false);
  });

  test('rejects an invalid moodContext', () => {
    const result = validateCheckInInput({ screenTimeMinutes: 30, moodContext: 'ANGRY' });
    expect(result.valid).toBe(false);
  });

  test('sanitizes triggerNote', () => {
    const result = validateCheckInInput({ screenTimeMinutes: 30, triggerNote: '<b>late night</b>' });
    expect(result.valid).toBe(true);
    expect(result.data.triggerNote).toBe('late night');
  });
});
