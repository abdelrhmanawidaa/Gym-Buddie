import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import db from '../db';
import { Card, PageHeader, Button, Input } from '../components/ui';

export default function Workout() {
  const navigate = useNavigate();
  const planDays = useLiveQuery(() => db.planDays.orderBy('order').toArray(), []);
  const [showAddDay, setShowAddDay] = useState(false);
  const [dayName, setDayName] = useState('');

  async function addDay() {
    if (!dayName.trim()) return;
    const maxOrder = planDays && planDays.length ? Math.max(...planDays.map((d) => d.order)) : -1;
    await db.planDays.add({ order: maxOrder + 1, name: dayName.trim(), exercises: [] });
    setDayName('');
    setShowAddDay(false);
  }

  async function removeDay(id: number) {
    if (!confirm('Delete this workout day?')) return;
    await db.planDays.delete(id);
  }

  if (!planDays) return null;

  return (
    <div className="pb-4">
      <PageHeader title="Workout Plan" subtitle="Your split, exercises & machines" />
      <div className="flex flex-col gap-3 px-4">
        {planDays.map((day) => (
          <Card key={day.id} className="cursor-pointer" >
            <div className="flex items-center justify-between" onClick={() => navigate(`/workout/day/${day.id}`)}>
              <div>
                <h2 className="text-base font-semibold text-white">{day.name}</h2>
                <p className="mt-0.5 text-sm text-slate-400">{day.exercises.length} exercises</p>
              </div>
              <span className="text-slate-500">›</span>
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => day.id && removeDay(day.id)}
                className="text-xs text-red-400/80 underline underline-offset-2"
              >
                delete day
              </button>
            </div>
          </Card>
        ))}

        {showAddDay ? (
          <Card className="flex flex-col gap-2">
            <Input placeholder="e.g. Upper Body" value={dayName} onChange={(e) => setDayName(e.target.value)} autoFocus />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={addDay}>Add Day</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setShowAddDay(false)}>Cancel</Button>
            </div>
          </Card>
        ) : (
          <Button variant="secondary" onClick={() => setShowAddDay(true)}>+ Add Workout Day</Button>
        )}
      </div>
    </div>
  );
}
