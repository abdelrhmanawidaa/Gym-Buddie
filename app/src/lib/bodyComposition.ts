export function bmi(weightKg: number, heightCm: number): number | null {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function bmiCategory(value: number): string {
  if (value < 18.5) return 'Underweight';
  if (value < 25) return 'Normal';
  if (value < 30) return 'Overweight';
  return 'Obese';
}

/** US Navy method body fat %. Measurements in cm. Hip only required for females. */
export function navyBodyFat(params: {
  sex: 'male' | 'female';
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
}): number | null {
  const { sex, heightCm, neckCm, waistCm, hipCm } = params;
  if (!heightCm || !neckCm || !waistCm) return null;
  if (sex === 'female' && !hipCm) return null;

  let bfp: number;
  if (sex === 'male') {
    if (waistCm - neckCm <= 0) return null;
    bfp = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  } else {
    const combined = waistCm + (hipCm ?? 0) - neckCm;
    if (combined <= 0) return null;
    bfp = 495 / (1.29579 - 0.35004 * Math.log10(combined) + 0.221 * Math.log10(heightCm)) - 450;
  }

  if (!Number.isFinite(bfp) || bfp <= 0 || bfp > 75) return null;
  return Math.round(bfp * 10) / 10;
}
