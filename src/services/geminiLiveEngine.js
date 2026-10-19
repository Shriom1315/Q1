import { SYSTEM_PROMPT } from './extractionEngine';

/**
 * Live LLM extraction via Google Gemini API
 * Calls Gemini with strict JSON schema output formatting and zero-hallucination system prompt.
 */
export async function extractWithGemini(apiKey, text, model = 'gemini-1.5-flash') {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('API key is required for live LLM extraction. Enter your Gemini API key in settings.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Extract structured workshop information from the following text strictly complying with the constraints:\n\nINPUT PARAGRAPH:\n"${text}"\n\nReturn strict JSON matching: {"title": String|null, "date": String|null, "venue": String|null, "speaker": String|null, "topics": string[]}`
          }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        {
          text: SYSTEM_PROMPT
        }
      ]
    },
    generationConfig: {
      temperature: 0.0,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', nullable: true },
          date: { type: 'STRING', nullable: true },
          venue: { type: 'STRING', nullable: true },
          speaker: { type: 'STRING', nullable: true },
          topics: {
            type: 'ARRAY',
            items: { type: 'STRING' }
          }
        },
        required: ['title', 'date', 'venue', 'speaker', 'topics']
      }
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedMessage = response.statusText;
    try {
      const parsed = JSON.parse(errorBody);
      parsedMessage = parsed.error?.message || response.statusText;
    } catch {
      parsedMessage = errorBody;
    }
    throw new Error(`Gemini API Error (${response.status}): ${parsedMessage}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('No content returned from Gemini model.');
  }

  // Parse JSON
  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsedJson = JSON.parse(cleaned);

  return parsedJson;
}
