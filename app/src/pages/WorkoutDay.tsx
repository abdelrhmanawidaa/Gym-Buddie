import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import db, { type Exercise } from '../db';
import { todayStr } from '../lib/date';
import { useT, localized } from '../lib/i18n';
import { MUSCLES, type MuscleKey } from '../lib/muscles';
import { Card, PageHeader, Button, Input, Select, EmptyState } from '../components/ui';

export default function WorkoutDay() {
  const { dayId } = useParams();
  const id = Number(dayId);
  const navigate = useNavigate();
  const { t, lang } = useT();

  const day = useLiveQuery(() => db.planDays.get(id), [id]);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const openSession = useLiveQuery(
    () => db.workoutSessions.where('date').equals(todayStr()).filter((s) => !s.completed && s.planDayId === id).first(),
    [id],
  );
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [pickId, setPickId] = useState<number | ''>('');
  const [newEx, setNewEx] = useState({ name: '', muscle: 'chest' as MuscleKey, machine: '', sets: 3, repsLow: 8, repsHigh: 12 });

  if (!day || !exercises) return null;

  const exById = new Map(exercises.map((e) => [e.id!, e]));
  const notInDay = exercises.filter((e) => !day.exercises.some((de) => de.exerciseId === e.id));
  const dayLabel = (lang === 'ar' && day.nameAr) || day.name;

  async function startWorkout() {
    if (openSession) {
      navigate(`/workout/session/${openSession.id}`);
      return;
    }
    const sessionId = await db.workoutSessions.add({
      date: todayStr(),
      startedAt: Date.now(),
      planDayId: day!.id!,
      planDayName: day!.name,
      planDayNameAr: day!.nameAr,
      completed: false,
    });
    navigate(`/workout/session/${sessionId}`);
  }

  async function addExisting() {
    if (!pickId) return;
    const ex = exById.get(pickId as number)!;
    const updated = [...day!.exercises, { exerciseId: ex.id!, sets: ex.targetSets, repsLow: ex.targetRepsLow, repsHigh: ex.targetRepsHigh }];
    await db.planDays.update(day!.id!, { exercises: updated });
    setPickId('');
    setShowAddExercise(false);
  }

  async function addNewExercise() {
    if (!newEx.name.trim() || !newEx.machine.trim()) return;
    const exData: Exercise = {
      name: newEx.name.trim(),
      muscleGroup: newEx.muscle,
      muscle: newEx.muscle,
      machine: newEx.machine.trim(),
      targetSets: newEx.sets,
      targetRepsLow: newEx.repsLow,
      targetRepsHigh: newEx.repsHigh,
    };
    const exId = await db.exercises.add(exData);
    const updated = [...day!.exercises, { exerciseId: exId as number, sets: exData.targetSets, repsLow: exData.targetRepsLow, repsHigh: exData.targetRepsHigh }];
    await db.planDays.update(day!.id!, { exercises: updated });
    setNewEx({ name: '', muscle: 'chest', machine: '', sets: 3, repsLow: 8, repsHigh: 12 });
    setShowNewExercise(false);
  }

  async function removeExercise(exerciseId: number) {
    const updated = day!.exercises.filter((e) => e.exerciseId !== exerciseId);
    await db.planDays.update(day!.id!, { exercises: updated });
  }

  return (
    <div className="pb-4">
      <PageHeader title={dayLabel} subtitle={t('workout.dayExercises')} />
      <div className="flex flex-col gap-3 px-4">
        {day.exercises.length === 0 && <EmptyState text={t('workout.noExercises')} />}

        {day.exercises.map((de) => {
          const ex = exById.get(de.exerciseId);
          if (!ex) return null;
          const muscleDef = MUSCLES.find((m) => m.key === ex.muscle);
          return (
            <Card key={de.exerciseId}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-white">{localized(ex, 'name', lang)}</h3>
                  <p className="truncate text-sm text-slate-400">{localized(ex, 'machine', lang)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {muscleDef ? (lang === 'ar' ? muscleDef.ar : muscleDef.en) : ex.muscleGroup} · {de.sets} × {de.repsLow}-{de.repsHigh}{' '}
                    {t('common.reps')}
                  </p>
                </div>
                <button
                  onClick={() => removeExercise(de.exerciseId)}
                  className="shrink-0 text-xs text-red-400/80 underline underline-offset-2"
                >
                  {t('common.remove')}
                </button>
              </div>
            </Card>
          );
        })}

        <Button onClick={startWorkout} disabled={day.exercises.length === 0}>
          {openSession ? t('workout.resumeWorkout') : t('workout.startWorkout')}
        </Button>

        <div className="mt-2 flex flex-col gap-2">
          {showAddExercise ? (
            <Card className="flex flex-col gap-2">
              <Select value={pickId} onChange={(e) => setPickId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">{t('workout.chooseExercise')}</option>
                {notInDay.map((e) => (
                  <option key={e.id} value={e.id}>
                    {localized(e, 'name', lang)} — {localized(e, 'machine', lang)}
                  </option>
                ))}
              </Select>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={addExisting}>{t('common.add')}</Button>
                <Button variant="secondary" className="flex-1" onClick={() => setShowAddExercise(false)}>{t('common.cancel')}</Button>
              </div>
            </Card>
          ) : (
            <Button variant="secondary" onClick={() => setShowAddExercise(true)}>{t('workout.addExisting')}</Button>
          )}

          {showNewExercise ? (
            <Card className="flex flex-col gap-2">
              <Input placeholder={t('workout.exerciseName')} value={newEx.name} onChange={(e) => setNewEx({ ...newEx, name: e.target.value })} />
              <Select value={newEx.muscle} onChange={(e) => setNewEx({ ...newEx, muscle: e.target.value as MuscleKey })}>
                {MUSCLES.map((m) => (
                  <option key={m.key} value={m.key}>
                    {lang === 'ar' ? m.ar : m.en}
                  </option>
                ))}
              </Select>
              <Input placeholder={t('workout.machine')} value={newEx.machine} onChange={(e) => setNewEx({ ...newEx, machine: e.target.value })} />
              <div className="flex gap-2">
                <Input type="number" placeholder={t('workout.setsLabel')} value={newEx.sets} onChange={(e) => setNewEx({ ...newEx, sets: Number(e.target.value) })} />
                <Input type="number" placeholder={t('workout.repsLow')} value={newEx.repsLow} onChange={(e) => setNewEx({ ...newEx, repsLow: Number(e.target.value) })} />
                <Input type="number" placeholder={t('workout.repsHigh')} value={newEx.repsHigh} onChange={(e) => setNewEx({ ...newEx, repsHigh: Number(e.target.value) })} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={addNewExercise}>{t('workout.createAndAdd')}</Button>
                <Button variant="secondary" className="flex-1" onClick={() => setShowNewExercise(false)}>{t('common.cancel')}</Button>
              </div>
            </Card>
          ) : (
            <Button variant="secondary" onClick={() => setShowNewExercise(true)}>{t('workout.createNew')}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
