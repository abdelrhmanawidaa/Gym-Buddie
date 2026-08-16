import { useLiveQuery } from 'dexie-react-hooks';
import db, { type Settings } from '../db';

const FALLBACK: Settings = {
  lang: 'en',
  units: 'kg',
  restTimerDefaultSec: 90,
  barWeightKg: 20,
  availablePlatesKg: [25, 20, 15, 10, 5, 2.5, 1.25],
};

export function useSettings(): Settings {
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);
  return settings ?? FALLBACK;
}
