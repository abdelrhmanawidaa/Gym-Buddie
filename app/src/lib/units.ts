export type Unit = 'kg' | 'lb';

const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

/** Convert a canonical kg value to the display unit, rounded to 1 decimal. */
export function displayWeight(kg: number, unit: Unit): number {
  const val = unit === 'lb' ? kgToLb(kg) : kg;
  return Math.round(val * 10) / 10;
}

/** Convert a user-entered value in the display unit back to canonical kg. */
export function toKg(value: number, unit: Unit): number {
  return unit === 'lb' ? lbToKg(value) : value;
}

export function unitLabel(unit: Unit): string {
  return unit;
}
