export interface PlateResult {
  perSide: number[];
  achievedWeight: number;
  remainder: number;
}

/** Greedy plate breakdown for one side of a barbell, in whatever unit barWeight/plates are given. */
export function calculatePlates(targetWeight: number, barWeight: number, availablePlates: number[]): PlateResult {
  const perSideTarget = (targetWeight - barWeight) / 2;
  const sorted = [...availablePlates].sort((a, b) => b - a);
  const perSide: number[] = [];
  let remaining = perSideTarget;

  if (remaining > 0) {
    for (const plate of sorted) {
      while (remaining + 1e-6 >= plate) {
        perSide.push(plate);
        remaining -= plate;
      }
    }
  }

  const achievedWeight = barWeight + perSide.reduce((s, p) => s + p, 0) * 2;
  return { perSide, achievedWeight, remainder: Math.max(remaining, 0) };
}
