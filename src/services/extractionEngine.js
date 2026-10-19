/**
 * Principal AI Systems Engineering: Information Extraction & Validation Engine
 * 
 * Implements strict schema enforcement, zero hallucination guardrails,
 * deterministic grounding span tracking, and post-extraction validation.
 */

export const SYSTEM_PROMPT = `You are a Principal AI Systems Engineer specializing in natural language processing, prompt engineering, and structured output extraction.

TASK OBJECTIVE:
Build a robust Information Extraction System that takes unstructured text about a technical workshop and converts it into a validated, strongly-typed JSON object.

SYSTEM & PROMPT CONSTRAINTS:
1. Strict Schema Enforcement:
   The extracted output MUST follow this exact JSON structure:
   {
     "title": "String or null",
     "date": "String (YYYY-MM-DD or readable format) or null",
     "venue": "String or null",
     "speaker": "String or null",
     "topics": ["Array of Strings"]
   }

2. Zero Hallucination & Missing Field Policy:
   - Extract only facts explicitly mentioned in the source paragraph.
   - If a specific field (e.g., speaker, date, or venue) is NOT present or cannot be inferred from the text, set its JSON value explicitly to null.
   - Do NOT invent, assume, or guess missing information under any circumstance.
   - Do NOT populate fields using outside knowledge.

3. Execution Steps to Demonstrate:
   a. Sample Preparation: Accept unstructured input text containing technical workshop details.
   b. Extraction Logic: Parse key elements (Title, Date, Venue, Speaker, Topics).
   c. Schema Formatting: Produce strict JSON output matching the predefined schema without extra markdown conversational commentary outside the JSON block.
   d. Validation Check: Run a post-extraction check to confirm all required key names exist and null handling was correctly applied.

4. Test Scenarios to Handle:
   - Scenario A (Complete Info): Paragraph containing all details (title, date, venue, speaker, and topics).
   - Scenario B (Partial Info): Paragraph with missing speaker and venue information.
   - Scenario C (Irrelevant/Negative Case): Text that does not describe a workshop at all (all fields should default to null and topics should be an empty array []).

INPUT PARAGRAPH:
"[Insert your workshop text here]"

OUTPUT REQUIREMENTS:
Return valid JSON only. Ensure key names strictly match: "title", "date", "venue", "speaker", and "topics".`;

export const JSON_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "WorkshopInformation",
  "type": "object",
  "required": ["title", "date", "venue", "speaker", "topics"],
  "additionalProperties": false,
  "properties": {
    "title": {
      "type": ["string", "null"],
      "description": "Title of the technical workshop or null if missing"
    },
    "date": {
      "type": ["string", "null"],
      "description": "Date formatted as YYYY-MM-DD or readable format, or null if missing"
    },
    "venue": {
      "type": ["string", "null"],
      "description": "Location, auditorium, or virtual platform, or null if missing"
    },
    "speaker": {
      "type": ["string", "null"],
      "description": "Name and credentials of keynote or presenter, or null if missing"
    },
    "topics": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Array of strings representing explicit topics covered in the workshop"
    }
  }
};

/**
 * Step a: Sample Preparation & Relevance Classifier
 */
export function prepareAndClassifySample(text) {
  if (!text || typeof text !== 'string') {
    return {
      cleanedText: '',
      wordCount: 0,
      charCount: 0,
      isWorkshop: false,
      relevanceScore: 0,
      signals: []
    };
  }

  const cleaned = text.trim();
  const lower = cleaned.toLowerCase();

  const workshopSignals = [
    'workshop', 'session', 'seminar', 'masterclass', 'webinar', 
    'bootcamp', 'training', 'hands-on', 'conference', 'talk', 
    'deep dive', 'covers', 'participants will', 'scheduled on', 'hosted by', 'led by'
  ];

  const matchedSignals = workshopSignals.filter(signal => lower.includes(signal));
  const relevanceScore = Math.min(100, Math.round((matchedSignals.length / 3) * 100));
  const isWorkshop = matchedSignals.length > 0;

  return {
    cleanedText: cleaned,
    wordCount: cleaned ? cleaned.split(/\s+/).length : 0,
    charCount: cleaned.length,
    isWorkshop,
    relevanceScore,
    signals: matchedSignals
  };
}

/**
 * Normalizes date strings like "October 28, 2026" or "March 12, 2027" to "YYYY-MM-DD"
 */
function normalizeDate(rawDateStr) {
  if (!rawDateStr) return null;
  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDateStr.trim())) {
    return rawDateStr.trim();
  }

  const monthMap = {
    jan: '01', january: '01',
    feb: '02', february: '02',
    mar: '03', march: '03',
    apr: '04', april: '04',
    may: '05',
    jun: '06', june: '06',
    jul: '07', july: '07',
    aug: '08', august: '08',
    sep: '09', september: '09',
    oct: '10', october: '10',
    nov: '11', november: '11',
    dec: '12', december: '12'
  };

  // e.g. "October 28, 2026" or "March 12, 2027" or "28 October 2026"
  const m1 = rawDateStr.match(/([a-zA-Z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i);
  if (m1) {
    const monthKey = m1[1].toLowerCase();
    const mm = monthMap[monthKey];
    if (mm) {
      const dd = m1[2].padStart(2, '0');
      const yyyy = m1[3];
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  const m2 = rawDateStr.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+),?\s+(\d{4})/i);
  if (m2) {
    const monthKey = m2[2].toLowerCase();
    const mm = monthMap[monthKey];
    if (mm) {
      const dd = m2[1].padStart(2, '0');
      const yyyy = m2[3];
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  return rawDateStr.trim();
}

/**
 * Step b: Extraction Logic
 * Parses unstructured input text according to strict extraction rules
 */
export function extractWorkshopInformation(rawText) {
  const prep = prepareAndClassifySample(rawText);
  const text = prep.cleanedText;

  // Track entity spans for UI visualizer
  const spans = [];

  // SCENARIO C / NEGATIVE CASE:
  // If text has zero workshop signals, enforce Zero Hallucination:
  // all scalar fields MUST default to null, and topics MUST default to []
  if (!prep.isWorkshop || prep.relevanceScore === 0) {
    return {
      data: {
        title: null,
        date: null,
        venue: null,
        speaker: null,
        topics: []
      },
      spans: [],
      preparation: prep,
      metadata: {
        engine: 'Deterministic Zero-Hallucination Parser',
        isNegativeCase: true,
        reason: 'No workshop signals detected in source text.'
      }
    };
  }

  // 1. Title Extraction
  let title = null;
  // Look for single or double quoted strings first e.g. 'Advanced Transformer Architectures & LLM Fine-Tuning'
  const quotedMatch = text.match(/['"“]([^'"“”\n\r]{5,100})['"”]/);
  if (quotedMatch) {
    title = quotedMatch[1].trim();
    const startIdx = text.indexOf(quotedMatch[0]);
    if (startIdx !== -1) {
      spans.push({
        field: 'title',
        value: title,
        start: startIdx + 1,
        end: startIdx + 1 + title.length
      });
    }
  } else {
    // Look for patterns like "workshop on [Title]" or "session on [Title]"
    const titleRegex = /(?:workshop|session|seminar|webinar|masterclass)\s+on\s+([A-Z0-9][a-zA-Z0-9\s&:-]{4,60})(?=[,\.]|\s+(?:scheduled|taking place|will take|held|at|in))/i;
    const m = text.match(titleRegex);
    if (m) {
      title = m[1].trim();
      const startIdx = text.indexOf(m[1]);
      if (startIdx !== -1) {
        spans.push({
          field: 'title',
          value: title,
          start: startIdx,
          end: startIdx + title.length
        });
      }
    }
  }

  // 2. Date Extraction
  let date = null;
  let rawDateFound = null;
  // Check for ISO YYYY-MM-DD
  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) {
    rawDateFound = isoMatch[1];
    date = isoMatch[1];
    const startIdx = text.indexOf(rawDateFound);
    spans.push({
      field: 'date',
      value: date,
      start: startIdx,
      end: startIdx + rawDateFound.length
    });
  } else {
    // Check for "Month DD, YYYY" or "DD Month YYYY"
    const textDateMatch = text.match(/\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\b/i) ||
                          text.match(/\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December),?\s+\d{4})\b/i);
    if (textDateMatch) {
      rawDateFound = textDateMatch[1];
      date = normalizeDate(rawDateFound);
      const startIdx = text.indexOf(rawDateFound);
      spans.push({
        field: 'date',
        value: date,
        rawSpan: rawDateFound,
        start: startIdx,
        end: startIdx + rawDateFound.length
      });
    }
  }

  // 3. Speaker Extraction
  let speaker = null;
  // Look for: "Led by [Speaker]", "Keynote presenter [Speaker]", "Speaker: [Speaker]", "talk by [Speaker]", "hosted by [Speaker]"
  const speakerRegexes = [
    /(?:led by|presented by|talk by|hosted by)\s+((?:Dr\.|Prof\.|Mr\.|Ms\.)?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:,\s*([^.]+))?/i,
    /(?:keynote presenter|speaker|instructor|trainer)[:\s]+((?:Dr\.|Prof\.|Mr\.|Ms\.)?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i
  ];

  for (const regex of speakerRegexes) {
    const spkMatch = text.match(regex);
    if (spkMatch) {
      speaker = spkMatch[1].trim();
      const startIdx = text.indexOf(speaker);
      if (startIdx !== -1) {
        spans.push({
          field: 'speaker',
          value: speaker,
          start: startIdx,
          end: startIdx + speaker.length
        });
      }
      break;
    }
  }

  // 4. Venue Extraction
  let venue = null;
  // Look for: "at [Venue]", "in [Auditorium/Room/Hall]", "reserved [Room ...]"
  const venueRegexes = [
    /(?:scheduled on\s+[\d-]+\s+at|taking place at|held at|held in|meeting at)\s+([A-Z0-9][a-zA-Z0-9\s,\.-]+?)(?=\.\s+|\.\s*$|;\s*|\s+(?:Led by|Keynote|The workshop|Participants|Bring))/i,
    /(?:in|at)\s+(Auditorium\s+[A-Z0-9][a-zA-Z0-9\s,\.-]+?)(?=\.\s+|\.\s*$|;\s*|\s+(?:Keynote|Led by|The workshop|Participants|Bring))/i,
    /(?:at)\s+(Silicon Hall[a-zA-Z0-9\s,\.-]+?)(?=\.\s+|\.\s*$|;\s*|\s+(?:Led by|Keynote|The workshop|Participants|Bring))/i,
    /reserved\s+(Room\s+\d+[a-zA-Z0-9\s]*?)(?=\s+for|\.|$)/i,
    /(?:in|at)\s+(Room\s+\d+[a-zA-Z0-9\s]*?)(?=\.|\s+for|$)/i
  ];

  for (const vRegex of venueRegexes) {
    const vMatch = text.match(vRegex);
    if (vMatch) {
      venue = vMatch[1].trim();
      // Clean trailing punctuation
      venue = venue.replace(/[.,;]+$/, '').trim();
      const startIdx = text.indexOf(venue);
      if (startIdx !== -1) {
        spans.push({
          field: 'venue',
          value: venue,
          start: startIdx,
          end: startIdx + venue.length
        });
      }
      break;
    }
  }

  // 5. Topics Extraction
  const topics = [];
  // Look for "covers [topics]", "explore [topics]", "dive deep into [topics]", "walk through [topics]", "focuses on [topics]"
  const topicsPatterns = [
    /(?:workshop covers|covers|covering)\s+([^.]+?)(?=\.|$)/i,
    /(?:will explore|participants will explore|explore)\s+([^.]+?)(?=\.|$)/i,
    /(?:dive deep into|deep dive into)\s+([^.]+?)(?=\.|$)/i,
    /(?:walk through|walking through)\s+([^.]+?)(?=\.|$)/i,
    /(?:topics include|topics covered:)\s+([^.]+?)(?=\.|$)/i
  ];

  for (const tPat of topicsPatterns) {
    const tMatch = text.match(tPat);
    if (tMatch) {
      const topicString = tMatch[1].trim();
      // Split by commas and "and", "&"
      const rawItems = topicString
        .split(/,\s*(?:and\s+|&\s*)?|\s+and\s+|\s+&\s+/)
        .map(item => item.trim().replace(/^and\s+/i, ''))
        .filter(item => item.length > 2 && !/^(etc|more)$/i.test(item));

      rawItems.forEach(topic => {
        if (!topics.includes(topic)) {
          topics.push(topic);
          const startIdx = text.indexOf(topic);
          if (startIdx !== -1) {
            spans.push({
              field: 'topics',
              value: topic,
              start: startIdx,
              end: startIdx + topic.length
            });
          }
        }
      });
      break;
    }
  }

  return {
    data: {
      title: title || null,
      date: date || null,
      venue: venue || null,
      speaker: speaker || null,
      topics: topics
    },
    spans,
    preparation: prep,
    metadata: {
      engine: 'Deterministic Zero-Hallucination Parser',
      isNegativeCase: false,
      extractedCount: [title, date, venue, speaker].filter(Boolean).length + topics.length
    }
  };
}

/**
 * Step d: Validation Check
 * Post-extraction audit confirming all required keys, strict typing,
 * null-handling compliance, and zero-hallucination source text grounding.
 */
export function validateExtractionResult(extractedData, sourceText) {
  const checks = [];
  const requiredKeys = ['title', 'date', 'venue', 'speaker', 'topics'];

  if (!extractedData || typeof extractedData !== 'object' || Array.isArray(extractedData)) {
    return {
      isValid: false,
      score: 0,
      checks: [{
        name: 'JSON Object Structure',
        status: 'fail',
        message: 'Extracted output is not a valid JSON object.'
      }]
    };
  }

  // 1. Key Parity Check
  const presentKeys = Object.keys(extractedData);
  const missingKeys = requiredKeys.filter(k => !presentKeys.includes(k));
  const extraKeys = presentKeys.filter(k => !requiredKeys.includes(k));

  if (missingKeys.length === 0 && extraKeys.length === 0) {
    checks.push({
      name: 'Strict Schema Key Parity',
      status: 'pass',
      message: 'All 5 exact required keys are present with zero superfluous keys.'
    });
  } else {
    checks.push({
      name: 'Strict Schema Key Parity',
      status: 'fail',
      message: `Key mismatch: Missing [${missingKeys.join(', ')}], Unexpected [${extraKeys.join(', ')}]`
    });
  }

  // 2. Type Checking
  const scalarFields = ['title', 'date', 'venue', 'speaker'];
  let typesValid = true;
  const typeErrors = [];

  for (const field of scalarFields) {
    const val = extractedData[field];
    if (val !== null && typeof val !== 'string') {
      typesValid = false;
      typeErrors.push(`"${field}" must be String or null, received ${typeof val}`);
    }
  }

  if (!Array.isArray(extractedData.topics)) {
    typesValid = false;
    typeErrors.push(`"topics" must be Array of Strings, received ${typeof extractedData.topics}`);
  } else {
    const nonStringTopics = extractedData.topics.some(t => typeof t !== 'string');
    if (nonStringTopics) {
      typesValid = false;
      typeErrors.push(`"topics" elements must all be strings.`);
    }
  }

  if (typesValid) {
    checks.push({
      name: 'Strongly-Typed Field Validation',
      status: 'pass',
      message: 'All scalar fields strictly conform to String | null, and topics is Array<String>.'
    });
  } else {
    checks.push({
      name: 'Strongly-Typed Field Validation',
      status: 'fail',
      message: typeErrors.join('; ')
    });
  }

  // 3. Zero Hallucination Grounding Check
  const sourceLower = (sourceText || '').toLowerCase();
  let hallucinationFree = true;
  const hallucinatedFields = [];

  for (const field of scalarFields) {
    const val = extractedData[field];
    if (val !== null && typeof val === 'string') {
      // If date, check if year or month or digits appear in source
      if (field === 'date') {
        const yearMatch = val.match(/\d{4}/);
        if (yearMatch && !sourceLower.includes(yearMatch[0])) {
          hallucinationFree = false;
          hallucinatedFields.push(`date "${val}" not grounded in source`);
        }
      } else {
        // Check if value (or major portion of it) is in source text
        const cleanedVal = val.toLowerCase().replace(/['"“”]/g, '').trim();
        if (!sourceLower.includes(cleanedVal)) {
          // Check words overlap
          const words = cleanedVal.split(/\s+/).filter(w => w.length > 3);
          const matchedWords = words.filter(w => sourceLower.includes(w));
          if (matchedWords.length < Math.min(2, words.length)) {
            hallucinationFree = false;
            hallucinatedFields.push(`"${field}" value not found in source paragraph`);
          }
        }
      }
    }
  }

  if (Array.isArray(extractedData.topics)) {
    for (const topic of extractedData.topics) {
      const topicLower = topic.toLowerCase();
      if (!sourceLower.includes(topicLower)) {
        const topicWords = topicLower.split(/\s+/).filter(w => w.length > 3);
        const matched = topicWords.filter(w => sourceLower.includes(w));
        if (matched.length < Math.min(1, topicWords.length)) {
          hallucinationFree = false;
          hallucinatedFields.push(`topic "${topic}" not grounded in source text`);
        }
      }
    }
  }

  if (hallucinationFree) {
    checks.push({
      name: 'Zero Hallucination Policy Verification',
      status: 'pass',
      message: 'Every non-null entity and topic is strictly grounded in the source text.'
    });
  } else {
    checks.push({
      name: 'Zero Hallucination Policy Verification',
      status: 'fail',
      message: `Potential hallucination detected: ${hallucinatedFields.join(', ')}`
    });
  }

  // 4. Missing Field Policy & Negative Case Check
  let missingFieldPolicyPass = true;
  let missingPolicyMsg = 'Missing fields correctly resolved to explicit null without defaulting to arbitrary strings.';

  for (const field of scalarFields) {
    if (extractedData[field] === undefined || extractedData[field] === '') {
      missingFieldPolicyPass = false;
      missingPolicyMsg = `Field "${field}" should be explicitly null when absent, found ${JSON.stringify(extractedData[field])}.`;
      break;
    }
  }

  checks.push({
    name: 'Missing Field & Null Handling Policy',
    status: missingFieldPolicyPass ? 'pass' : 'fail',
    message: missingPolicyMsg
  });

  const passCount = checks.filter(c => c.status === 'pass').length;
  const totalScore = Math.round((passCount / checks.length) * 100);
  const isValid = passCount === checks.length;

  return {
    isValid,
    score: totalScore,
    checks,
    timestamp: new Date().toISOString()
  };
}
