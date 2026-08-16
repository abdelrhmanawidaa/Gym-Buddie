import type { ActivityLevel, NutritionGoalType } from '../db';

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const GOAL_ADJUSTMENT: Record<NutritionGoalType, number> = {
  cut: -0.2,
  maintain: 0,
  bulk: 0.12,
};

/** Protein per kg of bodyweight, by goal. Higher on a cut to protect muscle. */
const PROTEIN_PER_KG: Record<NutritionGoalType, number> = {
  cut: 2.2,
  maintain: 1.8,
  bulk: 2.0,
};

export interface TargetInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female';
  activityLevel: ActivityLevel;
  goalType: NutritionGoalType;
}

export interface TargetResult {
  bmr: number;
  tdee: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
}

/** Mifflin-St Jeor BMR, then TDEE and goal-adjusted macro targets. */
export function calculateTargets(input: TargetInput): TargetResult {
  const { weightKg, heightCm, age, sex, activityLevel, goalType } = input;

  const bmr =
    10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
  const tdee = bmr * ACTIVITY_MULTIPLIER[activityLevel];
  const calories = tdee * (1 + GOAL_ADJUSTMENT[goalType]);

  const protein = PROTEIN_PER_KG[goalType] * weightKg;
  // Fat at 25% of calories, carbs fill whatever's left.
  const fat = (calories * 0.25) / 9;
  const carbs = Math.max(0, (calories - protein * 4 - fat * 9) / 4);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    waterMl: Math.round((weightKg * 35) / 50) * 50,
  };
}
