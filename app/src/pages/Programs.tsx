import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../db';
import { useT } from '../lib/i18n';
import { useSettings } from '../lib/useSettings';
import { PROGRAMS, recommendProgram, weeklyFrequency, type ProgramTemplate } from '../data/programs';
import { Card, PageHeader, Button } from '../components/ui';

export default function Programs() {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const settings = useSettings();
  const [days, setDays] = useState(4);
  const [applying, setApplying] = useState<string | null>(null);

  const recommended = useMemo(() => recommendProgram(days), [days]);

  async function apply(program: ProgramTemplate) {
    if (!confirm(t('programs.confirmApply'))) return;
    setApplying(program.id);
    try {
      const exercises = await db.exercises.orderBy('id').toArray();
      const prefs = await db.musclePrefs.toArray();
      const preferredByMuscle = new Map(prefs.map((p) => [p.muscle, p.preferredExerciseId]));

      const byMuscle = new Map<string, typeof exercises>();
      for (const ex of exercises) {
        if (!ex.muscle) continue;
        const list = byMuscle.get(ex.muscle) ?? [];
        list.push(ex);
        byMuscle.set(ex.muscle, list);
      }

      const newDays = program.days.map((day, order) => {
        const dayExercises = day.muscles.flatMap((muscle) => {
          let list = byMuscle.get(muscle) ?? [];
          const preferredId = preferredByMuscle.get(muscle);
          if (preferredId != null) {
            const preferred = list.find((e) => e.id === preferredId);
            if (preferred) list = [preferred, ...list.filter((e) => e.id !== preferredId)];
          }
          return list.slice(0, day.exercisesPerMuscle).map((ex) => ({
            exerciseId: ex.id!,
            sets: ex.targetSets,
            repsLow: ex.targetRepsLow,
            repsHigh: ex.targetRepsHigh,
          }));
        });
        return { order, name: day.name, nameAr: day.nameAr, exercises: dayExercises };
      });

      await db.transaction('rw', db.planDays, db.settings, async () => {
        await db.planDays.clear();
        await db.planDays.bulkAdd(newDays);
        const existing = await db.settings.toCollection().first();
        if (existing?.id) {
          await db.settings.update(existing.id, { activeProgramId: program.id });
        } else {
          await db.settings.add({ ...settings, activeProgramId: program.id });
        }
      });

      navigate('/workout');
    } finally {
      setApplying(null);
    }
  }

  return (
    <div className="pb-4">
      <PageHeader
        title={t('programs.title')}
        subtitle={t('programs.subtitle')}
        action={
          <button onClick={() => navigate(-1)} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300">
            {t('common.close')}
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-4">
        <Card>
          <p className="mb-2 text-sm font-medium text-slate-300">{t('programs.daysQuestion')}</p>
          <div className="flex flex-wrap gap-2">
            {[2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setDays(n)}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
                  days === n ? 'bg-emerald-500 text-emerald-950' : 'bg-white/5 text-slate-300'
                }`}
              >
                {t('programs.days', { n })}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-emerald-400">{t('programs.whyFrequency')}</p>
        </Card>

        <div className="flex flex-col gap-3">
          {PROGRAMS.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              isRecommended={program.id === recommended.id}
              isCurrent={settings.activeProgramId === program.id}
              busy={applying === program.id}
              onApply={() => apply(program)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  function ProgramCard({
    program,
    isRecommended,
    isCurrent,
    busy,
    onApply,
  }: {
    program: ProgramTemplate;
    isRecommended: boolean;
    isCurrent: boolean;
    busy: boolean;
    onApply: () => void;
  }) {
    const name = lang === 'ar' ? program.nameAr : program.name;
    const desc = lang === 'ar' ? program.descriptionAr : program.descriptionEn;
    const bestFor = lang === 'ar' ? program.bestForAr : program.bestForEn;
    const freq = weeklyFrequency(program);
    const freqVals = Object.values(freq) as number[];
    const minFreq = freqVals.length ? Math.min(...freqVals) : 0;

    return (
      <Card className={isRecommended ? '!border-emerald-500/40 !bg-emerald-500/[0.06]' : ''}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="font-semibold text-white">{name}</h3>
              {isCurrent && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                  {t('programs.current')}
                </span>
              )}
              {isRecommended && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  ★ {t('programs.recommended')}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400">{desc}</p>
            <p className="mt-1.5 text-xs text-slate-500">
              {t('programs.bestFor')}: {bestFor}
            </p>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {program.days.map((day, i) => (
            <span key={i} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300">
              {lang === 'ar' ? day.nameAr : day.name}
            </span>
          ))}
        </div>

        <p className={`mt-2 text-xs font-medium ${minFreq >= 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {minFreq >= 2 ? t('programs.frequency', { n: minFreq }) : t('programs.frequencyOnce')}
        </p>

        <Button className="mt-3" variant={isCurrent ? 'secondary' : 'primary'} onClick={onApply} disabled={busy}>
          {isCurrent ? t('programs.applied') : t('programs.apply')}
        </Button>
      </Card>
    );
  }
}
