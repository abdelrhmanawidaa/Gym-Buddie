export type MuscleKey =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'traps'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs';

export interface MuscleDef {
  key: MuscleKey;
  en: string;
  ar: string;
  /** Typical recovery window in days before training it hard again. */
  recoveryDays: number;
  /** Rough weekly target of working sets, used for coverage warnings. */
  weeklySetTarget: number;
  region: 'upper' | 'lower' | 'core';
}

export const MUSCLES: MuscleDef[] = [
  { key: 'chest', en: 'Chest', ar: 'الصدر', recoveryDays: 2, weeklySetTarget: 12, region: 'upper' },
  { key: 'back', en: 'Back', ar: 'الظهر', recoveryDays: 2, weeklySetTarget: 14, region: 'upper' },
  { key: 'shoulders', en: 'Shoulders', ar: 'الأكتاف', recoveryDays: 2, weeklySetTarget: 12, region: 'upper' },
  { key: 'traps', en: 'Traps', ar: 'الترابيس', recoveryDays: 2, weeklySetTarget: 6, region: 'upper' },
  { key: 'biceps', en: 'Biceps', ar: 'البايسبس', recoveryDays: 2, weeklySetTarget: 10, region: 'upper' },
  { key: 'triceps', en: 'Triceps', ar: 'الترايسبس', recoveryDays: 2, weeklySetTarget: 10, region: 'upper' },
  { key: 'forearms', en: 'Forearms', ar: 'الساعد', recoveryDays: 1, weeklySetTarget: 6, region: 'upper' },
  { key: 'quads', en: 'Quads', ar: 'أمامي الفخذ', recoveryDays: 3, weeklySetTarget: 12, region: 'lower' },
  { key: 'hamstrings', en: 'Hamstrings', ar: 'خلفي الفخذ', recoveryDays: 3, weeklySetTarget: 10, region: 'lower' },
  { key: 'glutes', en: 'Glutes', ar: 'المؤخرة', recoveryDays: 3, weeklySetTarget: 10, region: 'lower' },
  { key: 'calves', en: 'Calves', ar: 'السمانة', recoveryDays: 1, weeklySetTarget: 10, region: 'lower' },
  { key: 'abs', en: 'Abs / Core', ar: 'البطن', recoveryDays: 1, weeklySetTarget: 10, region: 'core' },
];

export const MUSCLE_BY_KEY = new Map<string, MuscleDef>(MUSCLES.map((m) => [m.key, m]));

export function muscleName(key: string, lang: 'en' | 'ar'): string {
  const def = MUSCLE_BY_KEY.get(key);
  if (!def) return key;
  return lang === 'ar' ? def.ar : def.en;
}

/** Maps the old free-text muscleGroup values from v1/v2 onto canonical keys. */
export function legacyMuscleToKey(legacy: string): MuscleKey {
  const s = legacy.toLowerCase();
  if (s.includes('chest')) return 'chest';
  if (s.includes('rear delt')) return 'shoulders';
  if (s.includes('back')) return 'back';
  if (s.includes('trap')) return 'traps';
  if (s.includes('shoulder')) return 'shoulders';
  if (s.includes('bicep')) return 'biceps';
  if (s.includes('tricep')) return 'triceps';
  if (s.includes('forearm')) return 'forearms';
  if (s.includes('quad')) return 'quads';
  if (s.includes('hamstring')) return 'hamstrings';
  if (s.includes('glute')) return 'glutes';
  if (s.includes('calf') || s.includes('calves')) return 'calves';
  if (s.includes('core') || s.includes('abs')) return 'abs';
  if (s.includes('leg')) return 'quads';
  return 'chest';
}
