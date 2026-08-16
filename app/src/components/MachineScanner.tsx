import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../db';
import { useT } from '../lib/i18n';
import { useSettings } from '../lib/useSettings';
import { resizeImageFile } from '../lib/image';
import { splitDataUrl } from '../lib/foodAI';
import { analyzeMachinePhoto, type MachineAnalysis } from '../lib/machineAI';
import { MUSCLE_BY_KEY } from '../lib/muscles';
import BodyMap from './BodyMap';
import { pickBodyView } from '../lib/bodyMapTypes';
import { Card, Button } from './ui';

export default function MachineScanner() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const settings = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MachineAnalysis | null>(null);
  const [saved, setSaved] = useState(false);

  const hasKey = !!settings.aiApiKey?.trim();

  async function onPick(file: File) {
    setError(null);
    setResult(null);
    setSaved(false);
    setBusy(true);
    try {
      const dataUrl = await resizeImageFile(file, 900, 0.8);
      setPreview(dataUrl);
      const { base64, mediaType } = splitDataUrl(dataUrl);
      const analysis = await analyzeMachinePhoto({
        apiKey: settings.aiApiKey!.trim(),
        imageBase64: base64,
        mediaType,
        lang,
      });
      setResult(analysis);
    } catch {
      setError(t('scanner.error'));
    } finally {
      setBusy(false);
    }
  }

  async function saveExercise() {
    if (!result || result.primaryMuscles.length === 0) return;
    const primary = result.primaryMuscles[0];
    await db.exercises.add({
      name: result.name,
      nameAr: result.name,
      muscle: primary,
      muscleGroup: MUSCLE_BY_KEY.get(primary)!.en,
      machine: result.name,
      machineAr: result.name,
      targetSets: 3,
      targetRepsLow: 8,
      targetRepsHigh: 12,
      notes: result.formCues.join(' · '),
    });
    setSaved(true);
  }

  function reset() {
    setResult(null);
    setPreview(null);
    setError(null);
    setSaved(false);
  }

  if (!hasKey) {
    return (
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-fuchsia-400">{t('scanner.title')}</p>
        <p className="mt-1.5 text-sm text-slate-400">{t('scanner.noKey')}</p>
        <Button variant="secondary" className="mt-3 w-full" onClick={() => navigate('/settings')}>
          {t('ai.goToSettings')}
        </Button>
      </Card>
    );
  }

  const allMuscles = result ? [...result.primaryMuscles, ...result.secondaryMuscles] : [];

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-fuchsia-400">{t('scanner.title')}</p>
      <p className="mt-0.5 text-xs text-slate-500">{t('scanner.subtitle')}</p>

      {preview && <img src={preview} alt="" className="mt-3 max-h-48 w-full rounded-xl object-cover" />}

      {busy && <p className="mt-3 animate-pulse text-sm text-slate-300">{t('scanner.analyzing')}</p>}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {result && !busy && (
        <div className="mt-3 flex flex-col gap-3">
          <p className="text-sm font-semibold text-white">{result.name}</p>

          {allMuscles.length > 0 && (
            <div className="flex justify-center">
              <BodyMap
                view={pickBodyView(result.primaryMuscles.length > 0 ? result.primaryMuscles : allMuscles)}
                highlight={result.primaryMuscles}
                highlightSecondary={result.secondaryMuscles}
                className="h-[200px] w-auto"
              />
            </div>
          )}

          {result.primaryMuscles.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{t('anatomy.mainMuscle')}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {result.primaryMuscles.map((m) => (
                  <button
                    key={m}
                    onClick={() => navigate(`/muscles/${m}`)}
                    className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300"
                  >
                    {lang === 'ar' ? MUSCLE_BY_KEY.get(m)!.ar : MUSCLE_BY_KEY.get(m)!.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {result.secondaryMuscles.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-amber-400">{t('anatomy.assisting')}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {result.secondaryMuscles.map((m) => (
                  <button
                    key={m}
                    onClick={() => navigate(`/muscles/${m}`)}
                    className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300"
                  >
                    {lang === 'ar' ? MUSCLE_BY_KEY.get(m)!.ar : MUSCLE_BY_KEY.get(m)!.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {result.steps.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('scanner.howTo')}</p>
              <ol className="mt-1.5 list-inside list-decimal space-y-1 text-sm text-slate-300">
                {result.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}

          {result.formCues.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('scanner.formTips')}</p>
              <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-slate-300">
                {result.formCues.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {result.mistakes.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-red-400">{t('scanner.mistakes')}</p>
              <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-slate-300">
                {result.mistakes.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <Button className="flex-1" onClick={saveExercise} disabled={saved || result.primaryMuscles.length === 0}>
              {saved ? t('scanner.saved') : t('scanner.saveExercise')}
            </Button>
            <Button variant="secondary" className="flex-1" onClick={reset}>
              {t('scanner.another')}
            </Button>
          </div>
        </div>
      )}

      {!result && !busy && (
        <Button variant="secondary" className="mt-3 w-full" onClick={() => fileInputRef.current?.click()}>
          {t('scanner.takePhoto')}
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
