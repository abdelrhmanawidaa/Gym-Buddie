import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db';
import { useT, localized } from '../lib/i18n';
import { useSettings } from '../lib/useSettings';
import { displayWeight } from '../lib/units';
import { useMuscleStats } from '../lib/useMuscleStats';
import { recommendToday, type MuscleStat, type MuscleStatus } from '../lib/muscleStats';
import { Card, PageHeader } from '../components/ui';

type Filter = 'all' | 'upper' | 'lower' | 'core';

const STATUS_STYLE: Record<MuscleStatus, string> = {
  never: 'bg-purple-500/15 text-purple-300',
  today: 'bg-sky-500/15 text-sky-300',
  resting: 'bg-amber-500/15 text-amber-300',
  ready: 'bg-emerald-500/15 text-emerald-300',
  overdue: 'bg-red-500/15 text-red-300',
};

export default function Muscles() {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const settings = useSettings();
  const { stats } = useMuscleStats();
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const [filter, setFilter] = useState<Filter>('all');

  if (!stats || !exercises) return null;

  const exById = new Map(exercises.map((e) => [e.id!, e]));
  const recommended = recommendToday(stats, 3);
  const visible = filter === 'all' ? stats : stats.filter((s) => s.def.region === filter);

  function statusLabel(s: MuscleStat): string {
    switch (s.status) {
      case 'never':
        return t('common.notLogged');
      case 'today':
        return t('muscles.trainedToday');
      case 'resting':
        return t('muscles.resting');
      case 'overdue':
        return t('muscles.neglected');
      default:
        return t('muscles.ready');
    }
  }

  return (
    <div className="pb-4">
      <PageHeader title={t('muscles.title')} subtitle={t('muscles.subtitle')} />

      <div className="flex flex-col gap-3 px-4">
        {recommended.length > 0 && (
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{t('dashboard.trainToday')}</p>
            <p className="mt-0.5 text-xs text-slate-500">{t('dashboard.trainTodayHint')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {recommended.map((s) => (
                <button
                  key={s.def.key}
                  onClick={() => navigate(`/muscles/${s.def.key}`)}
                  className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-300"
                >
                  {lang === 'ar' ? s.def.ar : s.def.en}
                </button>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-2">
          {(['all', 'upper', 'lower', 'core'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-xl px-2 py-2 text-xs font-medium ${
                filter === f ? 'bg-emerald-500 text-emerald-950' : 'bg-white/5 text-slate-300'
              }`}
            >
              {t(`muscles.filter${f.charAt(0).toUpperCase()}${f.slice(1)}` as 'muscles.filterAll')}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {visible.map((s) => {
            const preferred = s.preferredExerciseId ? exById.get(s.preferredExerciseId) : null;
            return (
              <Card key={s.def.key} className="cursor-pointer" >
                <div onClick={() => navigate(`/muscles/${s.def.key}`)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-white">
                        {lang === 'ar' ? s.def.ar : s.def.en}
                      </h2>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {preferred
                          ? `${localized(preferred, 'machine', lang)} · ${localized(preferred, 'name', lang)}`
                          : t('muscles.noneChosen')}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${STATUS_STYLE[s.status]}`}>
                      {statusLabel(s)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                    <span>
                      {t('muscles.yourWeight')}:{' '}
                      <span className="font-semibold text-white">
                        {s.bestWeight != null
                          ? `${displayWeight(s.bestWeight, settings.units)}${settings.units}`
                          : '—'}
                      </span>
                    </span>
                    <span>
                      {t('muscles.weeklySets', { done: s.weeklySets, target: s.def.weeklySetTarget })}
                    </span>
                  </div>

                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.min(100, (s.weeklySets / s.def.weeklySetTarget) * 100)}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
