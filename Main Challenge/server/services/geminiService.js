const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiUnavailableError extends Error {}

const TIMEOUT_MS = 15000;

function buildPrompt({ habitLabel, dailyTargetMinutes, todayCheckIn, recentCheckIns }, strict) {
  const historyLines = recentCheckIns.length
    ? recentCheckIns
        .map((c) => `- ${c.date}: ${c.screenTimeMinutes} min${c.triggerNote ? `, trigger: "${c.triggerNote}"` : ''}${c.moodContext ? `, mood: ${c.moodContext}` : ''}`)
        .join('\n')
    : '(no prior check-ins yet — this is their first one)';

  const targetLine = dailyTargetMinutes
    ? `Their daily target is ${dailyTargetMinutes} minutes.`
    : 'They have not set a specific daily target yet.';

  const strictNote = strict
    ? '\nIMPORTANT: Your previous response was invalid. Respond with ONLY the JSON object below, no markdown, no extra text.\n'
    : '';

  return `
You are a warm, supportive, non-judgmental digital-wellbeing coach helping
someone reset a screen-time habit: "${habitLabel}". ${targetLine}
${strictNote}
Recent real check-in history (most recent first):
${historyLines}

Today's new check-in: ${todayCheckIn.screenTimeMinutes} minutes${todayCheckIn.triggerNote ? `, trigger: "${todayCheckIn.triggerNote}"` : ''}${todayCheckIn.moodContext ? `, mood: ${todayCheckIn.moodContext}` : ''}.

Write a short daily coaching message that genuinely reacts to the real
pattern above (reference a real trend or a repeated trigger if one exists
in the history — do not write something generic that could apply to
anyone). Tone: encouraging, never shaming, never guilt-based. Do not make
any clinical or diagnostic claims. Then suggest 1-3 concrete, specific
alternative actions tailored to today's actual trigger/mood.

Respond with EXACTLY this JSON structure and nothing else:
{
  "dailyMessage": "2-3 sentence personalized coaching message",
  "nudgePlan": ["specific actionable tip", "another tip if relevant"]
}
`;
}

function parseResponse(responseText) {
  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch (e) {
    const cleaned = responseText.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(cleaned);
  }

  if (typeof parsed.dailyMessage !== 'string' || parsed.dailyMessage.trim().length === 0) {
    throw new Error('Missing or empty dailyMessage in Gemini response');
  }
  if (!Array.isArray(parsed.nudgePlan) || parsed.nudgePlan.length === 0 || parsed.nudgePlan.length > 3) {
    throw new Error('nudgePlan must be an array of 1-3 items');
  }
  if (!parsed.nudgePlan.every((tip) => typeof tip === 'string' && tip.trim().length > 0)) {
    throw new Error('nudgePlan items must be non-empty strings');
  }

  return {
    dailyMessage: parsed.dailyMessage.trim(),
    nudgePlan: parsed.nudgePlan.map((tip) => tip.trim())
  };
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API key is not configured on the server. Please add GEMINI_API_KEY in server/.env');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const result = await Promise.race([
    model.generateContent(prompt),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API request timed out')), TIMEOUT_MS))
  ]);

  const responseText = result && result.response && result.response.text();
  if (!responseText) {
    throw new Error('Empty response received from Gemini API');
  }

  return parseResponse(responseText);
}

/**
 * Generates adaptive daily coaching. Retries once with a stricter prompt on
 * failure; throws GeminiUnavailableError if both attempts fail, so the
 * caller can persist an honest UNAVAILABLE state instead of fabricating one.
 */
async function generateCoaching(context) {
  try {
    return await callGemini(buildPrompt(context, false));
  } catch (firstError) {
    console.error('Gemini call failed (attempt 1):', firstError.message);
    try {
      return await callGemini(buildPrompt(context, true));
    } catch (secondError) {
      console.error('Gemini call failed (attempt 2):', secondError.message);
      throw new GeminiUnavailableError('Gemini coaching is temporarily unavailable');
    }
  }
}

module.exports = { generateCoaching, GeminiUnavailableError, parseResponse };
