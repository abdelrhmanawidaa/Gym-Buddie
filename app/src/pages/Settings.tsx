import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../db';
import { useT, type Lang } from '../lib/i18n';
import { useSettings } from '../lib/useSettings';
import { displayWeight, toKg } from '../lib/units';
import { Card, PageHeader, Button, Input, Select } from '../components/ui';

const TABLES = [
  'exercises',
  'planDays',
  'workoutSessions',
  'setLogs',
  'bodyStats',
  'bodyPhotos',
  'foodLogs',
  'foodPresets',
  'waterLogs',
  'nutritionGoals',
  'settings',
  'musclePrefs',
] as const;

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useT();
  const settings = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState('');
  const [plateInput, setPlateInput] = useState('');

  async function update(patch: Partial<typeof settings>) {
    const existing = await db.settings.toCollection().first();
    if (existing?.id) {
      await db.settings.update(existing.id, patch);
    } else {
      await db.settings.add({ ...settings, ...patch });
    }
  }

  async function exportData() {
    const dump: Record<string, unknown[]> = {};
    for (const t of TABLES) {
      dump[t] = await (db as any).table(t).toArray();
    }
    const blob = new Blob([JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), data: dump }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-buddie-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function importData(file: File) {
    setImportMsg('');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = parsed.data ?? parsed;
      if (!confirm(t('settings.importConfirm'))) return;

      await db.transaction('rw', TABLES.map((t) => (db as any).table(t)), async () => {
        for (const t of TABLES) {
          if (Array.isArray(data[t])) {
            await (db as any).table(t).clear();
            await (db as any).table(t).bulkAdd(data[t]);
          }
        }
      });
      setImportMsg(t('settings.importOk'));
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setImportMsg(t('settings.importFail'));
    }
  }

  function addPlate() {
    const val = Number(plateInput);
    if (!val || val <= 0) return;
    const kgVal = toKg(val, settings.units);
    const next = [...settings.availablePlatesKg, kgVal].sort((a, b) => b - a);
    update({ availablePlatesKg: next });
    setPlateInput('');
  }

  function removePlate(val: number) {
    update({ availablePlatesKg: settings.availablePlatesKg.filter((p) => p !== val) });
  }

  return (
    <div className="pb-4">
      <PageHeader
        title={t('settings.title')}
        action={
          <button onClick={() => navigate(-1)} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-300">
            {t('common.close')}
          </button>
        }
      />
      <div className="flex flex-col gap-3 px-4">
        <Card className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{t('settings.language')}</p>
          <Select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </Select>
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{t('settings.units')}</p>
          <Select value={settings.units} onChange={(e) => update({ units: e.target.value as 'kg' | 'lb' })}>
            <option value="kg">{t('settings.kg')}</option>
            <option value="lb">{t('settings.lb')}</option>
          </Select>
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{t('settings.restTimer')}</p>
          <label className="text-sm text-slate-300">{t('settings.restDefault')}</label>
          <Input
            type="number"
            value={settings.restTimerDefaultSec}
            onChange={(e) => update({ restTimerDefaultSec: Number(e.target.value) || 0 })}
          />
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{t('settings.plateCalc')}</p>
          <label className="text-sm text-slate-300">{t('settings.barWeight', { unit: settings.units })}</label>
          <Input
            type="number"
            value={displayWeight(settings.barWeightKg, settings.units)}
            onChange={(e) => update({ barWeightKg: toKg(Number(e.target.value) || 0, settings.units) })}
          />
          <label className="text-sm text-slate-300">{t('settings.availablePlates', { unit: settings.units })}</label>
          <div className="flex flex-wrap gap-2">
            {settings.availablePlatesKg.map((p) => (
              <button
                key={p}
                onClick={() => removePlate(p)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
              >
                {displayWeight(p, settings.units)} ×
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input type="number" placeholder={t('settings.addPlate')} value={plateInput} onChange={(e) => setPlateInput(e.target.value)} />
            <Button variant="secondary" onClick={addPlate}>{t('common.add')}</Button>
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{t('settings.bodyComp')}</p>
          <p className="text-xs text-slate-500">{t('settings.bodyCompHint')}</p>
          <label className="text-sm text-slate-300">{t('settings.height')}</label>
          <Input
            type="number"
            value={settings.heightCm ?? ''}
            onChange={(e) => update({ heightCm: e.target.value ? Number(e.target.value) : undefined })}
          />
          <label className="text-sm text-slate-300">{t('settings.age')}</label>
          <Input
            type="number"
            value={settings.age ?? ''}
            onChange={(e) => update({ age: e.target.value ? Number(e.target.value) : undefined })}
          />
          <label className="text-sm text-slate-300">{t('settings.sex')}</label>
          <Select value={settings.sex ?? ''} onChange={(e) => update({ sex: (e.target.value || undefined) as 'male' | 'female' | undefined })}>
            <option value="">{t('settings.notSet')}</option>
            <option value="male">{t('settings.male')}</option>
            <option value="female">{t('settings.female')}</option>
          </Select>
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-fuchsia-400">{t('settings.ai')}</p>
          <p className="text-xs text-slate-500">{t('settings.aiHint')}</p>
          <Input
            type="password"
            autoComplete="off"
            placeholder={t('settings.apiKey')}
            value={settings.aiApiKey ?? ''}
            onChange={(e) => update({ aiApiKey: e.target.value.trim() || undefined })}
          />
          {settings.aiApiKey?.trim() && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-400">{t('settings.aiEnabled')}</span>
              <button
                onClick={() => update({ aiApiKey: undefined })}
                className="text-xs text-red-400/80 underline underline-offset-2"
              >
                {t('settings.clearKey')}
              </button>
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-400">{t('settings.backup')}</p>
          <p className="text-xs text-slate-500">{t('settings.backupHint')}</p>
          <Button onClick={exportData}>{t('settings.export')}</Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>{t('settings.import')}</Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
          />
          {importMsg && <p className="text-xs text-amber-400">{importMsg}</p>}
        </Card>
      </div>
    </div>
  );
}
