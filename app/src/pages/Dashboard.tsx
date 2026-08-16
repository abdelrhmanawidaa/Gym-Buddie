import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import db from '../db';
import { todayStr } from '../lib/date';
import { Card, PageHeader, ProgressBar, Button, EmptyState } from '../components/ui';
import { useT } from '../lib/i18n';
import { useSettings } from '../lib/useSettings';
import { displayWeight } from '../lib/units';
import { computeWeeklyStreak } from '../lib/streak';
import { useMuscleStats } from '../lib/useMuscleStats';
import { recommendToday } from '../lib/muscleStats';

export default function Dashboard() {
  const navigate = useNavigate();
  const today = todayStr();
  const { t, lang } = useT();
  const settings = useSettings();
  const { stats } = useMuscleStats();

  const planDays = useLiveQuery(() => db.planDays.orderBy('order').toArray(), []);
  const sessions = useLiveQuery(() => db.workoutSessions.orderBy('id').reverse().toArray(), []);
  const goal = useLiveQuery(() => db.nutritionGoals.toCollection().first(), []);
  const todayFood = useLiveQuery(() => db.foodLogs.where('date').equals(today).toArray(), [today]);
  const lastBodyStat = useLiveQuery(() => db.bodyStats.orderBy('date').reverse().first(), []);

  if (!planDays || !sessions || !stats) return null;

  const streak = computeWeeklyStreak(sessions.filter((s) => s.completed).map((s) => s.date));
  const recommended = recommendToday(stats, 3);
  const recovery = stats
    .filter((s) => s.daysSince !== null)
    .sort((a, b) => (a.daysSince ?? 0) - (b.daysSince ?? 0));

  const lastCompleted = sessions.find((s) => s.completed);
  let nextIndex = 0;
  if (lastCompleted) {
    const idx = planDays.findIndex((d) => d.id === lastCompleted.planDayId);
    nextIndex = idx >= 0 ? (idx + 1) % planDays.length : 0;
  }
  const nextDay = planDays[nextIndex];
  const nextDayName = nextDay ? ((lang === 'ar' && nextDay.nameAr) || nextDay.name) : '';

  const todayTotals = (todayFood ?? []).reduce(
    (acc, f) => ({ calories: acc.calories + f.calories, protein: acc.protein + f.protein }),
    { calories: 0, protein: 0 },
  );

  const todaysSession = sessions.find((s) => s.date === today && !s.completed);

  return (
    <div className="pb-4">
      <PageHeader
        title={t('dashboard.title')}
        subtitle={new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
        action={
          <button
            onClick={() => navigate('/settings')}
            aria-label={t('dashboard.settings')}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <GearIcon className="h-5 w-5" />
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-4">
        {streak > 0 && (
          <button
            onClick={() => navigate('/progress')}
            className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-start"
          >
            <span className="text-sm text-slate-300">{t('dashboard.streak', { n: streak })}</span>
            <span className="text-xs text-slate-500">{t('dashboard.viewProgress')}</span>
          </button>
        )}

        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{t('dashboard.upNext')}</p>
          {nextDay ? (
            <>
              <h2 className="mt-1 text-lg font-semibold text-white">{nextDayName}</h2>
              <p className="mt-0.5 text-sm text-slate-400">{t('dashboard.exercises', { n: nextDay.exercises.length })}</p>
              <Button
                className="mt-3 w-full"
                onClick={() =>
                  todaysSession
                    ? navigate(`/workout/session/${todaysSession.id}`)
                    : navigate(`/workout/day/${nextDay.id}`)
                }
              >
                {todaysSession ? t('dashboard.resume') : t('dashboard.viewStart')}
              </Button>
            </>
          ) : (
            <EmptyState text={t('dashboard.noPlan')} />
          )}
        </Card>

        {recommended.length > 0 && (
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-purple-400">{t('dashboard.trainToday')}</p>
            <p className="mt-0.5 text-xs text-slate-500">{t('dashboard.trainTodayHint')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {recommended.map((s) => (
                <button
                  key={s.def.key}
                  onClick={() => navigate(`/muscles/${s.def.key}`)}
                  className="rounded-full bg-purple-500/15 px-3 py-1.5 text-sm font-medium text-purple-200"
                >
                  {lang === 'ar' ? s.def.ar : s.def.en}
                </button>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-sky-400">{t('dashboard.nutritionToday')}</p>
            <button onClick={() => navigate('/nutrition')} className="text-xs text-slate-400 underline underline-offset-2">
              {t('common.details')}
            </button>
          </div>
          {goal ? (
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-300">{t('nutrition.calories')}</span>
                  <span className="text-slate-400">
                    {Math.round(todayTotals.calories)} / {goal.calories} kcal
                  </span>
                </div>
                <ProgressBar value={todayTotals.calories} max={goal.calories} color="#38bdf8" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-300">{t('nutrition.protein')}</span>
                  <span className="text-slate-400">
                    {Math.round(todayTotals.protein)} / {goal.protein} g
                  </span>
                </div>
                <ProgressBar value={todayTotals.protein} max={goal.protein} color="#34d399" />
              </div>
            </div>
          ) : (
            <EmptyState text={t('dashboard.setGoals')} />
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-400">{t('dashboard.bodyWeight')}</p>
            <button onClick={() => navigate('/body')} className="text-xs text-slate-400 underline underline-offset-2">
              {t('common.log')}
            </button>
          </div>
          {lastBodyStat?.weight != null ? (
            <p className="mt-1 text-lg font-semibold text-white">
              {displayWeight(lastBodyStat.weight, settings.units)} {settings.units}{' '}
              <span className="text-sm font-normal text-slate-400">{lastBodyStat.date}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">{t('dashboard.noEntries')}</p>
          )}
        </Card>

        {recovery.length > 0 && (
          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-purple-400">{t('dashboard.muscleRecovery')}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {recovery.map((s) => (
                <button
                  key={s.def.key}
                  onClick={() => navigate(`/muscles/${s.def.key}`)}
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    s.daysSince === 0
                      ? 'bg-red-500/15 text-red-300'
                      : (s.daysSince ?? 0) < s.def.recoveryDays
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-emerald-500/15 text-emerald-300'
                  }`}
                >
                  {lang === 'ar' ? s.def.ar : s.def.en} ·{' '}
                  {s.daysSince === 0
                    ? t('common.today')
                    : s.daysSince === 1
                      ? t('common.day')
                      : t('common.days', { n: s.daysSince ?? 0 })}
                </button>
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
