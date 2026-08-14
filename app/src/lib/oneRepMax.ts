/** Epley formula estimated one-rep max. Returns the raw weight unit given in. */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight;
  return weight * (1 + reps / 30);
}
