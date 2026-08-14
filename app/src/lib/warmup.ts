export interface WarmupSet {
  pct: number;
  weight: number;
  reps: number;
}

const STEPS: { pct: number; reps: number }[] = [
  { pct: 0.4, reps: 8 },
  { pct: 0.6, reps: 5 },
  { pct: 0.8, reps: 3 },
];

/** Suggested warm-up sets leading into a target working weight, rounded to nearest 2.5. */
export function warmupSets(targetWeight: number): WarmupSet[] {
  if (targetWeight <= 0) return [];
  return STEPS.map(({ pct, reps }) => ({
    pct: Math.round(pct * 100),
    weight: Math.round((targetWeight * pct) / 2.5) * 2.5,
    reps,
  })).filter((s) => s.weight > 0);
}
