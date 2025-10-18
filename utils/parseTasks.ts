/**
 * parseTasks.ts
 *
 * Hybrid Natural Language Task Parser
 *
 * This utility converts natural speech like "Buy groceries and call mom"
 * into structured task items: ["Buy groceries", "Call mom"]
 *
 * Strategy:
 * 1. Primary: Use OpenAI API (gpt-4o-mini) for intelligent parsing
 * 2. Fallback: Use Compromise NLP library for local parsing
 */

import Constants from 'expo-constants';
import OpenAI from 'openai';
// @ts-ignore - compromise doesn't have complete TypeScript definitions

// Filler words to remove from tasks
const FILLER_WORDS = [
  'please',
  'can you',
  'could you',
  'would you',
  'remind me to',
  'remind me',
  'i need to go',
  'i need to',
  'i have to',
  'i want to',
  'i should',
  'i must',
  'i\'d like to',
  'don\'t forget to',
  'make sure to',
  'be sure to',
  'i also want to',
  'and i need to',
  'and i want to',
  'and i have to',
  'so i need to',
  'so i want to',
];

/**
 * Clean up a task string by removing filler words and capitalizing
 */
function cleanTask(task: string): string {
  let cleaned = task.trim();

  // Remove filler words (case-insensitive)
  FILLER_WORDS.forEach(filler => {
    const regex = new RegExp(`^${filler}\\s+`, 'i');
    cleaned = cleaned.replace(regex, '');
  });

  // Remove common speech fillers
  cleaned = cleaned.replace(/\b(um|uh|er|ah)\b/gi, '');

  // Remove leading articles
  cleaned = cleaned.replace(/^(a|an|the)\s+/i, '');

  // Remove leading "go" if it's redundant (e.g., "go cook" -> "cook")
  cleaned = cleaned.replace(/^go\s+(?=\w+)/i, '');

  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Remove trailing punctuation except periods that are part of abbreviations
  cleaned = cleaned.replace(/[,;!?]+$/, '');

  return cleaned;
}

/**
 * Parse tasks using OpenAI API
 * Returns array of task strings or null if fails
 */
async function parseWithOpenAI(transcript: string): Promise<string[] | null> {
  try {
    const apiKey = Constants.expoConfig?.extra?.OPENAI_API_KEY;

    if (!apiKey || apiKey === '' || apiKey === 'sk-your-api-key-here') {
      console.log('⚠️ No valid OpenAI API key found, using fallback parser');
      return null;
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const prompt = `You are a task parser. Split the following text into short, actionable to-do list items.
Return ONLY a valid JSON array of strings. Each item should be a concise task title (3-8 words).
Do not include explanations, markdown, or any other text - just the JSON array.

Examples:
Input: "Buy groceries and call mom"
Output: ["Buy groceries", "Call mom"]

Input: "Remind me to water the plants, then clean the car and send the report"
Output: ["Water the plants", "Clean the car", "Send the report"]

Input: "${transcript}"
Output:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a task parser that returns only valid JSON arrays of task strings.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      console.log('❌ OpenAI returned empty response');
      return null;
    }

    // Try to parse JSON response
    // Remove markdown code blocks if present
    let jsonString = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const tasks = JSON.parse(jsonString);

    if (!Array.isArray(tasks)) {
      console.log('❌ OpenAI response is not an array');
      return null;
    }

    // Clean and filter tasks
    const cleanedTasks = tasks
      .filter((task): task is string => typeof task === 'string')
      .map(cleanTask)
      .filter(task => task.length > 0);

    console.log('✅ OpenAI parsed tasks:', cleanedTasks);
    return cleanedTasks.length > 0 ? cleanedTasks : null;

  } catch (error) {
    console.log('❌ OpenAI parsing error:', error);
    return null;
  }
}

/**
 * Parse tasks using advanced NLP (fallback)
 * Handles complex sentences with multiple tasks
 */
function parseWithCompromise(transcript: string): string[] {
  console.log('🔄 Using Advanced NLP fallback parser');

  try {
    // Normalize the transcript
    let text = transcript.trim();

    // Replace "I need to" patterns with markers
    text = text.replace(/\b(i need to|i have to|i want to|i should|i must|i'd like to)\b/gi, '|||TASK|||');

    // Replace other task indicators
    text = text.replace(/\b(and i|also i|then i)\b/gi, '|||TASK||| I');

    // Replace standalone conjunctions that indicate new tasks
    text = text.replace(/\s+(and also|and then|and|also|then|plus)\s+/gi, ' |||TASK||| ');

    // Split by the marker
    let segments = text.split('|||TASK|||')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // If no segments found, try simpler splitting
    if (segments.length === 0 || (segments.length === 1 && !text.includes('|||TASK|||'))) {
      // Try splitting on commas and common conjunctions
      segments = text.split(/\s*(?:,\s*and\s*|,\s*|\sand\s+(?=i\s)|and\s+i\s|also\s+i\s|then\s+i\s)\s*/i)
        .filter(s => s.trim().length > 0);
    }

    // If still only one segment and it's long, try to extract action verbs
    if (segments.length === 1 && text.length > 50) {
      // Look for common action verb patterns
      const actionPattern = /\b(go|cook|wash|watch|pick up|get|buy|call|send|complete|finish|review|recharge|clean|write|read|study|exercise|email|message|meet|schedule|plan|organize)\s+[^.!?]*(?=[.!?]|\s+and\s+|\s+i\s+need|\s+i\s+want|\s+also|$)/gi;
      const matches = text.match(actionPattern);

      if (matches && matches.length > 1) {
        segments = matches.map(m => m.trim());
      }
    }

    // Clean and process each segment
    const tasks = segments
      .map(segment => {
        // Remove leading "go" if followed by another verb
        segment = segment.replace(/^go\s+(cook|wash|watch|pick|get|buy|call|send|complete|finish|review|clean|write|read)/i, '$1');

        // Clean the task
        return cleanTask(segment);
      })
      .filter(task => {
        // Filter out very short or empty tasks
        if (task.length < 3) return false;

        // Filter out common non-task phrases
        const lowerTask = task.toLowerCase();
        if (
          lowerTask === 'and' ||
          lowerTask === 'i' ||
          lowerTask === 'then' ||
          lowerTask === 'also' ||
          lowerTask === 'plus' ||
          lowerTask === 'go'
        ) {
          return false;
        }

        return true;
      })
      .map(task => {
        // Further clean up remaining filler patterns
        task = task.replace(/^(go\s+)/, '');
        task = task.replace(/\s+um\s+/gi, ' ');
        task = task.replace(/\s{2,}/g, ' ');

        // Ensure first letter is capitalized
        return task.charAt(0).toUpperCase() + task.slice(1);
      });

    console.log('✅ Advanced NLP parsed tasks:', tasks);
    return tasks;

  } catch (error) {
    console.error('❌ Advanced NLP parsing error:', error);
    // Last resort: return original transcript as single task
    return [cleanTask(transcript)];
  }
}

/**
 * Main parsing function with hybrid approach
 *
 * @param transcript - The transcribed speech text
 * @returns Promise<string[]> - Array of task titles
 */
export async function parseVoiceTasks(transcript: string): Promise<string[]> {
  if (!transcript || transcript.trim().length === 0) {
    throw new Error('Transcript is empty');
  }

  console.log('🎤 Parsing transcript:', transcript);

  // Try OpenAI first
  const openAITasks = await parseWithOpenAI(transcript);

  if (openAITasks && openAITasks.length > 0) {
    return openAITasks;
  }

  // Fallback to Compromise
  const compromiseTasks = parseWithCompromise(transcript);

  if (compromiseTasks.length === 0) {
    // Last resort: return cleaned original transcript as single task
    return [cleanTask(transcript)];
  }

  return compromiseTasks;
}

/**
 * Test the parser with example inputs
 * (For development/debugging only)
 */
export async function testParser() {
  const testCases = [
    "Buy milk and bread, then call mom and send report to James",
    "Remind me to water the plants and clean the car",
    "Please schedule a meeting with the team",
    "I need to finish the report, review the code and send emails",
  ];

  console.log('\n🧪 Testing Voice Task Parser\n');

  for (const test of testCases) {
    console.log(`Input: "${test}"`);
    const tasks = await parseVoiceTasks(test);
    console.log('Output:', tasks);
    console.log('---');
  }
}
