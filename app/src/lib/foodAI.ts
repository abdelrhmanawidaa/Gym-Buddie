import type { Lang } from './i18n';

export interface FoodAnalysis {
  name: string;
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  verdict: string;
}

export interface AnalyzeParams {
  apiKey: string;
  /** Raw base64 (no data: prefix) and its media type. */
  imageBase64: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
  lang: Lang;
  remainingCalories: number;
  remainingProtein: number;
  goalCalories: number;
  goalProtein: number;
}

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Short name for the meal as a whole.' },
    items: {
      type: 'array',
      items: { type: 'string' },
      description: 'Each food item visible, with its estimated portion.',
    },
    calories: { type: 'number', description: 'Total estimated calories (kcal).' },
    protein: { type: 'number', description: 'Total estimated protein in grams.' },
    carbs: { type: 'number', description: 'Total estimated carbohydrates in grams.' },
    fat: { type: 'number', description: 'Total estimated fat in grams.' },
    verdict: {
      type: 'string',
      description:
        "Two or three sentences answering whether this meal fits what's left of the day's calorie and protein targets, and what to adjust if not.",
    },
  },
  required: ['name', 'items', 'calories', 'protein', 'carbs', 'fat', 'verdict'],
  additionalProperties: false,
} as const;

function buildPrompt(p: AnalyzeParams): string {
  const langLine =
    p.lang === 'ar'
      ? 'Write every string in the response in Egyptian Arabic.'
      : 'Write every string in the response in English.';

  return [
    'Estimate the nutrition in this meal photo for someone tracking their intake for the gym.',
    '',
    `Their daily targets are ${p.goalCalories} kcal and ${p.goalProtein}g protein.`,
    `So far today they have ${p.remainingCalories} kcal and ${p.remainingProtein}g protein left.`,
    '',
    'Estimate portion sizes from what you can see. Judge whether this meal fits the remaining budget,',
    'paying particular attention to whether it moves them toward their protein target.',
    'Give a single best estimate rather than a range — they can adjust the numbers afterwards.',
    langLine,
  ].join('\n');
}

/**
 * Sends the photo straight from the browser to Anthropic using the user's own key.
 * The SDK is imported lazily so it stays out of the initial bundle for a feature
 * that is optional and rarely the first thing opened.
 */
export async function analyzeFoodPhoto(p: AnalyzeParams): Promise<FoodAnalysis> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');

  const client = new Anthropic({
    apiKey: p.apiKey,
    // The key belongs to the user and never leaves their own device.
    dangerouslyAllowBrowser: true,
  });

  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 8192,
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema: ANALYSIS_SCHEMA },
    },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: p.mediaType, data: p.imageBase64 },
          },
          { type: 'text', text: buildPrompt(p) },
        ],
      },
    ],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('refusal');
  }

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No analysis returned');
  }

  const parsed = JSON.parse(textBlock.text) as FoodAnalysis;
  return {
    name: parsed.name,
    items: Array.isArray(parsed.items) ? parsed.items : [],
    calories: Math.max(0, Math.round(parsed.calories)),
    protein: Math.max(0, Math.round(parsed.protein)),
    carbs: Math.max(0, Math.round(parsed.carbs)),
    fat: Math.max(0, Math.round(parsed.fat)),
    verdict: parsed.verdict,
  };
}

/** Splits a data URL into the raw base64 payload and its media type. */
export function splitDataUrl(dataUrl: string): { base64: string; mediaType: 'image/jpeg' } {
  const comma = dataUrl.indexOf(',');
  return { base64: dataUrl.slice(comma + 1), mediaType: 'image/jpeg' };
}
