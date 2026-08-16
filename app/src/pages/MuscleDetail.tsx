import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import db, { AD_HOC_PLAN_DAY, type Exercise } from '../db';
import { useT, localized } from '../lib/i18n';
import { useSettings } from '../lib/useSettings';
import { displayWeight } from '../lib/units';
import { estimate1RM } from '../lib/oneRepMax';
import { todayStr } from '../lib/date';
import { MUSCLE_BY_KEY, type MuscleKey } from '../lib/muscles';
import { useMuscleStats } from '../lib/useMuscleStats';
import { Card, PageHeader, Button, EmptyState } from '../components/ui';

export default function MuscleDetail() {
  const { muscleKey } = useParams();
  const key = muscleKey as MuscleKey;
  const navigate = useNavigate();
  const { t, lang } = useT();
  const settings = useSettings();
  const { stats } = useMuscleStats();

  const def = MUSCLE_BY_KEY.get(key);
  const exercises = useLiveQuery(
    () => db.exercises.filter((e) => e.muscle === key).toArray(),
    [key],
  );
  const setLogs = useLiveQuery(() => db.setLogs.toArray(), []);
  const pref = useLiveQuery(() => db.musclePrefs.where('muscle').equals(key).first(), [key]);

  /** Best set + last-used date per exercise for this muscle. */
  const perExercise = useMemo(() => {
    const map = new Map<number, { bestWeight: number; bestReps: number; lastDate: string }>();
    for (const l of setLogs ?? []) {
      const cur = map.get(l.exerciseId);
      if (!cur) {
        map.set(l.exerciseId, { bestWeight: l.weight, bestReps: l.reps, lastDate: l.date });
        continue;
      }
      if (l.weight > cur.bestWeight) {
        cur.bestWeight = l.weight;
        cur.bestReps = l.reps;
      }
      if (l.date > cur.lastDate) cur.lastDate = l.date;
    }
    return map;
  }, [setLogs]);

  if (!def || !exercises || !stats) return null;

  const stat = stats.find((s) => s.def.key === key);
  const preferredId = pref?.preferredExerciseId ?? null;

  // Preferred first, then most-used, then the rest.
  const ordered = [...exercises].sort((a, b) => {
    if (a.id === preferredId) return -1;
    if (b.id === preferredId) return 1;
    const aLast = perExercise.get(a.id!)?.lastDate ?? '';
    const bLast = perExercise.get(b.id!)?.lastDate ?? '';
    return bLast.localeCompare(aLast);
  });

  async function choosePreferred(exerciseId: number) {
    const existing = await db.musclePrefs.where('muscle').equals(key).first();
    if (existing?.id) {
      await db.musclePrefs.update(existing.id, { preferredExerciseId: exerciseId });
    } else {
      await db.musclePrefs.add({ muscle: key, preferredExerciseId: exerciseId });
    }
  }

  async function startMuscleWorkout() {
    const picked = ordered.slice(0, 3);
    if (picked.length === 0) return;
    const sessionId = await db.workoutSessions.add({
      date: todayStr(),
      startedAt: Date.now(),
      planDayId: AD_HOC_PLAN_DAY,
      planDayName: def!.en,
      planDayNameAr: def!.ar,
      adHocExercises: picked.map((e) => ({
        exerciseId: e.id!,
        sets: e.targetSets,
        repsLow: e.targetRepsLow,
        repsHigh: e.targetRepsHigh,
      })),
      completed: false,
    });
    navigate(`/workout/session/${sessionId}`);
  }

  const name = lang === 'ar' ? def.ar : def.en;

  return (
    <div className="pb-4">
      <PageHeader
        title={name}
        subtitle={t('muscles.weeklySets', { done: stat?.weeklySets ?? 0, target: def.weeklySetTarget })}
        action={
          <button onClick={() => navigate(-1)} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300">
            {t('common.close')}
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-4">
        <Card className="flex gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('muscles.pr')}</p>
            <p className="mt-1 text-xl font-bold text-white">
              {stat?.bestWeight != null
                ? `${displayWeight(stat.bestWeight, settings.units)}${settings.units} × ${stat.bestReps}`
                : '—'}
            </p>
            {stat?.bestWeight != null && (
              <p className="text-xs text-slate-500">
                {t('progress.estimated1RM', {
                  value: displayWeight(estimate1RM(stat.bestWeight, stat.bestReps ?? 1), settings.units),
                  unit: settings.units,
                })}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('muscles.lastTrained')}</p>
            <p className="mt-1 text-xl font-bold text-white">{stat?.lastTrained ?? '—'}</p>
            {stat?.daysSince != null && (
              <p className="text-xs text-slate-500">
                {stat.daysSince === 0
                  ? t('muscles.trainedToday')
                  : stat.daysSince === 1
                    ? t('common.day')
                    : t('common.days', { n: stat.daysSince })}
              </p>
            )}
          </div>
        </Card>

        <Button onClick={startMuscleWorkout} disabled={ordered.length === 0}>
          {t('muscles.startFor', { muscle: name })} ▸
        </Button>

        <div>
          <p className="mb-1 text-sm font-medium text-slate-300">{t('muscles.chooseMachine')}</p>
          <p className="mb-2 text-xs text-slate-500">{t('muscles.alternatives', { n: ordered.length })}</p>

          {ordered.length === 0 && <EmptyState text={t('muscles.noExercises')} />}

          <div className="flex flex-col gap-2">
            {ordered.map((ex) => (
              <ExerciseRow
                key={ex.id}
                ex={ex}
                isPreferred={ex.id === preferredId}
                best={perExercise.get(ex.id!)}
                onChoose={() => choosePreferred(ex.id!)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExerciseRow({
  ex,
  isPreferred,
  best,
  onChoose,
}: {
  ex: Exercise;
  isPreferred: boolean;
  best?: { bestWeight: number; bestReps: number; lastDate: string };
  onChoose: () => void;
}) {
  const { t, lang } = useT();
  const settings = useSettings();

  return (
    <Card className={isPreferred ? '!border-emerald-500/40 !bg-emerald-500/[0.06]' : ''}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">{localized(ex, 'name', lang)}</h3>
          <p className="truncate text-sm text-slate-400">{localized(ex, 'machine', lang)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {ex.targetSets} × {ex.targetRepsLow}-{ex.targetRepsHigh} {t('common.reps')}
            {best ? ` · ${displayWeight(best.bestWeight, settings.units)}${settings.units} × ${best.bestReps}` : ''}
          </p>
          {ex.notes && <p className="mt-1 text-xs italic text-slate-400">📝 {ex.notes}</p>}
        </div>
        {isPreferred ? (
          <span className="shrink-0 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
            ★ {t('muscles.preferred')}
          </span>
        ) : (
          <button
            onClick={onChoose}
            className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-300"
          >
            {t('muscles.setPreferred')}
          </button>
        )}
      </div>
    </Card>
  );
}
