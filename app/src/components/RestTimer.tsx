import { useEffect, useRef, useState } from 'react';

export interface RestTimerHandle {
  start: (seconds: number) => void;
}

export default function RestTimer({ onRegister }: { onRegister: (handle: RestTimerHandle) => void }) {
  const [total, setTotal] = useState(0);
  const [left, setLeft] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    onRegister({
      start: (seconds) => {
        setTotal(seconds);
        setLeft(seconds);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (left === null) return;
    if (left <= 0) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      const t = setTimeout(() => setLeft(null), 1500);
      return () => clearTimeout(t);
    }
    intervalRef.current = window.setTimeout(() => setLeft((l) => (l ?? 0) - 1), 1000);
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [left]);

  if (left === null) return null;

  const pct = total > 0 ? Math.max(0, (left / total) * 100) : 0;
  const mins = Math.floor(Math.max(left, 0) / 60);
  const secs = Math.max(left, 0) % 60;

  return (
    <div className="sticky bottom-16 z-30 mx-4 mb-2 overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#0e1520] shadow-lg">
      <div className="h-1 w-full bg-white/10">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between px-4 py-2.5">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-emerald-400">Rest</p>
          <p className="text-lg font-bold tabular-nums text-white">
            {left <= 0 ? "Go!" : `${mins}:${String(secs).padStart(2, '0')}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLeft((l) => Math.max(0, (l ?? 0) - 15))}
            className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white"
          >
            -15s
          </button>
          <button
            onClick={() => setLeft((l) => (l ?? 0) + 15)}
            className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white"
          >
            +15s
          </button>
          <button
            onClick={() => setLeft(null)}
            className="rounded-lg bg-red-500/15 px-2.5 py-1.5 text-xs font-medium text-red-400"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
