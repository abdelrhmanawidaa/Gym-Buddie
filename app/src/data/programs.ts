import type { MuscleKey } from '../lib/muscles';

export interface ProgramDay {
  name: string;
  nameAr: string;
  /** Muscles trained this day, in the order they should appear. */
  muscles: MuscleKey[];
  /** How many exercises to pull in per muscle for this day. */
  exercisesPerMuscle: number;
}

export interface ProgramTemplate {
  id: string;
  name: string;
  nameAr: string;
  daysPerWeek: number;
  descriptionEn: string;
  descriptionAr: string;
  bestForEn: string;
  bestForAr: string;
  days: ProgramDay[];
}

const UPPER: MuscleKey[] = ['chest', 'back', 'shoulders', 'traps', 'biceps', 'triceps', 'forearms'];
const LOWER: MuscleKey[] = ['quads', 'hamstrings', 'glutes', 'calves', 'abs'];
const PUSH: MuscleKey[] = ['chest', 'shoulders', 'triceps'];
const PULL: MuscleKey[] = ['back', 'traps', 'biceps', 'forearms'];
const LEGS: MuscleKey[] = ['quads', 'hamstrings', 'glutes', 'calves', 'abs'];
const ALL: MuscleKey[] = [...UPPER, ...LOWER];

export const PROGRAMS: ProgramTemplate[] = [
  {
    id: 'full-body-3',
    name: 'Full Body × 3',
    nameAr: 'فل بادي × 3',
    daysPerWeek: 3,
    descriptionEn: 'Every muscle, every session — three full-body days a week.',
    descriptionAr: 'كل عضلة بتشتغل كل حصة — 3 أيام فل بادي في الأسبوع.',
    bestForEn: 'Beginners, or anyone who can only make it to the gym 3 times a week.',
    bestForAr: 'المبتدئين، أو أي حد مش هيقدر يروح الجيم غير 3 مرات في الأسبوع.',
    days: [
      { name: 'Full Body A', nameAr: 'فل بادي أ', muscles: ALL, exercisesPerMuscle: 1 },
      { name: 'Full Body B', nameAr: 'فل بادي ب', muscles: ALL, exercisesPerMuscle: 1 },
      { name: 'Full Body C', nameAr: 'فل بادي ج', muscles: ALL, exercisesPerMuscle: 1 },
    ],
  },
  {
    id: 'upper-lower-4',
    name: 'Upper / Lower × 4',
    nameAr: 'أبر/لور × 4',
    daysPerWeek: 4,
    descriptionEn: 'Two upper-body days and two lower-body days — every muscle trained twice.',
    descriptionAr: 'يومين علوي ويومين سفلي — كل عضلة بتتدرب مرتين في الأسبوع.',
    bestForEn: 'The best all-round pick for most people — great frequency without too much time in the gym.',
    bestForAr: 'أحسن اختيار متوازن لمعظم الناس — تكرار كويس من غير ما تقعد وقت طويل في الجيم.',
    days: [
      { name: 'Upper A', nameAr: 'علوي أ', muscles: UPPER, exercisesPerMuscle: 1 },
      { name: 'Lower A', nameAr: 'سفلي أ', muscles: LOWER, exercisesPerMuscle: 2 },
      { name: 'Upper B', nameAr: 'علوي ب', muscles: UPPER, exercisesPerMuscle: 1 },
      { name: 'Lower B', nameAr: 'سفلي ب', muscles: LOWER, exercisesPerMuscle: 2 },
    ],
  },
  {
    id: 'upper-lower-ppl-5',
    name: 'Upper / Lower / PPL × 5',
    nameAr: 'أبر/لور/بوش-بُل-ليجز × 5',
    daysPerWeek: 5,
    descriptionEn: 'Upper, Lower, Push, Pull, Legs — a hybrid that keeps every muscle at twice a week.',
    descriptionAr: 'علوي، سفلي، بوش، بُل، ليجز — تقسيمة مختلطة بتخلي كل عضلة تتدرب مرتين في الأسبوع.',
    bestForEn: 'People with 5 days who still want every muscle hit twice, not once.',
    bestForAr: 'اللي عنده 5 أيام لكن لسه عايز كل عضلة تتدرب مرتين مش مرة.',
    days: [
      { name: 'Upper', nameAr: 'علوي', muscles: UPPER, exercisesPerMuscle: 1 },
      { name: 'Lower', nameAr: 'سفلي', muscles: LOWER, exercisesPerMuscle: 2 },
      { name: 'Push', nameAr: 'بوش', muscles: PUSH, exercisesPerMuscle: 2 },
      { name: 'Pull', nameAr: 'بُل', muscles: PULL, exercisesPerMuscle: 2 },
      { name: 'Legs', nameAr: 'ليجز', muscles: LEGS, exercisesPerMuscle: 2 },
    ],
  },
  {
    id: 'ppl-6',
    name: 'Push / Pull / Legs × 2',
    nameAr: 'بوش/بُل/ليجز × 2',
    daysPerWeek: 6,
    descriptionEn: 'Push, Pull, Legs run twice through the week for maximum volume and frequency.',
    descriptionAr: 'بوش، بُل، ليجز بتتكرر مرتين في الأسبوع لأقصى حجم تمرين وتكرار.',
    bestForEn: 'Experienced lifters with 6 days to spare who want serious volume.',
    bestForAr: 'اللي عنده خبرة وعنده 6 أيام فاضية وعايز حجم تمرين كبير.',
    days: [
      { name: 'Push A', nameAr: 'بوش أ', muscles: PUSH, exercisesPerMuscle: 2 },
      { name: 'Pull A', nameAr: 'بُل أ', muscles: PULL, exercisesPerMuscle: 2 },
      { name: 'Legs A', nameAr: 'ليجز أ', muscles: LEGS, exercisesPerMuscle: 2 },
      { name: 'Push B', nameAr: 'بوش ب', muscles: PUSH, exercisesPerMuscle: 2 },
      { name: 'Pull B', nameAr: 'بُل ب', muscles: PULL, exercisesPerMuscle: 2 },
      { name: 'Legs B', nameAr: 'ليجز ب', muscles: LEGS, exercisesPerMuscle: 2 },
    ],
  },
  {
    id: 'ppl-3',
    name: 'Push / Pull / Legs × 1',
    nameAr: 'بوش/بُل/ليجز × 1',
    daysPerWeek: 3,
    descriptionEn: 'Push, Pull, Legs once each — a classic 3-day split.',
    descriptionAr: 'بوش، بُل، ليجز مرة واحدة لكل واحد — تقسيمة 3 أيام كلاسيكية.',
    bestForEn: 'A lighter 3-day option if full-body sessions feel too long — but each muscle only gets trained once a week.',
    bestForAr: 'اختيار أخف لو حصص الفل بادي حاسسك طويلة — بس كل عضلة هتتدرب مرة واحدة بس في الأسبوع.',
    days: [
      { name: 'Push', nameAr: 'بوش', muscles: PUSH, exercisesPerMuscle: 3 },
      { name: 'Pull', nameAr: 'بُل', muscles: PULL, exercisesPerMuscle: 3 },
      { name: 'Legs', nameAr: 'ليجز', muscles: LEGS, exercisesPerMuscle: 3 },
    ],
  },
  {
    id: 'bro-split-5',
    name: 'Bro Split × 5',
    nameAr: 'برو سبليت × 5',
    daysPerWeek: 5,
    descriptionEn: 'One muscle group per day — Chest, Back, Shoulders, Legs, Arms.',
    descriptionAr: 'عضلة واحدة كل يوم — صدر، ضهر، كتف، رجل، دراع.',
    bestForEn: 'The classic bodybuilder split — fun and focused, but every muscle only trains once a week, which caps how fast you can progress.',
    bestForAr: 'التقسيمة الكلاسيكية لكمال الأجسام — ممتعة ومركّزة، بس كل عضلة بتتدرب مرة واحدة بس في الأسبوع وده بيبطّئ تقدمك.',
    days: [
      { name: 'Chest', nameAr: 'صدر', muscles: ['chest'], exercisesPerMuscle: 4 },
      { name: 'Back', nameAr: 'ضهر', muscles: ['back', 'traps'], exercisesPerMuscle: 3 },
      { name: 'Shoulders', nameAr: 'كتف', muscles: ['shoulders'], exercisesPerMuscle: 4 },
      { name: 'Legs', nameAr: 'رجل', muscles: LEGS, exercisesPerMuscle: 2 },
      { name: 'Arms', nameAr: 'دراع', muscles: ['biceps', 'triceps', 'forearms'], exercisesPerMuscle: 3 },
    ],
  },
];

/** How many days a week each muscle is trained under a given program. */
export function weeklyFrequency(program: ProgramTemplate): Partial<Record<MuscleKey, number>> {
  const freq: Partial<Record<MuscleKey, number>> = {};
  for (const day of program.days) {
    for (const m of day.muscles) freq[m] = (freq[m] ?? 0) + 1;
  }
  return freq;
}

function minFrequency(p: ProgramTemplate): number {
  const vals = Object.values(weeklyFrequency(p)) as number[];
  return vals.length ? Math.min(...vals) : 0;
}

/**
 * The best-matching program for how many days a week someone can train.
 * Training each muscle at least twice a week beats once, so among the
 * programs that fit the available days we prefer ones hitting that bar —
 * and within those, the one that makes fullest use of the days available.
 */
export function recommendProgram(daysAvailable: number): ProgramTemplate {
  const fitting = PROGRAMS.filter((p) => p.daysPerWeek <= daysAvailable);
  const pool = fitting.length > 0 ? fitting : [...PROGRAMS].sort((a, b) => a.daysPerWeek - b.daysPerWeek).slice(0, 1);

  const goodFreq = pool.filter((p) => minFrequency(p) >= 2);
  const ranked = goodFreq.length > 0 ? goodFreq : pool;

  return [...ranked].sort((a, b) => {
    const dayDiff = b.daysPerWeek - a.daysPerWeek;
    if (dayDiff !== 0) return dayDiff;
    return minFrequency(b) - minFrequency(a);
  })[0];
}
