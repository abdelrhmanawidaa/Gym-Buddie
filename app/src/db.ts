import Dexie, { type EntityTable } from 'dexie';
import { EXERCISE_LIBRARY } from './data/exerciseLibrary';
import { legacyMuscleToKey, type MuscleKey } from './lib/muscles';

export interface Exercise {
  id?: number;
  name: string;
  nameAr?: string;
  /** Legacy free-text group kept for backwards compatibility. */
  muscleGroup: string;
  /** Canonical muscle key (v3+). */
  muscle?: MuscleKey;
  machine: string;
  machineAr?: string;
  notes?: string;
  targetSets: number;
  targetRepsLow: number;
  targetRepsHigh: number;
}

/** The exercise/machine the user has chosen as their go-to for a muscle. */
export interface MusclePref {
  id?: number;
  muscle: MuscleKey;
  preferredExerciseId: number;
}

export interface PlanDayExercise {
  exerciseId: number;
  sets: number;
  repsLow: number;
  repsHigh: number;
}

export interface PlanDay {
  id?: number;
  order: number;
  name: string;
  nameAr?: string;
  exercises: PlanDayExercise[];
}

/** Sentinel planDayId for ad-hoc sessions started from a muscle rather than a plan day. */
export const AD_HOC_PLAN_DAY = -1;

export interface WorkoutSession {
  id?: number;
  date: string; // yyyy-mm-dd
  startedAt: number;
  finishedAt?: number;
  planDayId: number;
  planDayName: string;
  /** Arabic label for ad-hoc/muscle sessions, so history reads right in both languages. */
  planDayNameAr?: string;
  /** Exercise list for ad-hoc sessions (planDayId === AD_HOC_PLAN_DAY). */
  adHocExercises?: PlanDayExercise[];
  completed: boolean;
  notes?: string;
}

export type SetType = 'warmup' | 'working' | 'failure' | 'dropset';

export interface SetLog {
  id?: number;
  sessionId: number;
  exerciseId: number;
  setNumber: number;
  reps: number;
  weight: number;
  date: string;
  setType?: SetType;
  rpe?: number;
}

export interface BodyStat {
  id?: number;
  date: string;
  weight?: number;
  neck?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
}

export interface BodyPhoto {
  id?: number;
  date: string;
  angle: 'front' | 'side' | 'back';
  dataUrl: string;
  createdAt: number;
}

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodLog {
  id?: number;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  meal?: Meal;
  createdAt: number;
}

export interface FoodPreset {
  id?: number;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
}

export interface WaterLog {
  id?: number;
  date: string;
  ml: number;
  createdAt: number;
}

export interface NutritionGoal {
  id?: number;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  waterMl?: number;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
export type NutritionGoalType = 'cut' | 'maintain' | 'bulk';

export interface Settings {
  id?: number;
  lang: 'en' | 'ar';
  units: 'kg' | 'lb';
  restTimerDefaultSec: number;
  barWeightKg: number;
  availablePlatesKg: number[];
  heightCm?: number;
  sex?: 'male' | 'female';
  age?: number;
  activityLevel?: ActivityLevel;
  goalType?: NutritionGoalType;
  /** Optional Anthropic API key for the food-photo analyser. Stored on-device only. */
  aiApiKey?: string;
  /** id of the training-program template currently applied to the plan, if any. */
  activeProgramId?: string;
}

const db = new Dexie('gym-buddie') as Dexie & {
  exercises: EntityTable<Exercise, 'id'>;
  musclePrefs: EntityTable<MusclePref, 'id'>;
  planDays: EntityTable<PlanDay, 'id'>;
  workoutSessions: EntityTable<WorkoutSession, 'id'>;
  setLogs: EntityTable<SetLog, 'id'>;
  bodyStats: EntityTable<BodyStat, 'id'>;
  bodyPhotos: EntityTable<BodyPhoto, 'id'>;
  foodLogs: EntityTable<FoodLog, 'id'>;
  foodPresets: EntityTable<FoodPreset, 'id'>;
  waterLogs: EntityTable<WaterLog, 'id'>;
  nutritionGoals: EntityTable<NutritionGoal, 'id'>;
  settings: EntityTable<Settings, 'id'>;
};

db.version(1).stores({
  exercises: '++id, muscleGroup',
  planDays: '++id, order',
  workoutSessions: '++id, date, planDayId',
  setLogs: '++id, sessionId, exerciseId, date',
  bodyStats: '++id, date',
  foodLogs: '++id, date',
  foodPresets: '++id, name',
  nutritionGoals: '++id',
});

db.version(2).stores({
  exercises: '++id, muscleGroup',
  planDays: '++id, order',
  workoutSessions: '++id, date, planDayId',
  setLogs: '++id, sessionId, exerciseId, date',
  bodyStats: '++id, date',
  bodyPhotos: '++id, date',
  foodLogs: '++id, date',
  foodPresets: '++id, name',
  waterLogs: '++id, date',
  nutritionGoals: '++id',
  settings: '++id',
});

db.version(3)
  .stores({
    exercises: '++id, muscleGroup, muscle',
    musclePrefs: '++id, muscle',
    planDays: '++id, order',
    workoutSessions: '++id, date, planDayId',
    setLogs: '++id, sessionId, exerciseId, date',
    bodyStats: '++id, date',
    bodyPhotos: '++id, date',
    foodLogs: '++id, date',
    foodPresets: '++id, name',
    waterLogs: '++id, date',
    nutritionGoals: '++id',
    settings: '++id',
  })
  .upgrade(async (tx) => {
    // Map legacy free-text muscle groups onto canonical keys, and backfill
    // Arabic names for any seeded exercise we recognise by English name.
    const byName = new Map(EXERCISE_LIBRARY.map((e) => [e.name, e]));
    await tx.table('exercises').toCollection().modify((ex: Exercise) => {
      if (!ex.muscle) ex.muscle = legacyMuscleToKey(ex.muscleGroup ?? '');
      const lib = byName.get(ex.name);
      if (lib) {
        ex.nameAr ??= lib.nameAr;
        ex.machineAr ??= lib.machineAr;
        ex.muscle = lib.muscle;
      }
    });
    await tx.table('settings').toCollection().modify((s: Settings) => {
      s.lang ??= 'en';
    });
  });

export default db;

// ---- Seeding default data on first run ----

const DEFAULT_PLAN: { name: string; nameAr: string; exercises: string[] }[] = [
  {
    name: 'Push (Chest / Shoulders / Triceps)',
    nameAr: 'دفع (صدر / أكتاف / ترايسبس)',
    exercises: [
      'Barbell Bench Press',
      'Incline Dumbbell Press',
      'Dumbbell Shoulder Press',
      'Lateral Raise',
      'Pec Deck Fly',
      'Triceps Pushdown',
    ],
  },
  {
    name: 'Pull (Back / Biceps)',
    nameAr: 'سحب (ظهر / بايسبس)',
    exercises: ['Lat Pulldown', 'Seated Cable Row', 'Barbell Row', 'Face Pull', 'Barbell Curl', 'Hammer Curl'],
  },
  {
    name: 'Legs',
    nameAr: 'أرجل',
    exercises: [
      'Back Squat',
      'Leg Press',
      'Romanian Deadlift',
      'Leg Extension',
      'Lying Leg Curl',
      'Standing Calf Raise',
    ],
  },
];

export async function seedIfEmpty() {
  await db.transaction(
    'rw',
    db.exercises,
    db.planDays,
    db.nutritionGoals,
    db.settings,
    async () => {
      // Merge in any library exercises that aren't in the DB yet. This runs on
      // every start so upgrades pick up newly added exercises without touching
      // the user's own custom entries or their logged history.
      const existing = await db.exercises.toArray();
      const existingNames = new Set(existing.map((e) => e.name));
      const missing = EXERCISE_LIBRARY.filter((e) => !existingNames.has(e.name));
      if (missing.length > 0) {
        await db.exercises.bulkAdd(
          missing.map((e) => ({
            name: e.name,
            nameAr: e.nameAr,
            muscleGroup: e.muscle,
            muscle: e.muscle,
            machine: e.machine,
            machineAr: e.machineAr,
            targetSets: e.targetSets,
            targetRepsLow: e.targetRepsLow,
            targetRepsHigh: e.targetRepsHigh,
          })),
        );
      }

      const planCount = await db.planDays.count();
      if (planCount === 0) {
        const all = await db.exercises.toArray();
        const idByName = new Map(all.map((e) => [e.name, e.id!]));
        const libByName = new Map(EXERCISE_LIBRARY.map((e) => [e.name, e]));

        await db.planDays.bulkAdd(
          DEFAULT_PLAN.map((day, order) => ({
            order,
            name: day.name,
            nameAr: day.nameAr,
            exercises: day.exercises
              .map((exName) => {
                const id = idByName.get(exName);
                const lib = libByName.get(exName);
                if (!id || !lib) return null;
                return { exerciseId: id, sets: lib.targetSets, repsLow: lib.targetRepsLow, repsHigh: lib.targetRepsHigh };
              })
              .filter((x): x is PlanDayExercise => x !== null),
          })),
        );
      }

      const goalCount = await db.nutritionGoals.count();
      if (goalCount === 0) {
        await db.nutritionGoals.add({ calories: 2400, protein: 160, carbs: 250, fat: 70, waterMl: 2500 });
      }

      const settingsCount = await db.settings.count();
      if (settingsCount === 0) {
        await db.settings.add({
          lang: 'en',
          units: 'kg',
          restTimerDefaultSec: 90,
          barWeightKg: 20,
          availablePlatesKg: [25, 20, 15, 10, 5, 2.5, 1.25],
        });
      }
    },
  );
}
