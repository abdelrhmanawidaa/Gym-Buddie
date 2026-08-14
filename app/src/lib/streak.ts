function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // days since Monday
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function weekKey(d: Date): string {
  return toLocalDateStr(startOfWeek(d));
}

/** Number of consecutive weeks (Mon-Sun), counting back from the current week, with >=1 workout. */
export function computeWeeklyStreak(sessionDates: string[]): number {
  if (sessionDates.length === 0) return 0;
  const weeksWithWorkout = new Set(sessionDates.map((d) => weekKey(parseDate(d))));

  let streak = 0;
  const cursor = startOfWeek(new Date());
  for (;;) {
    const key = toLocalDateStr(cursor);
    if (weeksWithWorkout.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 7);
    } else {
      break;
    }
  }
  return streak;
}

export interface HeatmapDay {
  date: string;
  count: number;
  inFuture: boolean;
}

/** Grid of the last `weeks` weeks (Mon-Sun rows omitted; returned as flat day list, oldest first). */
export function computeHeatmap(sessionDates: string[], weeks: number): HeatmapDay[] {
  const counts = new Map<string, number>();
  for (const d of sessionDates) counts.set(d, (counts.get(d) ?? 0) + 1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = startOfWeek(today);
  start.setDate(start.getDate() - (weeks - 1) * 7);

  const days: HeatmapDay[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < weeks * 7; i++) {
    const dateStr = toLocalDateStr(cursor);
    days.push({ date: dateStr, count: counts.get(dateStr) ?? 0, inFuture: cursor > today });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}
