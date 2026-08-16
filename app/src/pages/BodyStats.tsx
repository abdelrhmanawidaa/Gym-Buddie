import { useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import db, { type BodyPhoto } from '../db';
import { todayStr } from '../lib/date';
import { useT } from '../lib/i18n';
import { useSettings } from '../lib/useSettings';
import { displayWeight, toKg } from '../lib/units';
import { bmi, bmiCategory, navyBodyFat } from '../lib/bodyComposition';
import { resizeImageFile } from '../lib/image';
import { Card, PageHeader, Button, Input, EmptyState } from '../components/ui';

const ANGLES: BodyPhoto['angle'][] = ['front', 'side', 'back'];
const ANGLE_KEY: Record<BodyPhoto['angle'], 'body.front' | 'body.side' | 'body.back'> = {
  front: 'body.front',
  side: 'body.side',
  back: 'body.back',
};

const BMI_CATEGORY_KEY: Record<string, 'body.underweight' | 'body.normal' | 'body.overweight' | 'body.obese'> = {
  Underweight: 'body.underweight',
  Normal: 'body.normal',
  Overweight: 'body.overweight',
  Obese: 'body.obese',
};

export default function BodyStats() {
  const { t } = useT();
  const settings = useSettings();
  const stats = useLiveQuery(() => db.bodyStats.orderBy('date').toArray(), []);
  const photos = useLiveQuery(() => db.bodyPhotos.orderBy('date').reverse().toArray(), []);
  const today = todayStr();
  const todaysEntry = stats?.find((s) => s.date === today);

  const [form, setForm] = useState({ weight: '', neck: '', chest: '', waist: '', hips: '', arms: '', thighs: '', notes: '' });
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState<BodyPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAngle, setPendingAngle] = useState<BodyPhoto['angle']>('front');

  const chartData = useMemo(
    () => (stats ?? []).filter((s) => s.weight != null).map((s) => ({ date: s.date, weight: displayWeight(s.weight!, settings.units) })),
    [stats, settings.units],
  );

  const latestWithBody = [...(stats ?? [])].reverse().find((s) => s.weight != null || s.waist != null);
  const composition = useMemo(() => {
    if (!latestWithBody) return null;
    const bmiVal = settings.heightCm && latestWithBody.weight ? bmi(latestWithBody.weight, settings.heightCm) : null;
    const bfVal =
      settings.heightCm && settings.sex && latestWithBody.neck && latestWithBody.waist
        ? navyBodyFat({
            sex: settings.sex,
            heightCm: settings.heightCm,
            neckCm: latestWithBody.neck,
            waistCm: latestWithBody.waist,
            hipCm: latestWithBody.hips,
          })
        : null;
    return { bmiVal, bfVal };
  }, [latestWithBody, settings.heightCm, settings.sex]);

  async function save() {
    const payload = {
      date: today,
      weight: numToKg(form.weight, settings.units),
      neck: numOrUndef(form.neck),
      chest: numOrUndef(form.chest),
      waist: numOrUndef(form.waist),
      hips: numOrUndef(form.hips),
      arms: numOrUndef(form.arms),
      thighs: numOrUndef(form.thighs),
      notes: form.notes.trim() || undefined,
    };
    if (todaysEntry) {
      await db.bodyStats.update(todaysEntry.id!, payload);
    } else {
      await db.bodyStats.add(payload);
    }
    setShowForm(false);
    setForm({ weight: '', neck: '', chest: '', waist: '', hips: '', arms: '', thighs: '', notes: '' });
  }

  async function removeEntry(id: number) {
    await db.bodyStats.delete(id);
  }

  async function addPhoto(file: File) {
    const dataUrl = await resizeImageFile(file);
    await db.bodyPhotos.add({ date: today, angle: pendingAngle, dataUrl, createdAt: Date.now() });
  }

  async function removePhoto(id: number) {
    await db.bodyPhotos.delete(id);
    setLightbox(null);
  }

  if (!stats || !photos) return null;

  const photosByDate = new Map<string, BodyPhoto[]>();
  for (const p of photos) {
    photosByDate.set(p.date, [...(photosByDate.get(p.date) ?? []), p]);
  }

  return (
    <div className="pb-4">
      <PageHeader title={t('body.title')} subtitle={t('body.subtitle')} />
      <div className="flex flex-col gap-3 px-4">
        {chartData.length > 1 && (
          <Card>
            <p className="mb-2 text-sm font-medium text-slate-300">{t('body.weightChart', { unit: settings.units })}</p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ background: '#151b23', border: '1px solid #ffffff20', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#e7ebf0' }} />
                  <Line type="monotone" dataKey="weight" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {composition && (composition.bmiVal != null || composition.bfVal != null) && (
          <Card className="flex gap-4">
            {composition.bmiVal != null && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('body.bmi')}</p>
                <p className="mt-1 text-xl font-bold text-white">{composition.bmiVal}</p>
                <p className="text-xs text-slate-500">{t(BMI_CATEGORY_KEY[bmiCategory(composition.bmiVal)])}</p>
              </div>
            )}
            {composition.bfVal != null && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('body.bodyFat')}</p>
                <p className="mt-1 text-xl font-bold text-white">{composition.bfVal}%</p>
                <p className="text-xs text-slate-500">{t('body.navyMethod')}</p>
              </div>
            )}
          </Card>
        )}
        {!settings.heightCm && (
          <p className="px-1 text-xs text-slate-500">
            {t('body.needsHeight')}
          </p>
        )}

        {showForm || todaysEntry ? (
          !showForm && todaysEntry ? (
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-400">{t('body.todaysEntry')}</p>
                <button onClick={() => { setForm(toFormState(todaysEntry, settings.units)); setShowForm(true); }} className="text-xs text-slate-400 underline underline-offset-2">
                  {t('common.edit')}
                </button>
              </div>
              <p className="mt-1 text-lg font-semibold text-white">
                {todaysEntry.weight != null ? `${displayWeight(todaysEntry.weight, settings.units)} ${settings.units}` : '—'}
              </p>
            </Card>
          ) : (
            <Card className="flex flex-col gap-2">
              <p className="text-sm font-medium text-slate-300">{t('body.logToday', { date: today })}</p>
              <Input type="number" inputMode="decimal" placeholder={t('body.weight', { unit: settings.units })} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" inputMode="decimal" placeholder={t('body.neck')} value={form.neck} onChange={(e) => setForm({ ...form, neck: e.target.value })} />
                <Input type="number" inputMode="decimal" placeholder={t('body.chest')} value={form.chest} onChange={(e) => setForm({ ...form, chest: e.target.value })} />
                <Input type="number" inputMode="decimal" placeholder={t('body.waist')} value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} />
                <Input type="number" inputMode="decimal" placeholder={t('body.hips')} value={form.hips} onChange={(e) => setForm({ ...form, hips: e.target.value })} />
                <Input type="number" inputMode="decimal" placeholder={t('body.arms')} value={form.arms} onChange={(e) => setForm({ ...form, arms: e.target.value })} />
                <Input type="number" inputMode="decimal" placeholder={t('body.thighs')} value={form.thighs} onChange={(e) => setForm({ ...form, thighs: e.target.value })} />
              </div>
              <Input placeholder={t('body.notes')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={save}>{t('common.save')}</Button>
                <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>{t('common.cancel')}</Button>
              </div>
            </Card>
          )
        ) : (
          <Button onClick={() => setShowForm(true)}>{t('body.logTodayBtn')}</Button>
        )}

        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">{t('body.photos')}</p>
          <div className="mb-2 flex gap-2">
            {ANGLES.map((a) => (
              <button
                key={a}
                onClick={() => { setPendingAngle(a); fileInputRef.current?.click(); }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-slate-200"
              >
                📷 {t(ANGLE_KEY[a])}
              </button>
            ))}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) addPhoto(f); e.target.value = ''; }}
          />
          {photos.length === 0 ? (
            <EmptyState text={t('body.noPhotos')} />
          ) : (
            <div className="flex flex-col gap-3">
              {[...photosByDate.entries()].map(([date, pics]) => (
                <div key={date}>
                  <p className="mb-1.5 text-xs text-slate-500">{date}</p>
                  <div className="flex gap-2">
                    {pics.map((p) => (
                      <button key={p.id} onClick={() => setLightbox(p)} className="overflow-hidden rounded-lg border border-white/10">
                        <img src={p.dataUrl} alt={p.angle} className="h-24 w-20 object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-300">{t('body.history')}</p>
          {stats.length === 0 && <EmptyState text={t('dashboard.noEntries')} />}
          <div className="flex flex-col gap-2">
            {stats
              .slice()
              .reverse()
              .map((s) => (
                <Card key={s.id} className="flex items-center justify-between !py-2.5">
                  <div>
                    <p className="text-sm font-medium text-white">{s.date}</p>
                    <p className="text-xs text-slate-400">
                      {s.weight != null ? `${displayWeight(s.weight, settings.units)}${settings.units}` : ''}
                      {s.chest != null ? ` · Chest ${s.chest}cm` : ''}
                      {s.waist != null ? ` · Waist ${s.waist}cm` : ''}
                    </p>
                  </div>
                  <button onClick={() => removeEntry(s.id!)} className="text-xs text-red-400/80 underline underline-offset-2">
                    {t('common.remove')}
                  </button>
                </Card>
              ))}
          </div>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox.dataUrl} alt={lightbox.angle} className="max-h-[70vh] max-w-full rounded-xl object-contain" />
          <p className="mt-3 text-sm text-slate-300">{lightbox.date} · {t(ANGLE_KEY[lightbox.angle])}</p>
          <button
            onClick={(e) => { e.stopPropagation(); removePhoto(lightbox.id!); }}
            className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-300"
          >
            {t('body.deletePhoto')}
          </button>
        </div>
      )}
    </div>
  );
}

function numOrUndef(v: string): number | undefined {
  return v.trim() === '' ? undefined : Number(v);
}

function numToKg(v: string, units: 'kg' | 'lb'): number | undefined {
  return v.trim() === '' ? undefined : toKg(Number(v), units);
}

function toFormState(
  entry: { weight?: number; neck?: number; chest?: number; waist?: number; hips?: number; arms?: number; thighs?: number; notes?: string },
  units: 'kg' | 'lb',
) {
  return {
    weight: entry.weight != null ? String(displayWeight(entry.weight, units)) : '',
    neck: entry.neck?.toString() ?? '',
    chest: entry.chest?.toString() ?? '',
    waist: entry.waist?.toString() ?? '',
    hips: entry.hips?.toString() ?? '',
    arms: entry.arms?.toString() ?? '',
    thighs: entry.thighs?.toString() ?? '',
    notes: entry.notes ?? '',
  };
}
