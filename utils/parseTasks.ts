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
  'remind me to',
  'remind me',
  'i need to',
  'i have to',
  'i want to',
  'i should',
  'don\'t forget to',
  'make sure to',
  'be sure to',
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

  // Remove leading articles
  cleaned = cleaned.replace(/^(a|an|the)\s+/i, '');

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

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
 * Parse tasks using Compromise NLP (fallback)
 * Splits on conjunctions and commas
 */
function parseWithCompromise(transcript: string): string[] {
  console.log('🔄 Using Compromise NLP fallback parser');

  try {
    // Split on common conjunctions and punctuation
    const separators = /\s+(?:and|then|also|plus|,|;)\s+/i;
    let segments = transcript.split(separators);

    // If no separators found, treat whole transcript as one task
    if (segments.length === 1) {
      segments = [transcript];
    }

    // Clean each segment
    const tasks = segments
      .map(cleanTask)
      .filter(task => {
        // Filter out very short or empty tasks
        if (task.length < 3) return false;

        // Filter out common non-task phrases
        const lowerTask = task.toLowerCase();
        if (
          lowerTask === 'and' ||
          lowerTask === 'then' ||
          lowerTask === 'also' ||
          lowerTask === 'plus'
        ) {
          return false;
        }

        return true;
      });

    console.log('✅ Compromise parsed tasks:', tasks);
    return tasks;

  } catch (error) {
    console.error('❌ Compromise parsing error:', error);
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
