import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import db from '../db';
import { todayStr } from '../lib/date';
import { useT } from '../lib/i18n';
import { Card, PageHeader, Button, Input } from '../components/ui';

export default function Workout() {
  const navigate = useNavigate();
  const { t, lang } = useT();
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
    if (!confirm(t('workout.confirmDeleteDay'))) return;
    await db.planDays.delete(id);
  }

  async function quickStart(dayId: number, name: string, nameAr?: string) {
    const open = todaysOpenSessions?.find((s) => s.planDayId === dayId);
    if (open) {
      navigate(`/workout/session/${open.id}`);
      return;
    }
    const sessionId = await db.workoutSessions.add({
      date: todayStr(),
      startedAt: Date.now(),
      planDayId: dayId,
      planDayName: name,
      planDayNameAr: nameAr,
      completed: false,
    });
    navigate(`/workout/session/${sessionId}`);
  }

  if (!planDays) return null;

  return (
    <div className="pb-4">
      <PageHeader
        title={t('workout.title')}
        subtitle={t('workout.subtitle')}
        action={
          <button
            onClick={() => navigate('/programs')}
            className="shrink-0 whitespace-nowrap rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-emerald-400"
          >
            {t('programs.change')}
          </button>
        }
      />
      <div className="flex flex-col gap-3 px-4">
        {planDays.map((day) => {
          const isOpen = todaysOpenSessions?.some((s) => s.planDayId === day.id);
          const label = (lang === 'ar' && day.nameAr) || day.name;
          return (
            <Card key={day.id}>
              <div className="flex cursor-pointer items-center justify-between" onClick={() => navigate(`/workout/day/${day.id}`)}>
                <div>
                  <h2 className="text-base font-semibold text-white">{label}</h2>
                  <p className="mt-0.5 text-sm text-slate-400">{t('dashboard.exercises', { n: day.exercises.length })}</p>
                </div>
                <span className="text-slate-500">›</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button
                  onClick={() => day.id && removeDay(day.id)}
                  className="text-xs text-red-400/80 underline underline-offset-2"
                >
                  {t('workout.deleteDay')}
                </button>
                <Button
                  variant={isOpen ? 'secondary' : 'primary'}
                  className="!px-3 !py-1.5 !text-xs"
                  onClick={() => day.id && quickStart(day.id, day.name, day.nameAr)}
                  disabled={day.exercises.length === 0}
                >
                  {isOpen ? t('workout.resume') : t('workout.start')}
                </Button>
              </div>
            </Card>
          );
        })}

        {showAddDay ? (
          <Card className="flex flex-col gap-2">
            <Input placeholder={t('workout.addDayName')} value={dayName} onChange={(e) => setDayName(e.target.value)} autoFocus />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={addDay}>{t('workout.addDayBtn')}</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setShowAddDay(false)}>{t('common.cancel')}</Button>
            </div>
          </Card>
        ) : (
          <Button variant="secondary" onClick={() => setShowAddDay(true)}>{t('workout.addDay')}</Button>
        )}
      </div>
    </div>
  );
}
