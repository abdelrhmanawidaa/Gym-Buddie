import { useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import db, { AD_HOC_PLAN_DAY, type PlanDayExercise, type SetType } from '../db';
import { todayStr } from '../lib/date';
import { useT, localized } from '../lib/i18n';
import { useSettings } from '../lib/useSettings';
import { displayWeight, toKg } from '../lib/units';
import { estimate1RM } from '../lib/oneRepMax';
import { Card, PageHeader, Button, Input } from '../components/ui';
import ExerciseNotes from '../components/ExerciseNotes';
import ExerciseTools from '../components/ExerciseTools';
import RestTimer, { type RestTimerHandle } from '../components/RestTimer';
import Toast, { type ToastHandle } from '../components/Toast';

const SET_TYPE_CYCLE: SetType[] = ['working', 'warmup', 'failure', 'dropset'];
const SET_TYPE_LABEL: Record<SetType, string> = { working: 'W', warmup: 'Wu', failure: 'F', dropset: 'D' };
const SET_TYPE_COLOR: Record<SetType, string> = {
  working: 'bg-white/10 text-slate-300',
  warmup: 'bg-amber-500/20 text-amber-300',
  failure: 'bg-red-500/20 text-red-300',
  dropset: 'bg-purple-500/20 text-purple-300',
};
const RPE_OPTIONS = ['', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'];

export default function WorkoutSession() {
  const { sessionId } = useParams();
  const id = Number(sessionId);
  const navigate = useNavigate();
  const { t, lang } = useT();
  const settings = useSettings();
  const restTimerRef = useRef<RestTimerHandle | null>(null);
  const toastRef = useRef<ToastHandle | null>(null);
  const [notes, setNotes] = useState<string | null>(null);

  const session = useLiveQuery(() => db.workoutSessions.get(id), [id]);
  const planDay = useLiveQuery(
    () => (session && session.planDayId !== AD_HOC_PLAN_DAY ? db.planDays.get(session.planDayId) : undefined),
    [session?.planDayId],
  );
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const currentLogs = useLiveQuery(() => db.setLogs.where('sessionId').equals(id).toArray(), [id]);

  // Ad-hoc (muscle-started) sessions carry their own exercise list; plan sessions read it off the day.
  const isAdHoc = session?.planDayId === AD_HOC_PLAN_DAY;
  const dayExercises = useMemo<PlanDayExercise[] | null>(() => {
    if (!session) return null;
    if (isAdHoc) return session.adHocExercises ?? [];
    return planDay?.exercises ?? null;
  }, [session, isAdHoc, planDay]);

  const dayTitle = session
    ? isAdHoc
      ? (lang === 'ar' && session.planDayNameAr) || session.planDayName
      : ((lang === 'ar' && planDay?.nameAr) || planDay?.name) ?? ''
    : '';

  const allLogsForDay = useLiveQuery(async () => {
    if (!dayExercises) return [];
    const exerciseIds = dayExercises.map((e) => e.exerciseId);
    return db.setLogs.where('exerciseId').anyOf(exerciseIds).toArray();
  }, [dayExercises]);

  const lastPerformance = useMemo(() => {
    if (!allLogsForDay || !dayExercises) return new Map<number, { weight: number; reps: number }[]>();
    const map = new Map<number, { weight: number; reps: number }[]>();
    for (const de of dayExercises) {
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
  }, [allLogsForDay, dayExercises, id]);

  const priorBest = useMemo(() => {
    const map = new Map<number, number>();
    if (!allLogsForDay) return map;
    for (const l of allLogsForDay) {
      if (l.sessionId === id) continue;
      map.set(l.exerciseId, Math.max(map.get(l.exerciseId) ?? 0, l.weight));
    }
    return map;
  }, [allLogsForDay, id]);

  if (!session || !dayExercises || !exercises || !currentLogs) return null;

  const exById = new Map(exercises.map((e) => [e.id!, e]));

  async function saveSet(exerciseId: number, setNumber: number, weightKg: number, reps: number, setType: SetType, rpe: number | undefined) {
    const existing = currentLogs!.find((l) => l.exerciseId === exerciseId && l.setNumber === setNumber);
    if (existing) {
      await db.setLogs.update(existing.id!, { weight: weightKg, reps, setType, rpe });
    } else {
      await db.setLogs.add({ sessionId: id, exerciseId, setNumber, weight: weightKg, reps, date: todayStr(), setType, rpe });
    }

    if (session!.completed) return;

    if (setType !== 'warmup' && settings.restTimerDefaultSec > 0) {
      restTimerRef.current?.start(settings.restTimerDefaultSec);
    }

    const best = priorBest.get(exerciseId) ?? 0;
    if (weightKg > best && setType !== 'warmup') {
      const ex = exById.get(exerciseId);
      toastRef.current?.show(
        t('session.newPR', {
          name: ex ? localized(ex, 'name', lang) : '',
          weight: displayWeight(weightKg, settings.units),
          unit: settings.units,
          reps,
        }),
      );
    }
  }

  async function deleteSet(logId: number) {
    await db.setLogs.delete(logId);
  }

  async function finishWorkout() {
    await db.workoutSessions.update(id, {
      completed: true,
      finishedAt: session!.finishedAt ?? Date.now(),
      notes: notes ?? session!.notes,
    });
    navigate('/');
  }

  async function saveNotesOnly() {
    await db.workoutSessions.update(id, { notes: notes ?? session!.notes });
    navigate(-1);
  }

  async function deleteWorkout() {
    if (!confirm(t('session.confirmDelete'))) return;
    await db.transaction('rw', db.workoutSessions, db.setLogs, async () => {
      await db.setLogs.where('sessionId').equals(id).delete();
      await db.workoutSessions.delete(id);
    });
    navigate(-1);
  }

  const totalSets = dayExercises.reduce((sum, de) => sum + de.sets, 0);
  const loggedSets = currentLogs.length;
  const durationMin = session.finishedAt ? Math.round((session.finishedAt - session.startedAt) / 60000) : null;

  return (
    <div className="pb-4">
      <PageHeader
        title={dayTitle}
        subtitle={
          session.completed
            ? `${session.date}${durationMin != null ? ` · ${t('session.minutes', { n: durationMin })}` : ''} · ${loggedSets} ${t('common.sets')}`
            : t('session.setsLogged', { done: loggedSets, total: totalSets })
        }
        action={
          <button onClick={deleteWorkout} className="rounded-lg px-2 py-1.5 text-xs text-red-400/80 underline underline-offset-2">
            {t('common.delete')}
          </button>
        }
      />
      <Toast onRegister={(h) => (toastRef.current = h)} />
      <div className="flex flex-col gap-3 px-4">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('session.notes')}</p>
          <textarea
            defaultValue={session.notes ?? ''}
            onBlur={(e) => setNotes(e.target.value)}
            placeholder={t('session.notesPlaceholder')}
            rows={2}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-400/60"
          />
        </Card>

        {dayExercises.map((de) => {
          const ex = exById.get(de.exerciseId);
          if (!ex) return null;
          const last = lastPerformance.get(de.exerciseId);
          const suggestedTarget = last?.[0]?.weight ?? 0;
          return (
            <Card key={de.exerciseId}>
              <h3 className="font-semibold text-white">{localized(ex, 'name', lang)}</h3>
              <p className="text-sm text-slate-400">{localized(ex, 'machine', lang)}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {t('session.target', { sets: de.sets, low: de.repsLow, high: de.repsHigh })}
              </p>
              {last && last.length > 0 && (
                <p className="mt-1 text-xs text-emerald-400/80">
                  {t('session.lastTime', {
                    sets: last.map((s) => `${displayWeight(s.weight, settings.units)}${settings.units}×${s.reps}`).join(', '),
                  })}
                  {' · '}
                  {t('session.est1RM', {
                    value: displayWeight(Math.max(...last.map((s) => estimate1RM(s.weight, s.reps))), settings.units),
                    unit: settings.units,
                  })}
                </p>
              )}
              <ExerciseNotes exerciseId={ex.id!} notes={ex.notes} />
              <ExerciseTools
                defaultWeightKg={suggestedTarget}
                units={settings.units}
                barWeightKg={settings.barWeightKg}
                availablePlatesKg={settings.availablePlatesKg}
              />
              <div className="mt-3 flex flex-col gap-2">
                {Array.from({ length: de.sets }, (_, i) => i + 1).map((setNumber) => (
                  <SetRow
                    key={setNumber}
                    setNumber={setNumber}
                    units={settings.units}
                    existing={currentLogs.find((l) => l.exerciseId === de.exerciseId && l.setNumber === setNumber)}
                    suggestion={last?.[setNumber - 1]}
                    onSave={(weightKg, reps, setType, rpe) => saveSet(de.exerciseId, setNumber, weightKg, reps, setType, rpe)}
                    onDelete={deleteSet}
                  />
                ))}
              </div>
            </Card>
          );
        })}

        {session.completed ? (
          <Button onClick={saveNotesOnly}>{t('session.saveClose')}</Button>
        ) : (
          <Button onClick={finishWorkout}>{t('session.finish')}</Button>
        )}
      </div>
      <RestTimer onRegister={(h) => (restTimerRef.current = h)} />
    </div>
  );
}

function SetRow({
  setNumber,
  units,
  existing,
  suggestion,
  onSave,
  onDelete,
}: {
  setNumber: number;
  units: 'kg' | 'lb';
  existing?: { id?: number; weight: number; reps: number; setType?: SetType; rpe?: number };
  suggestion?: { weight: number; reps: number };
  onSave: (weightKg: number, reps: number, setType: SetType, rpe: number | undefined) => void;
  onDelete: (logId: number) => void;
}) {
  const { t } = useT();
  const done = !!existing;
  const [setType, setSetType] = useState<SetType>(existing?.setType ?? 'working');
  const defaultWeight = existing?.weight ?? suggestion?.weight ?? 0;
  const defaultReps = existing?.reps ?? suggestion?.reps ?? 0;

  function cycleSetType() {
    const idx = SET_TYPE_CYCLE.indexOf(setType);
    setSetType(SET_TYPE_CYCLE[(idx + 1) % SET_TYPE_CYCLE.length]);
  }

  return (
    <form
      className={`flex flex-wrap items-center gap-1.5 rounded-xl border px-3 py-2 ${done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const weightDisplay = Number((form.elements.namedItem('weight') as HTMLInputElement).value) || 0;
        const reps = Number((form.elements.namedItem('reps') as HTMLInputElement).value) || 0;
        const rpeStr = (form.elements.namedItem('rpe') as HTMLSelectElement).value;
        onSave(toKg(weightDisplay, units), reps, setType, rpeStr ? Number(rpeStr) : undefined);
      }}
    >
      <button
        type="button"
        onClick={cycleSetType}
        className={`w-7 shrink-0 rounded-md py-1.5 text-center text-[10px] font-bold ${SET_TYPE_COLOR[setType]}`}
        title={t('session.setTypeHint')}
      >
        {SET_TYPE_LABEL[setType]}
      </button>
      <span className="w-4 shrink-0 text-xs text-slate-500">#{setNumber}</span>
      <Input
        name="weight"
        type="number"
        inputMode="decimal"
        step="0.5"
        defaultValue={defaultWeight ? displayWeight(defaultWeight, units) : ''}
        placeholder={units}
        className="w-16 text-center"
      />
      <span className="text-slate-600">×</span>
      <Input name="reps" type="number" inputMode="numeric" defaultValue={defaultReps || ''} placeholder={t('common.reps')} className="w-14 text-center" />
      <select
        name="rpe"
        defaultValue={existing?.rpe != null ? String(existing.rpe) : ''}
        className="w-16 rounded-xl border border-white/10 bg-white/5 px-1.5 py-2.5 text-xs text-white outline-none"
      >
        {RPE_OPTIONS.map((r) => (
          <option key={r} value={r}>
            {r ? `RPE ${r}` : 'RPE'}
          </option>
        ))}
      </select>
      <Button type="submit" variant={done ? 'secondary' : 'primary'} className="ms-auto !px-3 !py-2">
        {done ? '✓' : t('session.logBtn')}
      </Button>
      {done && existing?.id != null && (
        <button
          type="button"
          onClick={() => onDelete(existing.id!)}
          className="rounded-lg px-2 py-2 text-xs text-red-400/70"
          title={t('session.deleteSet')}
        >
          ✕
        </button>
      )}
    </form>
  );
}
