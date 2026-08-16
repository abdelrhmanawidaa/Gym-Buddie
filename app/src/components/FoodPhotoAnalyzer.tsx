import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import db, { type Meal } from '../db';
import { useT } from '../lib/i18n';
import { useSettings } from '../lib/useSettings';
import { resizeImageFile } from '../lib/image';
import { analyzeFoodPhoto, splitDataUrl, type FoodAnalysis } from '../lib/foodAI';
import { Card, Button } from './ui';

export default function FoodPhotoAnalyzer({
  date,
  meal,
  remainingCalories,
  remainingProtein,
  goalCalories,
  goalProtein,
}: {
  date: string;
  meal: Meal;
  remainingCalories: number;
  remainingProtein: number;
  goalCalories: number;
  goalProtein: number;
}) {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const settings = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FoodAnalysis | null>(null);

  const hasKey = !!settings.aiApiKey?.trim();

  async function onPick(file: File) {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const dataUrl = await resizeImageFile(file, 900, 0.8);
      setPreview(dataUrl);
      const { base64, mediaType } = splitDataUrl(dataUrl);
      const analysis = await analyzeFoodPhoto({
        apiKey: settings.aiApiKey!.trim(),
        imageBase64: base64,
        mediaType,
        lang,
        remainingCalories: Math.round(remainingCalories),
        remainingProtein: Math.round(remainingProtein),
        goalCalories,
        goalProtein,
      });
      setResult(analysis);
    } catch {
      setError(t('ai.error'));
    } finally {
      setBusy(false);
    }
  }

  async function logIt() {
    if (!result) return;
    await db.foodLogs.add({
      date,
      name: result.name,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      meal,
      createdAt: Date.now(),
    });
    reset();
  }

  function reset() {
    setResult(null);
    setPreview(null);
    setError(null);
  }

  if (!hasKey) {
    return (
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-fuchsia-400">{t('ai.title')}</p>
        <p className="mt-1.5 text-sm text-slate-400">{t('ai.noKey')}</p>
        <Button variant="secondary" className="mt-3 w-full" onClick={() => navigate('/settings')}>
          {t('ai.goToSettings')}
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-fuchsia-400">{t('ai.title')}</p>
      <p className="mt-0.5 text-xs text-slate-500">{t('ai.subtitle')}</p>

      {preview && (
        <img src={preview} alt="" className="mt-3 max-h-48 w-full rounded-xl object-cover" />
      )}

      {busy && <p className="mt-3 animate-pulse text-sm text-slate-300">{t('ai.analyzing')}</p>}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {result && !busy && (
        <div className="mt-3 flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{result.name}</p>
            {result.items.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-xs text-slate-400">
                {result.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <Macro label={t('nutrition.calories')} value={result.calories} unit="kcal" />
            <Macro label={t('nutrition.protein')} value={result.protein} unit="g" />
            <Macro label={t('nutrition.carbs')} value={result.carbs} unit="g" />
            <Macro label={t('nutrition.fat')} value={result.fat} unit="g" />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{t('ai.verdict')}</p>
            <p className="mt-1 text-sm text-slate-200">{result.verdict}</p>
          </div>

          <p className="text-xs text-slate-500">{t('ai.disclaimer')}</p>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={logIt}>{t('ai.logIt')}</Button>
            <Button variant="secondary" className="flex-1" onClick={() => fileInputRef.current?.click()}>
              {t('ai.retake')}
            </Button>
          </div>
        </div>
      )}

      {!result && !busy && (
        <Button variant="secondary" className="mt-3 w-full" onClick={() => fileInputRef.current?.click()}>
          {t('ai.takePhoto')}
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = '';
        }}
      />
    </Card>
  );
}

function Macro({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-lg bg-white/5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-500">{unit}</p>
    </div>
  );
}
