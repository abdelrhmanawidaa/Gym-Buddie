import { warmupSets } from '../lib/warmup';
import { useT } from '../lib/i18n';
import { displayWeight, type Unit } from '../lib/units';

export default function WarmupCalc({ targetWeightKg, units }: { targetWeightKg: number; units: Unit }) {
  const { t } = useT();
  const sets = warmupSets(targetWeightKg);

  if (sets.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-500">
        {t('session.enterWeightFirst')}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
      <p className="text-xs text-slate-400">
        {t('session.warmupFor', { weight: displayWeight(targetWeightKg, units), unit: units })}
      </p>
      <div className="mt-1.5 flex flex-col gap-1">
        {sets.map((s, i) => (
          <div key={i} className="flex justify-between font-mono text-xs text-slate-200">
            <span>{s.pct}%</span>
            <span>
              {displayWeight(s.weight, units)}
              {units} × {s.reps}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
