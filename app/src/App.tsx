import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { seedIfEmpty } from './db';
import I18nProvider from './components/I18nProvider';
import { useT } from './lib/i18n';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import Programs from './pages/Programs';
import WorkoutDay from './pages/WorkoutDay';
import WorkoutSession from './pages/WorkoutSession';
import Muscles from './pages/Muscles';
import MuscleDetail from './pages/MuscleDetail';
import Scanner from './pages/Scanner';
import Progress from './pages/Progress';
import Nutrition from './pages/Nutrition';
import BodyStats from './pages/BodyStats';
import Settings from './pages/Settings';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedIfEmpty().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading Gym Buddie…
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
        </div>
        <BottomNav />
      </div>
    </HashRouter>
  );
}
