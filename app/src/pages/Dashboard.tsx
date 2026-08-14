import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import db from '../db';
import { todayStr } from '../lib/date';
import { Card, PageHeader, ProgressBar, Button, EmptyState } from '../components/ui';

export default function Dashboard() {
  const navigate = useNavigate();
  const today = todayStr();

  const planDays = useLiveQuery(() => db.planDays.orderBy('order').toArray(), []);
  const sessions = useLiveQuery(() => db.workoutSessions.orderBy('id').reverse().toArray(), []);
  const goal = useLiveQuery(() => db.nutritionGoals.toCollection().first(), []);
  const todayFood = useLiveQuery(() => db.foodLogs.where('date').equals(today).toArray(), [today]);
  const lastBodyStat = useLiveQuery(() => db.bodyStats.orderBy('date').reverse().first(), []);

  if (!planDays || !sessions) return null;

  const lastCompleted = sessions.find((s) => s.completed);
  let nextIndex = 0;
  if (lastCompleted) {
    const idx = planDays.findIndex((d) => d.id === lastCompleted.planDayId);
    nextIndex = idx >= 0 ? (idx + 1) % planDays.length : 0;
  }
  const nextDay = planDays[nextIndex];

  const todayTotals = (todayFood ?? []).reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
    }),
    { calories: 0, protein: 0 },
  );

  const todaysSession = sessions.find((s) => s.date === today && !s.completed);

  return (
    <div className="pb-4">
      <PageHeader title="Today" subtitle={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} />

      <div className="flex flex-col gap-3 px-4">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">Up next</p>
          {nextDay ? (
            <>
              <h2 className="mt-1 text-lg font-semibold text-white">{nextDay.name}</h2>
              <p className="mt-0.5 text-sm text-slate-400">{nextDay.exercises.length} exercises</p>
              <Button
                className="mt-3 w-full"
                onClick={() =>
                  todaysSession
                    ? navigate(`/workout/session/${todaysSession.id}`)
                    : navigate(`/workout/day/${nextDay.id}`)
                }
              >
                {todaysSession ? 'Resume Workout' : 'View & Start Workout'}
              </Button>
            </>
          ) : (
            <EmptyState text="No workout plan yet. Add one in the Workout tab." />
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-sky-400">Nutrition today</p>
            <button onClick={() => navigate('/nutrition')} className="text-xs text-slate-400 underline underline-offset-2">
              details
            </button>
          </div>
          {goal ? (
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-300">Calories</span>
                  <span className="text-slate-400">
                    {Math.round(todayTotals.calories)} / {goal.calories} kcal
                  </span>
                </div>
                <ProgressBar value={todayTotals.calories} max={goal.calories} color="#38bdf8" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-300">Protein</span>
                  <span className="text-slate-400">
                    {Math.round(todayTotals.protein)} / {goal.protein} g
                  </span>
                </div>
                <ProgressBar value={todayTotals.protein} max={goal.protein} color="#34d399" />
              </div>
            </div>
          ) : (
            <EmptyState text="Set your calorie & protein goals in the Food tab." />
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-400">Body weight</p>
            <button onClick={() => navigate('/body')} className="text-xs text-slate-400 underline underline-offset-2">
              log
            </button>
          </div>
          {lastBodyStat ? (
            <p className="mt-1 text-lg font-semibold text-white">
              {lastBodyStat.weight ?? '—'} kg <span className="text-sm font-normal text-slate-400">on {lastBodyStat.date}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">No entries yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
