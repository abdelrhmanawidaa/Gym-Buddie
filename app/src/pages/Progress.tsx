import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import db from '../db';
import { useT, localized } from '../lib/i18n';
import { useSettings } from '../lib/useSettings';
import { displayWeight } from '../lib/units';
import { estimate1RM } from '../lib/oneRepMax';
import { computeWeeklyStreak } from '../lib/streak';
import { muscleName } from '../lib/muscles';
import { daysAgo } from '../lib/date';
import { Card, PageHeader, Select, EmptyState } from '../components/ui';
import Heatmap from '../components/Heatmap';

const CHART_TOOLTIP_STYLE = { background: '#151b23', border: '1px solid #ffffff20', borderRadius: 8, fontSize: 12 };

export default function Progress() {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const settings = useSettings();
  const exercises = useLiveQuery(
    () => db.exercises.toArray().then((list) => list.sort((a, b) => a.name.localeCompare(b.name))),
    [],
  );
  const [exerciseId, setExerciseId] = useState<number | ''>('');

  const logs = useLiveQuery(() => {
    if (!exerciseId) return [];
    return db.setLogs.where('exerciseId').equals(exerciseId as number).toArray();
  }, [exerciseId]);

  const sessions = useLiveQuery(() => db.workoutSessions.orderBy('id').reverse().toArray(), []);
  const allSetLogs = useLiveQuery(() => db.setLogs.toArray(), []);

  const chartData = useMemo(() => {
    if (!logs || !sessions) return [];
    const bySession = new Map<number, { weight: number; volume: number; best1RM: number }>();
    for (const l of logs) {
      const cur = bySession.get(l.sessionId) ?? { weight: 0, volume: 0, best1RM: 0 };
      cur.weight = Math.max(cur.weight, l.weight);
      cur.volume += l.weight * l.reps;
      cur.best1RM = Math.max(cur.best1RM, estimate1RM(l.weight, l.reps));
      bySession.set(l.sessionId, cur);
    }
    const sessById = new Map(sessions.map((s) => [s.id!, s]));
    return [...bySession.entries()]
      .map(([sid, v]) => ({
        date: sessById.get(sid)?.date ?? '',
        maxWeight: displayWeight(v.weight, settings.units),
        volume: Math.round(displayWeight(v.volume, settings.units)),
        oneRM: displayWeight(v.best1RM, settings.units),
        sid,
      }))
      .filter((d) => d.date)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, sessions, settings.units]);

  const pr = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    const maxWeight = Math.max(...logs.map((l) => l.weight));
    const bestSet = logs.filter((l) => l.weight === maxWeight).sort((a, b) => b.reps - a.reps)[0];
    const best1RM = Math.max(...logs.map((l) => estimate1RM(l.weight, l.reps)));
    return { weight: maxWeight, reps: bestSet.reps, oneRM: best1RM };
  }, [logs]);

  const completedSessions = useMemo(() => (sessions ?? []).filter((s) => s.completed), [sessions]);
  const streak = useMemo(() => computeWeeklyStreak(completedSessions.map((s) => s.date)), [completedSessions]);

  const muscleVolume = useMemo(() => {
    if (!allSetLogs || !exercises) return [];
    const since = daysAgo(7);
    const exById = new Map(exercises.map((e) => [e.id!, e]));
    const totals = new Map<string, number>();
    for (const l of allSetLogs) {
      if (l.date < since) continue;
      const ex = exById.get(l.exerciseId);
      if (!ex) continue;
      const key = ex.muscle ?? ex.muscleGroup;
      totals.set(key, (totals.get(key) ?? 0) + l.weight * l.reps);
    }
    return [...totals.entries()]
      .map(([key, volume]) => ({
        muscleGroup: muscleName(key, lang),
        volume: Math.round(displayWeight(volume, settings.units)),
      }))
      .sort((a, b) => b.volume - a.volume);
  }, [allSetLogs, exercises, settings.units, lang]);

  const sessionStats = useMemo(() => {
    const bySession = new Map<number, { volume: number; sets: number }>();
    for (const l of allSetLogs ?? []) {
      const cur = bySession.get(l.sessionId) ?? { volume: 0, sets: 0 };
      cur.volume += l.weight * l.reps;
      cur.sets += 1;
      bySession.set(l.sessionId, cur);
    }
    return bySession;
  }, [allSetLogs]);

  if (!exercises || !sessions) return null;

  return (
    <div className="pb-4">
      <PageHeader title={t('progress.title')} subtitle={t('progress.subtitle')} />
      <div className="flex flex-col gap-3 px-4">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{t('progress.consistency')}</p>
            <p className="text-sm font-semibold text-white">
              {streak === 1 ? t('progress.week', { n: streak }) : t('progress.weeks', { n: streak })}
            </p>
          </div>
          <div className="mt-3">
            <Heatmap sessionDates={completedSessions.map((s) => s.date)} />
          </div>
        </Card>

        {muscleVolume.length > 0 && (
          <Card>
            <p className="mb-2 text-sm font-medium text-slate-300">{t('progress.volumeByMuscle')}</p>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={muscleVolume} layout="vertical" margin={{ top: 5, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="muscleGroup" width={90} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: '#e7ebf0' }} />
                  <Bar dataKey="volume" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        <Select value={exerciseId} onChange={(e) => setExerciseId(e.target.value ? Number(e.target.value) : '')}>
          <option value="">{t('progress.chooseExercise')}</option>
          {exercises.map((e) => (
            <option key={e.id} value={e.id}>{localized(e, 'name', lang)}</option>
          ))}
        </Select>

        {exerciseId && (!logs || logs.length === 0) && <EmptyState text={t('progress.noSets')} />}

        {exerciseId && logs && logs.length > 0 && (
          <>
            {pr && (
              <Card>
                <p className="text-xs font-medium uppercase tracking-wide text-amber-400">{t('progress.pr')}</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {displayWeight(pr.weight, settings.units)}
                  {settings.units} × {pr.reps}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {t('progress.estimated1RM', { value: displayWeight(pr.oneRM, settings.units), unit: settings.units })}
                </p>
              </Card>
            )}

            <Card>
              <p className="mb-2 text-sm font-medium text-slate-300">{t('progress.maxWeight', { unit: settings.units })}</p>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: '#e7ebf0' }} />
                    <Line type="monotone" dataKey="maxWeight" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <p className="mb-2 text-sm font-medium text-slate-300">{t('progress.oneRMChart', { unit: settings.units })}</p>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: '#e7ebf0' }} />
                    <Line type="monotone" dataKey="oneRM" stroke="#c084fc" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <p className="mb-2 text-sm font-medium text-slate-300">{t('progress.totalVolume', { unit: settings.units })}</p>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={{ color: '#e7ebf0' }} />
                    <Line type="monotone" dataKey="volume" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">{t('progress.history')}</p>
          {sessions.length === 0 && <EmptyState text={t('progress.noWorkouts')} />}
          <div className="flex flex-col gap-2">
            {sessions.map((s) => {
              const stats = sessionStats.get(s.id!);
              const durationMin = s.finishedAt ? Math.round((s.finishedAt - s.startedAt) / 60000) : null;
              return (
                <Card key={s.id} className="cursor-pointer !py-2.5" >
                  <div className="flex items-center justify-between" onClick={() => navigate(`/workout/session/${s.id}`)}>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {(lang === 'ar' && s.planDayNameAr) || s.planDayName}{' '}
                        {!s.completed && <span className="text-amber-400">{t('progress.inProgress')}</span>}
                      </p>
                      <p className="text-xs text-slate-400">
                        {s.date}
                        {durationMin != null ? ` · ${t('session.minutes', { n: durationMin })}` : ''}
                        {stats
                          ? ` · ${stats.sets} ${t('common.sets')} · ${t('progress.volumeSuffix', { value: Math.round(displayWeight(stats.volume, settings.units)), unit: settings.units })}`
                          : ''}
                      </p>
                    </div>
                    <span className="text-slate-500">›</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
