import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import db from '../db';
import { useT } from '../lib/i18n';
import { useSettings } from '../lib/useSettings';
import { MUSCLES, type MuscleKey } from '../lib/muscles';
import { computeDevelopment, overallLevel, LEVEL_NAME_KEYS } from '../lib/development';
import BodyMap from './BodyMap';
import { LEVEL_COLORS, type BodyView } from '../lib/bodyMapTypes';
import { Card } from './ui';

export default function PhysiqueAvatar() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const settings = useSettings();
  const [view, setView] = useState<BodyView>('front');

  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const setLogs = useLiveQuery(() => db.setLogs.toArray(), []);
  const latestWeight = useLiveQuery(
    () => db.bodyStats.orderBy('date').reverse().filter((s) => s.weight != null).first(),
    [],
  );

  const dev = useMemo(() => {
    if (!exercises || !setLogs) return null;
    return computeDevelopment(exercises, setLogs, latestWeight?.weight, settings.sex);
  }, [exercises, setLogs, latestWeight, settings.sex]);

  const levels = useMemo(() => {
    const map: Partial<Record<MuscleKey, number>> = {};
    for (const d of dev ?? []) map[d.muscle] = d.level;
    return map;
  }, [dev]);

  if (!dev) return null;

  const overall = overallLevel(dev);
  const trained = dev.filter((d) => d.totalSets > 0);
  const strongest = [...trained].sort((a, b) => b.level + b.progress - (a.level + a.progress))[0];
  const weakest = [...dev].sort((a, b) => a.level + a.progress - (b.level + b.progress))[0];

  const muscleName = (key: MuscleKey) => {
    const def = MUSCLES.find((m) => m.key === key)!;
    return lang === 'ar' ? def.ar : def.en;
  };

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-4 pb-0">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{t('physique.title')}</p>
          <p className="mt-0.5 text-xs text-slate-500">{t('physique.subtitle')}</p>
        </div>
        <div className="flex shrink-0 rounded-xl bg-white/5 p-0.5">
          {(['front', 'back'] as BodyView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === v ? 'bg-emerald-500 text-emerald-950' : 'text-slate-400'
              }`}
            >
              {t(v === 'front' ? 'physique.front' : 'physique.back')}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex justify-center px-4">
        <BodyMap
          view={view}
          levels={levels}
          onSelect={(m) => navigate(`/muscles/${m}`)}
          className="h-[300px] w-auto"
        />
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-2xl bg-white/[0.04] p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wide text-slate-400">{t('physique.overall')}</span>
            <span className="text-sm font-bold text-white">{t(LEVEL_NAME_KEYS[overall.level])}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((overall.level + overall.progress) / 5) * 100}%`,
                background: `linear-gradient(90deg, ${LEVEL_COLORS[1]}, ${LEVEL_COLORS[Math.max(1, overall.level)]})`,
              }}
            />
          </div>

          {strongest && weakest && (
            <div className="mt-3 flex justify-between gap-3 text-xs">
              <button onClick={() => navigate(`/muscles/${strongest.muscle}`)} className="text-start">
                <span className="block text-slate-500">{t('physique.strongest')}</span>
                <span className="font-semibold text-emerald-400">{muscleName(strongest.muscle)}</span>
              </button>
              <button onClick={() => navigate(`/muscles/${weakest.muscle}`)} className="text-end">
                <span className="block text-slate-500">{t('physique.weakest')}</span>
                <span className="font-semibold text-amber-400">{muscleName(weakest.muscle)}</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500">{t('physique.legend')}</span>
          <div className="flex flex-1 gap-0.5">
            {LEVEL_COLORS.map((c, i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: c }} />
            ))}
          </div>
        </div>

        {!latestWeight?.weight && (
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{t('physique.needsWeight')}</p>
        )}
        <p className="mt-2 text-center text-[11px] text-slate-500">{t('physique.tapMuscle')}</p>
      </div>
    </Card>
  );
}
