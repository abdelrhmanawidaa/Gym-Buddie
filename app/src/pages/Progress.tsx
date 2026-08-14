import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import db from '../db';
import { Card, PageHeader, Select, EmptyState } from '../components/ui';

export default function Progress() {
  const exercises = useLiveQuery(
    () => db.exercises.toArray().then((list) => list.sort((a, b) => a.name.localeCompare(b.name))),
    [],
  );
  const [exerciseId, setExerciseId] = useState<number | ''>('');

  const logs = useLiveQuery(() => {
    if (!exerciseId) return [];
    return db.setLogs.where('exerciseId').equals(exerciseId as number).toArray();
  }, [exerciseId]);

  const sessions = useLiveQuery(() => db.workoutSessions.toArray(), []);

  const chartData = useMemo(() => {
    if (!logs || !sessions) return [];
    const bySession = new Map<number, { weight: number; volume: number }>();
    for (const l of logs) {
      const cur = bySession.get(l.sessionId) ?? { weight: 0, volume: 0 };
      cur.weight = Math.max(cur.weight, l.weight);
      cur.volume += l.weight * l.reps;
      bySession.set(l.sessionId, cur);
    }
    const sessById = new Map(sessions.map((s) => [s.id!, s]));
    return [...bySession.entries()]
      .map(([sid, v]) => ({ date: sessById.get(sid)?.date ?? '', maxWeight: v.weight, volume: v.volume, sid }))
      .filter((d) => d.date)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [logs, sessions]);

  const pr = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    const maxWeight = Math.max(...logs.map((l) => l.weight));
    const bestSet = logs.filter((l) => l.weight === maxWeight).sort((a, b) => b.reps - a.reps)[0];
    return { weight: maxWeight, reps: bestSet.reps };
  }, [logs]);

  if (!exercises) return null;

  return (
    <div className="pb-4">
      <PageHeader title="Progress" subtitle="Track strength gains over time" />
      <div className="flex flex-col gap-3 px-4">
        <Select value={exerciseId} onChange={(e) => setExerciseId(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Choose an exercise…</option>
          {exercises.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </Select>

        {!exerciseId && <EmptyState text="Pick an exercise to see your progress chart." />}

        {exerciseId && (!logs || logs.length === 0) && <EmptyState text="No logged sets yet for this exercise." />}

        {exerciseId && logs && logs.length > 0 && (
          <>
            {pr && (
              <Card>
                <p className="text-xs font-medium uppercase tracking-wide text-amber-400">Personal Record</p>
                <p className="mt-1 text-2xl font-bold text-white">{pr.weight}kg × {pr.reps}</p>
              </Card>
            )}

            <Card>
              <p className="mb-2 text-sm font-medium text-slate-300">Max weight per session (kg)</p>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip
                      contentStyle={{ background: '#151b23', border: '1px solid #ffffff20', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#e7ebf0' }}
                    />
                    <Line type="monotone" dataKey="maxWeight" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <p className="mb-2 text-sm font-medium text-slate-300">Total volume per session (kg × reps)</p>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ background: '#151b23', border: '1px solid #ffffff20', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#e7ebf0' }}
                    />
                    <Line type="monotone" dataKey="volume" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
