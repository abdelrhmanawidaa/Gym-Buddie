import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db, { type Meal } from '../db';
import { todayStr, formatDate, addDays } from '../lib/date';
import { Card, PageHeader, Button, Input, Select, ProgressBar, EmptyState } from '../components/ui';

const QUICK_PRESETS = [
  { name: 'Chicken Breast (150g)', calories: 248, protein: 46, carbs: 0, fat: 5 },
  { name: 'Whey Protein Scoop', calories: 120, protein: 24, carbs: 3, fat: 1 },
  { name: 'Rice (1 cup cooked)', calories: 205, protein: 4, carbs: 45, fat: 0.5 },
  { name: '3 Whole Eggs', calories: 234, protein: 19, carbs: 1, fat: 16 },
  { name: 'Greek Yogurt (200g)', calories: 146, protein: 20, carbs: 8, fat: 4 },
  { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0.4 },
];

const WATER_QUICK_ADD = [250, 500, 750];

const MEAL_ORDER: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABEL: Record<Meal, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

function defaultMeal(): Meal {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

export default function Nutrition() {
  const [date, setDate] = useState(todayStr());
  const [showAdd, setShowAdd] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [managePresets, setManagePresets] = useState(false);
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', meal: defaultMeal(), saveAsPreset: false });

  const goal = useLiveQuery(() => db.nutritionGoals.toCollection().first(), []);
  const logs = useLiveQuery(() => db.foodLogs.where('date').equals(date).toArray(), [date]);
  const presets = useLiveQuery(() => db.foodPresets.orderBy('name').toArray(), []);
  const waterLogs = useLiveQuery(() => db.waterLogs.where('date').equals(date).toArray(), [date]);

  if (!goal) return null;

  const totals = (logs ?? []).reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + (f.carbs ?? 0),
      fat: acc.fat + (f.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const waterTotal = (waterLogs ?? []).reduce((sum, w) => sum + w.ml, 0);
  const waterGoal = goal.waterMl ?? 2500;

  async function addPreset(p: { name: string; calories: number; protein: number; carbs?: number; fat?: number }) {
    await db.foodLogs.add({ date, name: p.name, calories: p.calories, protein: p.protein, carbs: p.carbs, fat: p.fat, meal: defaultMeal(), createdAt: Date.now() });
  }

  async function deletePreset(id: number) {
    await db.foodPresets.delete(id);
  }

  async function addCustom() {
    if (!form.name.trim() || !form.calories) return;
    const entry = {
      name: form.name.trim(),
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    };
    await db.foodLogs.add({ date, meal: form.meal, createdAt: Date.now(), ...entry });
    if (form.saveAsPreset) {
      await db.foodPresets.add(entry);
    }
    setForm({ name: '', calories: '', protein: '', carbs: '', fat: '', meal: defaultMeal(), saveAsPreset: false });
    setShowAdd(false);
  }

  async function removeLog(id: number) {
    await db.foodLogs.delete(id);
  }

  async function addWater(ml: number) {
    await db.waterLogs.add({ date, ml, createdAt: Date.now() });
  }

  async function removeLastWater() {
    const last = (waterLogs ?? []).slice().sort((a, b) => b.createdAt - a.createdAt)[0];
    if (last?.id) await db.waterLogs.delete(last.id);
  }

  async function saveGoal(next: { calories: number; protein: number; carbs: number; fat: number; waterMl: number }) {
    await db.nutritionGoals.update(goal!.id!, next);
    setShowGoal(false);
  }

  const groupedLogs = MEAL_ORDER.map((meal) => ({
    meal,
    items: (logs ?? []).filter((f) => (f.meal ?? 'snack') === meal).sort((a, b) => b.createdAt - a.createdAt),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="pb-4">
      <PageHeader title="Nutrition" subtitle="Calories, protein & water" />

      <div className="flex flex-col gap-3 px-4">
        <div className="flex items-center justify-between">
          <button className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300" onClick={() => setDate(addDays(date, -1))}>
            ‹ Prev
          </button>
          <span className="text-sm font-medium text-white">{date === todayStr() ? 'Today' : formatDate(date)}</span>
          <button
            className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-30"
            disabled={date === todayStr()}
            onClick={() => setDate(addDays(date, 1))}
          >
            Next ›
          </button>
        </div>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-sky-400">Daily totals</p>
            <button onClick={() => setShowGoal((s) => !s)} className="text-xs text-slate-400 underline underline-offset-2">
              edit goals
            </button>
          </div>

          {showGoal ? (
            <GoalForm goal={{ ...goal, waterMl: waterGoal }} onSave={saveGoal} onCancel={() => setShowGoal(false)} />
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              <Metric label="Calories" value={totals.calories} max={goal.calories} unit="kcal" color="#38bdf8" />
              <Metric label="Protein" value={totals.protein} max={goal.protein} unit="g" color="#34d399" />
              {goal.carbs != null && <Metric label="Carbs" value={totals.carbs} max={goal.carbs} unit="g" color="#fbbf24" />}
              {goal.fat != null && <Metric label="Fat" value={totals.fat} max={goal.fat} unit="g" color="#f472b6" />}
            </div>
          )}
        </Card>

        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-cyan-400">💧 Water</p>
          <div className="mt-2">
            <Metric label="Intake" value={waterTotal} max={waterGoal} unit="ml" color="#22d3ee" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {WATER_QUICK_ADD.map((ml) => (
              <button
                key={ml}
                onClick={() => addWater(ml)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 active:bg-white/10"
              >
                + {ml}ml
              </button>
            ))}
            {(waterLogs?.length ?? 0) > 0 && (
              <button onClick={removeLastWater} className="text-xs text-red-400/80 underline underline-offset-2">
                undo last
              </button>
            )}
          </div>
        </Card>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-300">Quick add</p>
            {(presets?.length ?? 0) > 0 && (
              <button onClick={() => setManagePresets((m) => !m)} className="text-xs text-slate-400 underline underline-offset-2">
                {managePresets ? 'done' : 'manage'}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => addPreset(p)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 active:bg-white/10"
              >
                + {p.name}
              </button>
            ))}
            {(presets ?? []).map((p) =>
              managePresets ? (
                <button
                  key={p.id}
                  onClick={() => deletePreset(p.id!)}
                  className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300"
                >
                  {p.name} ✕
                </button>
              ) : (
                <button
                  key={p.id}
                  onClick={() => addPreset(p)}
                  className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200 active:bg-emerald-500/20"
                >
                  + {p.name}
                </button>
              ),
            )}
          </div>
        </div>

        {showAdd ? (
          <Card className="flex flex-col gap-2">
            <Input placeholder="Food name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select value={form.meal} onChange={(e) => setForm({ ...form, meal: e.target.value as Meal })}>
              {MEAL_ORDER.map((m) => (
                <option key={m} value={m}>{MEAL_LABEL[m]}</option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" inputMode="decimal" placeholder="Calories" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
              <Input type="number" inputMode="decimal" placeholder="Protein (g)" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} />
              <Input type="number" inputMode="decimal" placeholder="Carbs (g)" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} />
              <Input type="number" inputMode="decimal" placeholder="Fat (g)" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.saveAsPreset} onChange={(e) => setForm({ ...form, saveAsPreset: e.target.checked })} />
              Save as a reusable quick-add preset
            </label>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={addCustom}>Add</Button>
              <Button variant="secondary" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </Card>
        ) : (
          <Button variant="secondary" onClick={() => setShowAdd(true)}>+ Add Custom Food</Button>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">Log</p>
          {groupedLogs.length === 0 && <EmptyState text="Nothing logged for this day yet." />}
          <div className="flex flex-col gap-3">
            {groupedLogs.map((g) => (
              <div key={g.meal}>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">{MEAL_LABEL[g.meal]}</p>
                <div className="flex flex-col gap-2">
                  {g.items.map((f) => (
                    <Card key={f.id} className="flex items-center justify-between !py-2.5">
                      <div>
                        <p className="text-sm font-medium text-white">{f.name}</p>
                        <p className="text-xs text-slate-400">
                          {f.calories} kcal · {f.protein}g protein
                        </p>
                      </div>
                      <button onClick={() => removeLog(f.id!)} className="text-xs text-red-400/80 underline underline-offset-2">
                        remove
                      </button>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, max, unit, color }: { label: string; value: number; max: number; unit: string; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">
          {Math.round(value)} / {max} {unit}
        </span>
      </div>
      <ProgressBar value={value} max={max} color={color} />
    </div>
  );
}

function GoalForm({
  goal,
  onSave,
  onCancel,
}: {
  goal: { calories: number; protein: number; carbs?: number; fat?: number; waterMl?: number };
  onSave: (v: { calories: number; protein: number; carbs: number; fat: number; waterMl: number }) => void;
  onCancel: () => void;
}) {
  const [calories, setCalories] = useState(String(goal.calories));
  const [protein, setProtein] = useState(String(goal.protein));
  const [carbs, setCarbs] = useState(String(goal.carbs ?? ''));
  const [fat, setFat] = useState(String(goal.fat ?? ''));
  const [waterMl, setWaterMl] = useState(String(goal.waterMl ?? 2500));

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Input type="number" placeholder="Calories" value={calories} onChange={(e) => setCalories(e.target.value)} />
        <Input type="number" placeholder="Protein (g)" value={protein} onChange={(e) => setProtein(e.target.value)} />
        <Input type="number" placeholder="Carbs (g)" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
        <Input type="number" placeholder="Fat (g)" value={fat} onChange={(e) => setFat(e.target.value)} />
      </div>
      <label className="text-sm text-slate-300">Water goal (ml)</label>
      <Input type="number" placeholder="Water (ml)" value={waterMl} onChange={(e) => setWaterMl(e.target.value)} />
      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={() =>
            onSave({
              calories: Number(calories) || 0,
              protein: Number(protein) || 0,
              carbs: Number(carbs) || 0,
              fat: Number(fat) || 0,
              waterMl: Number(waterMl) || 2500,
            })
          }
        >
          Save
        </Button>
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
