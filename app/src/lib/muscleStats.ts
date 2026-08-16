import type { Exercise, MusclePref, SetLog } from '../db';
import { MUSCLES, type MuscleDef, type MuscleKey } from './muscles';
import { daysAgo } from './date';

export type MuscleStatus = 'never' | 'today' | 'resting' | 'ready' | 'overdue';

export interface MuscleStat {
  def: MuscleDef;
  lastTrained: string | null;
  daysSince: number | null;
  weeklySets: number;
  bestWeight: number | null;
  bestReps: number | null;
  preferredExerciseId: number | null;
  exerciseCount: number;
  status: MuscleStatus;
  /** Higher = more deserving of being trained today. */
  priority: number;
}

function diffInDays(fromDate: string, toDate: string): number {
  const a = new Date(fromDate + 'T00:00:00').getTime();
  const b = new Date(toDate + 'T00:00:00').getTime();
  return Math.round((b - a) / 86400000);
}

export function computeMuscleStats(
  exercises: Exercise[],
  setLogs: SetLog[],
  prefs: MusclePref[],
  today: string,
): MuscleStat[] {
  const exById = new Map(exercises.map((e) => [e.id!, e]));
  const prefByMuscle = new Map(prefs.map((p) => [p.muscle, p.preferredExerciseId]));
  const weekStart = daysAgo(6); // inclusive 7-day window

  const countByMuscle = new Map<MuscleKey, number>();
  for (const ex of exercises) {
    if (!ex.muscle) continue;
    countByMuscle.set(ex.muscle, (countByMuscle.get(ex.muscle) ?? 0) + 1);
  }

  const acc = new Map<
    MuscleKey,
    { last: string | null; weekly: number; bestWeight: number; bestReps: number }
  >();

  for (const log of setLogs) {
    const ex = exById.get(log.exerciseId);
    const muscle = ex?.muscle;
    if (!muscle) continue;

    const cur = acc.get(muscle) ?? { last: null, weekly: 0, bestWeight: 0, bestReps: 0 };
    if (!cur.last || log.date > cur.last) cur.last = log.date;
    if (log.date >= weekStart && log.setType !== 'warmup') cur.weekly += 1;
    if (log.weight > cur.bestWeight) {
      cur.bestWeight = log.weight;
      cur.bestReps = log.reps;
    }
    acc.set(muscle, cur);
  }

  return MUSCLES.map((def) => {
    const a = acc.get(def.key);
    const lastTrained = a?.last ?? null;
    const daysSince = lastTrained ? diffInDays(lastTrained, today) : null;
    const weeklySets = a?.weekly ?? 0;

    let status: MuscleStatus;
    let priority: number;

    if (daysSince === null) {
      status = 'never';
      priority = 1000;
    } else if (daysSince === 0) {
      status = 'today';
      priority = -100;
    } else if (daysSince < def.recoveryDays) {
      status = 'resting';
      priority = -10 + daysSince;
    } else {
      const overdueBy = daysSince - def.recoveryDays;
      status = overdueBy >= def.recoveryDays + 3 ? 'overdue' : 'ready';
      // Weight by how overdue it is, and nudge muscles short on weekly volume.
      const volumeGap = Math.max(0, def.weeklySetTarget - weeklySets) / def.weeklySetTarget;
      priority = overdueBy * 10 + volumeGap * 20;
    }

    return {
      def,
      lastTrained,
      daysSince,
      weeklySets,
      bestWeight: a && a.bestWeight > 0 ? a.bestWeight : null,
      bestReps: a && a.bestWeight > 0 ? a.bestReps : null,
      preferredExerciseId: prefByMuscle.get(def.key) ?? null,
      exerciseCount: countByMuscle.get(def.key) ?? 0,
      status,
      priority,
    };
  });
}

/** The muscles most deserving of attention today, best-first. */
export function recommendToday(stats: MuscleStat[], limit = 3): MuscleStat[] {
  return [...stats]
    .filter((s) => s.status !== 'today' && s.status !== 'resting')
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}

/** Muscles falling short of their weekly set target — surfaced as gentle nudges. */
export function neglectedMuscles(stats: MuscleStat[]): MuscleStat[] {
  return stats
    .filter((s) => s.status === 'never' || s.weeklySets < s.def.weeklySetTarget * 0.5)
    .sort((a, b) => a.weeklySets - b.weeklySets);
}
