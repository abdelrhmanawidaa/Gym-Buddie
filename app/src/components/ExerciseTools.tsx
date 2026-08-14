import { useState } from 'react';
import { Input } from './ui';
import { displayWeight, toKg, type Unit } from '../lib/units';
import WarmupCalc from './WarmupCalc';
import PlateCalc from './PlateCalc';

export default function ExerciseTools({
  defaultWeightKg,
  units,
  barWeightKg,
  availablePlatesKg,
}: {
  defaultWeightKg: number;
  units: Unit;
  barWeightKg: number;
  availablePlatesKg: number[];
}) {
  const [open, setOpen] = useState(false);
  const [weightStr, setWeightStr] = useState(defaultWeightKg > 0 ? String(displayWeight(defaultWeightKg, units)) : '');

  const weightKg = toKg(Number(weightStr) || 0, units);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
      >
        🧮 Warm-up &amp; plate calculator
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder={`Working weight (${units})`}
            value={weightStr}
            onChange={(e) => setWeightStr(e.target.value)}
          />
          {weightKg > 0 && (
            <>
              <WarmupCalc targetWeightKg={weightKg} units={units} />
              <PlateCalc targetWeightKg={weightKg} barWeightKg={barWeightKg} availablePlatesKg={availablePlatesKg} units={units} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
