import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import db from '../db';
import { todayStr } from '../lib/date';
import { Card, PageHeader, Button, Input } from '../components/ui';

export default function Workout() {
  const navigate = useNavigate();
  const planDays = useLiveQuery(() => db.planDays.orderBy('order').toArray(), []);
  const todaysOpenSessions = useLiveQuery(
    () => db.workoutSessions.where('date').equals(todayStr()).filter((s) => !s.completed).toArray(),
    [],
  );
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

  async function quickStart(dayId: number, dayName: string) {
    const open = todaysOpenSessions?.find((s) => s.planDayId === dayId);
    if (open) {
      navigate(`/workout/session/${open.id}`);
      return;
    }
    const sessionId = await db.workoutSessions.add({
      date: todayStr(),
      startedAt: Date.now(),
      planDayId: dayId,
      planDayName: dayName,
      completed: false,
    });
    navigate(`/workout/session/${sessionId}`);
  }

  if (!planDays) return null;

  return (
    <div className="pb-4">
      <PageHeader title="Workout Plan" subtitle="Your split, exercises & machines" />
      <div className="flex flex-col gap-3 px-4">
        {planDays.map((day) => {
          const isOpen = todaysOpenSessions?.some((s) => s.planDayId === day.id);
          return (
            <Card key={day.id}>
              <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate(`/workout/day/${day.id}`)}>
                <div>
                  <h2 className="text-base font-semibold text-white">{day.name}</h2>
                  <p className="mt-0.5 text-sm text-slate-400">{day.exercises.length} exercises</p>
                </div>
                <span className="text-slate-500">›</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button
                  onClick={() => day.id && removeDay(day.id)}
                  className="text-xs text-red-400/80 underline underline-offset-2"
                >
                  delete day
                </button>
                <Button
                  variant={isOpen ? 'secondary' : 'primary'}
                  className="!py-1.5 !px-3 !text-xs"
                  onClick={() => day.id && quickStart(day.id, day.name)}
                  disabled={day.exercises.length === 0}
                >
                  {isOpen ? 'Resume' : 'Start ▸'}
                </Button>
              </div>
            </Card>
          );
        })}

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
