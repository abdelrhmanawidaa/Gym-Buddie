import type { MuscleKey } from './muscles';

export type BodyView = 'front' | 'back';

/** Colour ramp from untrained through to elite. */
export const LEVEL_COLORS = ['#253243', '#1d5a70', '#0e7490', '#0d9488', '#10b981', '#f59e0b'];

/** Muscles only drawn on the back view of the body map. */
const BACK_ONLY: MuscleKey[] = ['back', 'triceps', 'glutes', 'hamstrings'];

/** Picks whichever view (front/back) shows the most of the given muscles. */
export function pickBodyView(muscles: MuscleKey[]): BodyView {
  const backCount = muscles.filter((m) => BACK_ONLY.includes(m)).length;
  const frontCount = muscles.length - backCount;
  return backCount > frontCount ? 'back' : 'front';
}

export interface BodyMapProps {
  view: BodyView;
  /** Development level 0-5 per muscle; drives both fill colour and bulge. */
  levels?: Partial<Record<MuscleKey, number>>;
  /** Muscles to outline (e.g. the ones an exercise trains). */
  highlight?: MuscleKey[];
  /** Muscles to outline in a secondary style (assisting muscles). */
  highlightSecondary?: MuscleKey[];
  selected?: MuscleKey | null;
  onSelect?: (m: MuscleKey) => void;
  className?: string;
}
