const { parseResponse } = require('../services/geminiService');

describe('geminiService.parseResponse', () => {
  test('parses clean JSON', () => {
    const text = JSON.stringify({ dailyMessage: 'Nice work', nudgePlan: ['Take a walk'] });
    const result = parseResponse(text);
    expect(result.dailyMessage).toBe('Nice work');
    expect(result.nudgePlan).toEqual(['Take a walk']);
  });

  test('strips markdown code fences', () => {
    const text = '```json\n' + JSON.stringify({ dailyMessage: 'Nice work', nudgePlan: ['Take a walk'] }) + '\n```';
    const result = parseResponse(text);
    expect(result.dailyMessage).toBe('Nice work');
  });

  test('throws on garbage input', () => {
    expect(() => parseResponse('not json at all')).toThrow();
  });

  test('throws when dailyMessage is missing', () => {
    const text = JSON.stringify({ nudgePlan: ['Take a walk'] });
    expect(() => parseResponse(text)).toThrow(/dailyMessage/);
  });

  test('throws when nudgePlan is empty', () => {
    const text = JSON.stringify({ dailyMessage: 'Nice work', nudgePlan: [] });
    expect(() => parseResponse(text)).toThrow(/nudgePlan/);
  });

  test('throws when nudgePlan has more than 3 items', () => {
    const text = JSON.stringify({ dailyMessage: 'Nice work', nudgePlan: ['a', 'b', 'c', 'd'] });
    expect(() => parseResponse(text)).toThrow(/nudgePlan/);
  });
});
