import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db';
import { todayStr } from './date';
import { computeMuscleStats, type MuscleStat } from './muscleStats';

export function useMuscleStats(): { stats: MuscleStat[] | null; today: string } {
  const today = todayStr();
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const setLogs = useLiveQuery(() => db.setLogs.toArray(), []);
  const prefs = useLiveQuery(() => db.musclePrefs.toArray(), []);

  const stats = useMemo(() => {
    if (!exercises || !setLogs || !prefs) return null;
    return computeMuscleStats(exercises, setLogs, prefs, today);
  }, [exercises, setLogs, prefs, today]);

  return { stats, today };
}
