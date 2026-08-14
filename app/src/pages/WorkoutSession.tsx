import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import db from '../db';
import { todayStr } from '../lib/date';
import { Card, PageHeader, Button, Input } from '../components/ui';

export default function WorkoutSession() {
  const { sessionId } = useParams();
  const id = Number(sessionId);
  const navigate = useNavigate();

  const session = useLiveQuery(() => db.workoutSessions.get(id), [id]);
  const day = useLiveQuery(() => (session ? db.planDays.get(session.planDayId) : undefined), [session?.planDayId]);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const currentLogs = useLiveQuery(() => db.setLogs.where('sessionId').equals(id).toArray(), [id]);
  const allLogsForDay = useLiveQuery(async () => {
    if (!day) return [];
    const exerciseIds = day.exercises.map((e) => e.exerciseId);
    return db.setLogs.where('exerciseId').anyOf(exerciseIds).toArray();
  }, [day]);

  const lastPerformance = useMemo(() => {
    if (!allLogsForDay || !day) return new Map<number, { weight: number; reps: number }[]>();
    const map = new Map<number, { weight: number; reps: number }[]>();
    for (const de of day.exercises) {
      const logs = allLogsForDay.filter((l) => l.exerciseId === de.exerciseId && l.sessionId !== id);
      if (logs.length === 0) continue;
      const lastSessionId = Math.max(...logs.map((l) => l.sessionId));
      const sets = logs
        .filter((l) => l.sessionId === lastSessionId)
        .sort((a, b) => a.setNumber - b.setNumber)
        .map((l) => ({ weight: l.weight, reps: l.reps }));
      map.set(de.exerciseId, sets);
    }
    return map;
  }, [allLogsForDay, day, id]);

  if (!session || !day || !exercises || !currentLogs) return null;

  const exById = new Map(exercises.map((e) => [e.id!, e]));

  async function saveSet(exerciseId: number, setNumber: number, weight: number, reps: number) {
    const existing = currentLogs!.find((l) => l.exerciseId === exerciseId && l.setNumber === setNumber);
    if (existing) {
      await db.setLogs.update(existing.id!, { weight, reps });
    } else {
      await db.setLogs.add({ sessionId: id, exerciseId, setNumber, weight, reps, date: todayStr() });
    }
  }

  async function finishWorkout() {
    await db.workoutSessions.update(id, { completed: true });
    navigate('/');
  }

  const totalSets = day.exercises.reduce((sum, de) => sum + de.sets, 0);
  const loggedSets = currentLogs.length;

  return (
    <div className="pb-4">
      <PageHeader title={day.name} subtitle={`${loggedSets} / ${totalSets} sets logged`} />
      <div className="flex flex-col gap-3 px-4">
        {day.exercises.map((de) => {
          const ex = exById.get(de.exerciseId);
          if (!ex) return null;
          const last = lastPerformance.get(de.exerciseId);
          return (
            <Card key={de.exerciseId}>
              <h3 className="font-semibold text-white">{ex.name}</h3>
              <p className="text-sm text-slate-400">{ex.machine}</p>
              <p className="mt-0.5 text-xs text-slate-500">Target: {de.sets} × {de.repsLow}-{de.repsHigh} reps</p>
              {last && last.length > 0 && (
                <p className="mt-1 text-xs text-emerald-400/80">
                  Last time: {last.map((s) => `${s.weight}kg×${s.reps}`).join(', ')}
                </p>
              )}
              <div className="mt-3 flex flex-col gap-2">
                {Array.from({ length: de.sets }, (_, i) => i + 1).map((setNumber) => (
                  <SetRow
                    key={setNumber}
                    setNumber={setNumber}
                    initial={currentLogs.find((l) => l.exerciseId === de.exerciseId && l.setNumber === setNumber)}
                    suggestion={last?.[setNumber - 1]}
                    onSave={(weight, reps) => saveSet(de.exerciseId, setNumber, weight, reps)}
                  />
                ))}
              </div>
            </Card>
          );
        })}

        <Button onClick={finishWorkout}>Finish Workout ✓</Button>
      </div>
    </div>
  );
}

function SetRow({
  setNumber,
  initial,
  suggestion,
  onSave,
}: {
  setNumber: number;
  initial?: { weight: number; reps: number };
  suggestion?: { weight: number; reps: number };
  onSave: (weight: number, reps: number) => void;
}) {
  const done = !!initial;
  const defaultWeight = initial?.weight ?? suggestion?.weight ?? 0;
  const defaultReps = initial?.reps ?? suggestion?.reps ?? 0;

  return (
    <form
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const weight = Number((form.elements.namedItem('weight') as HTMLInputElement).value) || 0;
        const reps = Number((form.elements.namedItem('reps') as HTMLInputElement).value) || 0;
        onSave(weight, reps);
      }}
    >
      <span className="w-5 text-xs text-slate-500">#{setNumber}</span>
      <Input name="weight" type="number" inputMode="decimal" step="0.5" defaultValue={defaultWeight || ''} placeholder="kg" className="text-center" />
      <span className="text-slate-600">×</span>
      <Input name="reps" type="number" inputMode="numeric" defaultValue={defaultReps || ''} placeholder="reps" className="text-center" />
      <Button type="submit" variant={done ? 'secondary' : 'primary'} className="!px-3 !py-2">
        {done ? '✓' : 'Log'}
      </Button>
    </form>
  );
}
