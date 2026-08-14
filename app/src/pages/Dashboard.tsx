import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import db from '../db';
import { todayStr } from '../lib/date';
import { Card, PageHeader, ProgressBar, Button, EmptyState } from '../components/ui';
import { useSettings } from '../lib/useSettings';
import { displayWeight } from '../lib/units';
import { computeWeeklyStreak } from '../lib/streak';

export default function Dashboard() {
  const navigate = useNavigate();
  const today = todayStr();
  const settings = useSettings();

  const planDays = useLiveQuery(() => db.planDays.orderBy('order').toArray(), []);
  const sessions = useLiveQuery(() => db.workoutSessions.orderBy('id').reverse().toArray(), []);
  const goal = useLiveQuery(() => db.nutritionGoals.toCollection().first(), []);
  const todayFood = useLiveQuery(() => db.foodLogs.where('date').equals(today).toArray(), [today]);
  const lastBodyStat = useLiveQuery(() => db.bodyStats.orderBy('date').reverse().first(), []);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const allSetLogs = useLiveQuery(() => db.setLogs.toArray(), []);

  if (!planDays || !sessions || !exercises || !allSetLogs) return null;

  const streak = computeWeeklyStreak(sessions.filter((s) => s.completed).map((s) => s.date));

  const exById = new Map(exercises.map((e) => [e.id!, e]));
  const muscleGroups = [...new Set(exercises.map((e) => e.muscleGroup))];
  const daysSinceByMuscle = muscleGroups
    .map((mg) => {
      const lastDate = allSetLogs
        .filter((l) => exById.get(l.exerciseId)?.muscleGroup === mg)
        .reduce<string | null>((max, l) => (!max || l.date > max ? l.date : max), null);
      if (!lastDate) return null;
      const days = Math.round((new Date(today + 'T00:00:00').getTime() - new Date(lastDate + 'T00:00:00').getTime()) / 86400000);
      return { muscleGroup: mg, days };
    })
    .filter((x): x is { muscleGroup: string; days: number } => x !== null)
    .sort((a, b) => a.days - b.days);

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
      <PageHeader
        title="Today"
        subtitle={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        action={
          <button
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <GearIcon className="h-5 w-5" />
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-4">
        {streak > 0 && (
          <button onClick={() => navigate('/progress')} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-left">
            <span className="text-sm text-slate-300">🔥 {streak}-week streak</span>
            <span className="text-xs text-slate-500">view progress ›</span>
          </button>
        )}

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
          {lastBodyStat?.weight != null ? (
            <p className="mt-1 text-lg font-semibold text-white">
              {displayWeight(lastBodyStat.weight, settings.units)} {settings.units}{' '}
              <span className="text-sm font-normal text-slate-400">on {lastBodyStat.date}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">No entries yet.</p>
          )}
        </Card>

        {daysSinceByMuscle.length > 0 && (
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-purple-400">Muscle recovery</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {daysSinceByMuscle.map(({ muscleGroup, days }) => (
                <span
                  key={muscleGroup}
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    days === 0 ? 'bg-red-500/15 text-red-300' : days === 1 ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                  }`}
                >
                  {muscleGroup} · {days === 0 ? 'today' : days === 1 ? '1 day' : `${days} days`}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function GearIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
