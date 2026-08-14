import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import db from '../db';
import { todayStr } from '../lib/date';
import { Card, PageHeader, Button, Input, EmptyState } from '../components/ui';

export default function BodyStats() {
  const stats = useLiveQuery(() => db.bodyStats.orderBy('date').toArray(), []);
  const today = todayStr();
  const todaysEntry = stats?.find((s) => s.date === today);

  const [form, setForm] = useState({ weight: '', chest: '', waist: '', hips: '', arms: '', thighs: '', notes: '' });
  const [showForm, setShowForm] = useState(false);

  const chartData = useMemo(
    () => (stats ?? []).filter((s) => s.weight != null).map((s) => ({ date: s.date, weight: s.weight })),
    [stats],
  );

  async function save() {
    const payload = {
      date: today,
      weight: numOrUndef(form.weight),
      chest: numOrUndef(form.chest),
      waist: numOrUndef(form.waist),
      hips: numOrUndef(form.hips),
      arms: numOrUndef(form.arms),
      thighs: numOrUndef(form.thighs),
      notes: form.notes.trim() || undefined,
    };
    if (todaysEntry) {
      await db.bodyStats.update(todaysEntry.id!, payload);
    } else {
      await db.bodyStats.add(payload);
    }
    setShowForm(false);
    setForm({ weight: '', chest: '', waist: '', hips: '', arms: '', thighs: '', notes: '' });
  }

  async function removeEntry(id: number) {
    await db.bodyStats.delete(id);
  }

  if (!stats) return null;

  return (
    <div className="pb-4">
      <PageHeader title="Body Stats" subtitle="Weight & measurements over time" />
      <div className="flex flex-col gap-3 px-4">
        {chartData.length > 1 && (
          <Card>
            <p className="mb-2 text-sm font-medium text-slate-300">Body weight (kg)</p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ background: '#151b23', border: '1px solid #ffffff20', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#e7ebf0' }} />
                  <Line type="monotone" dataKey="weight" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {showForm || todaysEntry ? (
          !showForm && todaysEntry ? (
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-400">Today's entry</p>
                <button onClick={() => { setForm(toFormState(todaysEntry)); setShowForm(true); }} className="text-xs text-slate-400 underline underline-offset-2">
                  edit
                </button>
              </div>
              <p className="mt-1 text-lg font-semibold text-white">{todaysEntry.weight ?? '—'} kg</p>
            </Card>
          ) : (
            <Card className="flex flex-col gap-2">
              <p className="text-sm font-medium text-slate-300">Log today ({today})</p>
              <Input type="number" inputMode="decimal" placeholder="Weight (kg)" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" inputMode="decimal" placeholder="Chest (cm)" value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} />
                <Input type="number" inputMode="decimal" placeholder="Waist (cm)" value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} />
                <Input type="number" inputMode="decimal" placeholder="Hips (cm)" value={form.hips} onChange={(e) => setForm({ ...form, hips: e.target.value })} />
                <Input type="number" inputMode="decimal" placeholder="Arms (cm)" value={form.arms} onChange={(e) => setForm({ ...form, arms: e.target.value })} />
                <Input type="number" inputMode="decimal" placeholder="Thighs (cm)" value={form.thighs} onChange={(e) => setForm({ ...form, thighs: e.target.value })} />
              </div>
              <Input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={save}>Save</Button>
                <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </Card>
          )
        ) : (
          <Button onClick={() => setShowForm(true)}>+ Log Today's Stats</Button>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">History</p>
          {stats.length === 0 && <EmptyState text="No entries yet." />}
          <div className="flex flex-col gap-2">
            {stats
              .slice()
              .reverse()
              .map((s) => (
                <Card key={s.id} className="flex items-center justify-between !py-2.5">
                  <div>
                    <p className="text-sm font-medium text-white">{s.date}</p>
                    <p className="text-xs text-slate-400">
                      {s.weight != null ? `${s.weight}kg` : ''}
                      {s.chest != null ? ` · Chest ${s.chest}cm` : ''}
                      {s.waist != null ? ` · Waist ${s.waist}cm` : ''}
                    </p>
                  </div>
                  <button onClick={() => removeEntry(s.id!)} className="text-xs text-red-400/80 underline underline-offset-2">
                    remove
                  </button>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function numOrUndef(v: string): number | undefined {
  return v.trim() === '' ? undefined : Number(v);
}

function toFormState(entry: { weight?: number; chest?: number; waist?: number; hips?: number; arms?: number; thighs?: number; notes?: string }) {
  return {
    weight: entry.weight?.toString() ?? '',
    chest: entry.chest?.toString() ?? '',
    waist: entry.waist?.toString() ?? '',
    hips: entry.hips?.toString() ?? '',
    arms: entry.arms?.toString() ?? '',
    thighs: entry.thighs?.toString() ?? '',
    notes: entry.notes ?? '',
  };
}
