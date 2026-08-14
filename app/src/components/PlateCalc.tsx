import { calculatePlates } from '../lib/plates';
import { displayWeight, type Unit } from '../lib/units';

export default function PlateCalc({
  targetWeightKg,
  barWeightKg,
  availablePlatesKg,
  units,
}: {
  targetWeightKg: number;
  barWeightKg: number;
  availablePlatesKg: number[];
  units: Unit;
}) {
  const result = calculatePlates(targetWeightKg, barWeightKg, availablePlatesKg);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
      <p className="text-xs text-slate-400">
        Bar {displayWeight(barWeightKg, units)}
        {units} + plates per side:
      </p>
      {result.perSide.length === 0 ? (
        <p className="mt-1 text-slate-500">Just the bar.</p>
      ) : (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {result.perSide.map((p, i) => (
            <span key={i} className="rounded-md bg-emerald-500/15 px-2 py-1 font-mono text-xs text-emerald-300">
              {displayWeight(p, units)}
            </span>
          ))}
        </div>
      )}
      {result.remainder > 0.05 && (
        <p className="mt-1.5 text-xs text-amber-400">
          Can't hit target exactly with these plates — closest is {displayWeight(result.achievedWeight, units)}
          {units}.
        </p>
      )}
    </div>
  );
}
