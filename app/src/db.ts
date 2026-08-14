import Dexie, { type EntityTable } from 'dexie';

export interface Exercise {
  id?: number;
  name: string;
  muscleGroup: string;
  machine: string;
  notes?: string;
  targetSets: number;
  targetRepsLow: number;
  targetRepsHigh: number;
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
  exercises: PlanDayExercise[];
}

export interface WorkoutSession {
  id?: number;
  date: string; // yyyy-mm-dd
  startedAt: number;
  finishedAt?: number;
  planDayId: number;
  planDayName: string;
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

export interface Settings {
  id?: number;
  units: 'kg' | 'lb';
  restTimerDefaultSec: number;
  barWeightKg: number;
  availablePlatesKg: number[];
  heightCm?: number;
  sex?: 'male' | 'female';
}

const db = new Dexie('gym-buddie') as Dexie & {
  exercises: EntityTable<Exercise, 'id'>;
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

export default db;

// ---- Seeding default data on first run ----

const DEFAULT_EXERCISES: Exercise[] = [
  { name: 'Barbell Bench Press', muscleGroup: 'Chest', machine: 'Flat Barbell Bench', targetSets: 4, targetRepsLow: 6, targetRepsHigh: 10 },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', machine: 'Incline Bench + Dumbbells', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Chest Fly', muscleGroup: 'Chest', machine: 'Pec Deck / Cable Fly Machine', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 15 },
  { name: 'Overhead Shoulder Press', muscleGroup: 'Shoulders', machine: 'Shoulder Press Machine / Dumbbells', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Lateral Raise', muscleGroup: 'Shoulders', machine: 'Cable Lateral Raise / Dumbbells', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Triceps Pushdown', muscleGroup: 'Triceps', machine: 'Cable Machine + Rope', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 15 },
  { name: 'Overhead Triceps Extension', muscleGroup: 'Triceps', machine: 'Cable Machine / Dumbbell', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 15 },

  { name: 'Lat Pulldown', muscleGroup: 'Back', machine: 'Lat Pulldown Machine', targetSets: 4, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Seated Cable Row', muscleGroup: 'Back', machine: 'Seated Row Machine / Cable', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Barbell Row', muscleGroup: 'Back', machine: 'Barbell', targetSets: 3, targetRepsLow: 6, targetRepsHigh: 10 },
  { name: 'Face Pull', muscleGroup: 'Back / Rear Delts', machine: 'Cable Machine + Rope', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Barbell Curl', muscleGroup: 'Biceps', machine: 'Barbell', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 12 },
  { name: 'Dumbbell Hammer Curl', muscleGroup: 'Biceps', machine: 'Dumbbells', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 12 },

  { name: 'Back Squat', muscleGroup: 'Legs', machine: 'Squat Rack', targetSets: 4, targetRepsLow: 6, targetRepsHigh: 10 },
  { name: 'Leg Press', muscleGroup: 'Legs', machine: 'Leg Press Machine', targetSets: 3, targetRepsLow: 10, targetRepsHigh: 12 },
  { name: 'Leg Extension', muscleGroup: 'Quads', machine: 'Leg Extension Machine', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Leg Curl', muscleGroup: 'Hamstrings', machine: 'Leg Curl Machine', targetSets: 3, targetRepsLow: 12, targetRepsHigh: 15 },
  { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings / Glutes', machine: 'Barbell', targetSets: 3, targetRepsLow: 8, targetRepsHigh: 10 },
  { name: 'Standing Calf Raise', muscleGroup: 'Calves', machine: 'Calf Raise Machine', targetSets: 4, targetRepsLow: 12, targetRepsHigh: 20 },
  { name: 'Plank', muscleGroup: 'Core', machine: 'Bodyweight', targetSets: 3, targetRepsLow: 30, targetRepsHigh: 60 },
];

export async function seedIfEmpty() {
  await db.transaction('rw', db.exercises, db.planDays, db.nutritionGoals, db.settings, async () => {
  const exerciseCount = await db.exercises.count();
  if (exerciseCount === 0) {
    const ids = await db.exercises.bulkAdd(DEFAULT_EXERCISES, { allKeys: true });
    const byName = (name: string) => ids[DEFAULT_EXERCISES.findIndex((e) => e.name === name)] as number;

    const planDays: PlanDay[] = [
      {
        order: 0,
        name: 'Push (Chest / Shoulders / Triceps)',
        exercises: [
          { exerciseId: byName('Barbell Bench Press'), sets: 4, repsLow: 6, repsHigh: 10 },
          { exerciseId: byName('Incline Dumbbell Press'), sets: 3, repsLow: 8, repsHigh: 12 },
          { exerciseId: byName('Overhead Shoulder Press'), sets: 3, repsLow: 8, repsHigh: 12 },
          { exerciseId: byName('Lateral Raise'), sets: 3, repsLow: 12, repsHigh: 15 },
          { exerciseId: byName('Chest Fly'), sets: 3, repsLow: 10, repsHigh: 15 },
          { exerciseId: byName('Triceps Pushdown'), sets: 3, repsLow: 10, repsHigh: 15 },
        ],
      },
      {
        order: 1,
        name: 'Pull (Back / Biceps)',
        exercises: [
          { exerciseId: byName('Lat Pulldown'), sets: 4, repsLow: 8, repsHigh: 12 },
          { exerciseId: byName('Seated Cable Row'), sets: 3, repsLow: 8, repsHigh: 12 },
          { exerciseId: byName('Barbell Row'), sets: 3, repsLow: 6, repsHigh: 10 },
          { exerciseId: byName('Face Pull'), sets: 3, repsLow: 12, repsHigh: 15 },
          { exerciseId: byName('Barbell Curl'), sets: 3, repsLow: 8, repsHigh: 12 },
          { exerciseId: byName('Dumbbell Hammer Curl'), sets: 3, repsLow: 10, repsHigh: 12 },
        ],
      },
      {
        order: 2,
        name: 'Legs',
        exercises: [
          { exerciseId: byName('Back Squat'), sets: 4, repsLow: 6, repsHigh: 10 },
          { exerciseId: byName('Leg Press'), sets: 3, repsLow: 10, repsHigh: 12 },
          { exerciseId: byName('Romanian Deadlift'), sets: 3, repsLow: 8, repsHigh: 10 },
          { exerciseId: byName('Leg Extension'), sets: 3, repsLow: 12, repsHigh: 15 },
          { exerciseId: byName('Leg Curl'), sets: 3, repsLow: 12, repsHigh: 15 },
          { exerciseId: byName('Standing Calf Raise'), sets: 4, repsLow: 12, repsHigh: 20 },
        ],
      },
    ];
    await db.planDays.bulkAdd(planDays);
  }

  const goalCount = await db.nutritionGoals.count();
  if (goalCount === 0) {
    await db.nutritionGoals.add({ calories: 2400, protein: 160, carbs: 250, fat: 70, waterMl: 2500 });
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      units: 'kg',
      restTimerDefaultSec: 90,
      barWeightKg: 20,
      availablePlatesKg: [25, 20, 15, 10, 5, 2.5, 1.25],
    });
  }
  });
}
