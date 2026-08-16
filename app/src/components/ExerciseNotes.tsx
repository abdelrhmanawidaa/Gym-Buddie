import { useState } from 'react';
import db from '../db';
import { useT } from '../lib/i18n';
import { Button } from './ui';

export default function ExerciseNotes({ exerciseId, notes }: { exerciseId: number; notes?: string }) {
  const { t } = useT();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes ?? '');

  async function save() {
    await db.exercises.update(exerciseId, { notes: draft.trim() || undefined });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="mt-2 flex flex-col gap-1.5">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('session.notePlaceholder')}
          rows={2}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-400/60"
        />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={save}>{t('session.saveNote')}</Button>
          <Button variant="secondary" className="flex-1" onClick={() => { setDraft(notes ?? ''); setEditing(false); }}>{t('common.cancel')}</Button>
        </div>
      </div>
    );
  }

  return notes ? (
    <button onClick={() => setEditing(true)} className="mt-1.5 block text-start text-xs text-slate-400 italic">
      📝 {notes}
    </button>
  ) : (
    <button onClick={() => setEditing(true)} className="mt-1.5 text-xs text-slate-500 underline underline-offset-2">
      {t('session.addNote')}
    </button>
  );
}
