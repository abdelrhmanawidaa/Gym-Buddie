import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import db, { type ActivityLevel, type NutritionGoalType } from '../db';
import { useT } from '../lib/i18n';
import { useSettings } from '../lib/useSettings';
import { calculateTargets, type TargetResult } from '../lib/nutritionTargets';
import { Card, Button, Select } from './ui';
import type { TranslationKey } from '../lib/translations';

const ACTIVITY_KEYS: { value: ActivityLevel; label: TranslationKey }[] = [
  { value: 'sedentary', label: 'tdee.sedentary' },
  { value: 'light', label: 'tdee.light' },
  { value: 'moderate', label: 'tdee.moderate' },
  { value: 'active', label: 'tdee.active' },
  { value: 'veryActive', label: 'tdee.veryActive' },
];

const GOAL_KEYS: { value: NutritionGoalType; label: TranslationKey }[] = [
  { value: 'cut', label: 'tdee.cut' },
  { value: 'maintain', label: 'tdee.maintain' },
  { value: 'bulk', label: 'tdee.bulk' },
];

export default function TdeeCalculator() {
  const { t } = useT();
  const navigate = useNavigate();
  const settings = useSettings();
  const latestWeight = useLiveQuery(
    () => db.bodyStats.orderBy('date').reverse().filter((s) => s.weight != null).first(),
    [],
  );

  const [open, setOpen] = useState(false);
  const [activity, setActivity] = useState<ActivityLevel>(settings.activityLevel ?? 'moderate');
  const [goal, setGoal] = useState<NutritionGoalType>(settings.goalType ?? 'maintain');
  const [result, setResult] = useState<TargetResult | null>(null);
  const [applied, setApplied] = useState(false);

  const weightKg = latestWeight?.weight;
  const ready = !!weightKg && !!settings.heightCm && !!settings.age && !!settings.sex;

  function calculate() {
    if (!ready) return;
    setApplied(false);
    setResult(
      calculateTargets({
        weightKg: weightKg!,
        heightCm: settings.heightCm!,
        age: settings.age!,
        sex: settings.sex!,
        activityLevel: activity,
        goalType: goal,
      }),
    );
  }

  async function apply() {
    if (!result) return;
    const existingGoal = await db.nutritionGoals.toCollection().first();
    if (existingGoal?.id) {
      await db.nutritionGoals.update(existingGoal.id, {
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        waterMl: result.waterMl,
      });
    }
    const existingSettings = await db.settings.toCollection().first();
    if (existingSettings?.id) {
      await db.settings.update(existingSettings.id, { activityLevel: activity, goalType: goal });
    }
    setApplied(true);
  }

  return (
    <Card>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-amber-400">{t('tdee.title')}</p>
          <p className="mt-0.5 text-xs text-slate-500">{t('tdee.subtitle')}</p>
        </div>
        <span className="text-slate-500">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-2">
          {!ready ? (
            <>
              <p className="text-sm text-slate-400">{t('tdee.needsProfile')}</p>
              <Button variant="secondary" onClick={() => navigate('/settings')}>
                {t('ai.goToSettings')}
              </Button>
            </>
          ) : (
            <>
              <label className="text-sm text-slate-300">{t('tdee.activity')}</label>
              <Select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
                {ACTIVITY_KEYS.map((a) => (
                  <option key={a.value} value={a.value}>{t(a.label)}</option>
                ))}
              </Select>

              <label className="text-sm text-slate-300">{t('tdee.goal')}</label>
              <Select value={goal} onChange={(e) => setGoal(e.target.value as NutritionGoalType)}>
                {GOAL_KEYS.map((g) => (
                  <option key={g.value} value={g.value}>{t(g.label)}</option>
                ))}
              </Select>

              <Button onClick={calculate}>{t('tdee.calculate')}</Button>

              {result && (
                <div className="mt-1 flex flex-col gap-2">
                  <div className="flex gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">{t('tdee.yourBmr')}</p>
                      <p className="font-semibold text-white">{result.bmr} kcal</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t('tdee.yourTdee')}</p>
                      <p className="font-semibold text-white">{result.tdee} kcal</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">
                      {t('tdee.recommended')}
                    </p>
                    <p className="mt-1 text-lg font-bold text-white">{result.calories} kcal</p>
                    <p className="text-sm text-slate-300">
                      {result.protein}g {t('nutrition.protein')} · {result.carbs}g {t('nutrition.carbs')} ·{' '}
                      {result.fat}g {t('nutrition.fat')}
                    </p>
                  </div>

                  {applied ? (
                    <p className="text-sm font-medium text-emerald-400">{t('tdee.applied')}</p>
                  ) : (
                    <Button onClick={apply}>{t('tdee.apply')}</Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
