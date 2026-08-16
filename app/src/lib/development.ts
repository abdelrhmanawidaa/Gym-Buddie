import type { Exercise, SetLog } from '../db';
import { MUSCLE_ANATOMY } from './anatomy';
import { MUSCLES, type MuscleKey } from './muscles';
import { estimate1RM } from './oneRepMax';

export interface MuscleDevelopment {
  muscle: MuscleKey;
  /** 0 (untrained) to 5 (elite). */
  level: number;
  /** Progress toward the next level, 0-1. */
  progress: number;
  /** Best estimated 1RM seen for this muscle, in kg. */
  best1RM: number | null;
  /** best1RM relative to bodyweight, when both are known. */
  ratio: number | null;
  /** Total working sets ever logged. */
  totalSets: number;
}

/** Women's strength standards run roughly 70% of men's on upper body, 80% lower. */
function sexFactor(sex: 'male' | 'female' | undefined, muscle: MuscleKey): number {
  if (sex !== 'female') return 1;
  const def = MUSCLES.find((m) => m.key === muscle);
  return def?.region === 'lower' ? 0.8 : 0.7;
}

/**
 * Muscles trained mostly without external load (abs) can't use a strength
 * ratio, so they level up on accumulated working sets instead.
 */
const SET_THRESHOLDS = [20, 60, 140, 280, 500];

export function computeDevelopment(
  exercises: Exercise[],
  setLogs: SetLog[],
  bodyweightKg: number | undefined,
  sex: 'male' | 'female' | undefined,
): MuscleDevelopment[] {
  const exById = new Map(exercises.map((e) => [e.id!, e]));

  const best = new Map<MuscleKey, number>();
  const sets = new Map<MuscleKey, number>();

  for (const log of setLogs) {
    const muscle = exById.get(log.exerciseId)?.muscle;
    if (!muscle) continue;
    if (log.setType === 'warmup') continue;

    sets.set(muscle, (sets.get(muscle) ?? 0) + 1);
    if (log.weight > 0 && log.reps > 0) {
      const oneRM = estimate1RM(log.weight, log.reps);
      if (oneRM > (best.get(muscle) ?? 0)) best.set(muscle, oneRM);
    }
  }

  return MUSCLES.map((def) => {
    const muscle = def.key;
    const totalSets = sets.get(muscle) ?? 0;
    const best1RM = best.get(muscle) ?? null;
    const ratios = MUSCLE_ANATOMY[muscle].strengthRatios;

    let level = 0;
    let progress = 0;
    let ratio: number | null = null;

    if (ratios && best1RM != null && bodyweightKg) {
      ratio = best1RM / bodyweightKg;
      const scaled = ratios.map((r) => r * sexFactor(sex, muscle));
      const idx = scaled.findIndex((threshold) => ratio! < threshold);
      if (idx === -1) {
        level = 5;
        progress = 1;
      } else {
        level = idx;
        const floor = idx === 0 ? 0 : scaled[idx - 1];
        progress = Math.max(0, Math.min(1, (ratio - floor) / (scaled[idx] - floor)));
      }
    } else {
      // No bodyweight or no loaded lifts — fall back to accumulated volume.
      const idx = SET_THRESHOLDS.findIndex((threshold) => totalSets < threshold);
      if (idx === -1) {
        level = 5;
        progress = 1;
      } else {
        level = idx;
        const floor = idx === 0 ? 0 : SET_THRESHOLDS[idx - 1];
        progress = Math.max(0, Math.min(1, (totalSets - floor) / (SET_THRESHOLDS[idx] - floor)));
      }
    }

    // Never show a level above zero before any real work has been logged.
    if (totalSets === 0) {
      level = 0;
      progress = 0;
    }

    return { muscle, level, progress, best1RM, ratio, totalSets };
  });
}

/** Whole-physique level: the average across every muscle group. */
export function overallLevel(dev: MuscleDevelopment[]): { level: number; progress: number } {
  if (dev.length === 0) return { level: 0, progress: 0 };
  const avg = dev.reduce((sum, d) => sum + d.level + d.progress, 0) / dev.length;
  return { level: Math.floor(avg), progress: avg - Math.floor(avg) };
}

export const LEVEL_NAME_KEYS = [
  'level.untrained',
  'level.novice',
  'level.beginner',
  'level.intermediate',
  'level.advanced',
  'level.elite',
] as const;
