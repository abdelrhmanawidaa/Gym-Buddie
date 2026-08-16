import type { Lang } from './i18n';
import { legacyMuscleToKey, type MuscleKey } from './muscles';

export interface MachineAnalysis {
  name: string;
  primaryMuscles: MuscleKey[];
  secondaryMuscles: MuscleKey[];
  steps: string[];
  formCues: string[];
  mistakes: string[];
}

export interface AnalyzeMachineParams {
  apiKey: string;
  /** Raw base64 (no data: prefix) and its media type. */
  imageBase64: string;
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
  lang: Lang;
}

const MACHINE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Short name of the gym machine or equipment shown.' },
    primaryMuscles: {
      type: 'array',
      items: { type: 'string' },
      description:
        'The main muscle groups this machine trains, using plain English names like "chest", "back", "shoulders", "biceps", "triceps", "quads", "hamstrings", "glutes", "calves", "abs", "traps", "forearms".',
    },
    secondaryMuscles: {
      type: 'array',
      items: { type: 'string' },
      description: 'Muscle groups this machine works as assisting/secondary muscles, same naming scheme as primaryMuscles.',
    },
    steps: {
      type: 'array',
      items: { type: 'string' },
      description: 'Step-by-step instructions for setting up and performing a rep on this machine, in order.',
    },
    formCues: {
      type: 'array',
      items: { type: 'string' },
      description: 'Short form cues to keep in mind while using it (posture, breathing, range of motion).',
    },
    mistakes: {
      type: 'array',
      items: { type: 'string' },
      description: 'Common mistakes people make on this machine and how to avoid them.',
    },
  },
  required: ['name', 'primaryMuscles', 'secondaryMuscles', 'steps', 'formCues', 'mistakes'],
  additionalProperties: false,
} as const;

function buildPrompt(lang: Lang): string {
  const langLine =
    lang === 'ar'
      ? 'Write every string in the response in Egyptian Arabic.'
      : 'Write every string in the response in English.';

  return [
    'Identify the gym machine or piece of equipment in this photo for someone at the gym who wants to use it correctly.',
    'Name it, say which muscles it primarily trains and which it works as secondary/assisting muscles,',
    'give clear step-by-step instructions for using it safely and effectively, short form cues, and common mistakes to avoid.',
    "If it's not gym equipment, do your best guess based on what's visible and keep the answer short.",
    langLine,
  ].join('\n');
}

/**
 * Sends the photo straight from the browser to Anthropic using the user's own key.
 * The SDK is imported lazily so it stays out of the initial bundle for a feature
 * that is optional and rarely the first thing opened.
 */
export async function analyzeMachinePhoto(p: AnalyzeMachineParams): Promise<MachineAnalysis> {
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
      format: { type: 'json_schema', schema: MACHINE_SCHEMA },
    },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: p.mediaType, data: p.imageBase64 },
          },
          { type: 'text', text: buildPrompt(p.lang) },
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

  const parsed = JSON.parse(textBlock.text) as {
    name: string;
    primaryMuscles: string[];
    secondaryMuscles: string[];
    steps: string[];
    formCues: string[];
    mistakes: string[];
  };

  const toKeys = (names: string[]): MuscleKey[] => {
    const keys = new Set<MuscleKey>();
    for (const n of names ?? []) keys.add(legacyMuscleToKey(n));
    return [...keys];
  };

  const primaryMuscles = toKeys(parsed.primaryMuscles);
  const secondaryMuscles = toKeys(parsed.secondaryMuscles).filter((m) => !primaryMuscles.includes(m));

  return {
    name: parsed.name,
    primaryMuscles,
    secondaryMuscles,
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    formCues: Array.isArray(parsed.formCues) ? parsed.formCues : [],
    mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
  };
}
