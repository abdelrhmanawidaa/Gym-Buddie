import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import { seedIfEmpty } from './db';
import I18nProvider from './components/I18nProvider';
import { useT } from './lib/i18n';
import Dashboard from './pages/Dashboard';

// Everything but the landing page is loaded on demand, so the first paint
// doesn't have to pull in heavy per-page code (charts, the body map, etc).
const Workout = lazy(() => import('./pages/Workout'));
const Programs = lazy(() => import('./pages/Programs'));
const WorkoutDay = lazy(() => import('./pages/WorkoutDay'));
const WorkoutSession = lazy(() => import('./pages/WorkoutSession'));
const Muscles = lazy(() => import('./pages/Muscles'));
const MuscleDetail = lazy(() => import('./pages/MuscleDetail'));
const Scanner = lazy(() => import('./pages/Scanner'));
const Progress = lazy(() => import('./pages/Progress'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const BodyStats = lazy(() => import('./pages/BodyStats'));
const Settings = lazy(() => import('./pages/Settings'));

function Spinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedIfEmpty().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
        <span className="text-sm">Loading Gym Buddie…</span>
      </div>
    );
  }

  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  );
}

function Shell() {
  const { dir } = useT();

  return (
    <HashRouter>
      <div dir={dir} className="flex min-h-screen flex-1 flex-col">
        <div className="flex-1 pb-2">
          <RoutedContent />
        </div>
        <BottomNav />
      </div>
    </HashRouter>
  );
}

function RoutedContent() {
  const location = useLocation();

  return (
    // Keyed on the path so a crash on one screen clears itself the moment
    // the user navigates away, instead of sticking around forever.
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/workout/day/:dayId" element={<WorkoutDay />} />
          <Route path="/workout/session/:sessionId" element={<WorkoutSession />} />
          <Route path="/muscles" element={<Muscles />} />
          <Route path="/muscles/:muscleKey" element={<MuscleDetail />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/body" element={<BodyStats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
