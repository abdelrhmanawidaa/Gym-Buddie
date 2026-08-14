import { computeHeatmap } from '../lib/streak';

export default function Heatmap({ sessionDates, weeks = 12 }: { sessionDates: string[]; weeks?: number }) {
  const days = computeHeatmap(sessionDates, weeks);
  const columns: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7));

  function colorFor(count: number, inFuture: boolean) {
    if (inFuture) return 'bg-white/[0.02]';
    if (count === 0) return 'bg-white/5';
    if (count === 1) return 'bg-emerald-600/50';
    return 'bg-emerald-400';
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {columns.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-1">
          {col.map((d) => (
            <div key={d.date} title={`${d.date}${d.count ? `: ${d.count} workout${d.count > 1 ? 's' : ''}` : ''}`} className={`h-3 w-3 rounded-sm ${colorFor(d.count, d.inFuture)}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
