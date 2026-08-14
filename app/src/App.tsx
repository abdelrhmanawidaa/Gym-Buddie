import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { seedIfEmpty } from './db';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import WorkoutDay from './pages/WorkoutDay';
import WorkoutSession from './pages/WorkoutSession';
import Progress from './pages/Progress';
import Nutrition from './pages/Nutrition';
import BodyStats from './pages/BodyStats';

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
    <HashRouter>
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex-1 pb-2">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/workout/day/:dayId" element={<WorkoutDay />} />
            <Route path="/workout/session/:sessionId" element={<WorkoutSession />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/body" element={<BodyStats />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </HashRouter>
  );
}
