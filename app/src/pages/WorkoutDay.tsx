import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import db, { type Exercise } from '../db';
import { todayStr } from '../lib/date';
import { Card, PageHeader, Button, Input, Select, EmptyState } from '../components/ui';

export default function WorkoutDay() {
  const { dayId } = useParams();
  const id = Number(dayId);
  const navigate = useNavigate();

  const day = useLiveQuery(() => db.planDays.get(id), [id]);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const openSession = useLiveQuery(
    () => db.workoutSessions.where('date').equals(todayStr()).filter((s) => !s.completed && s.planDayId === id).first(),
    [id],
  );
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [pickId, setPickId] = useState<number | ''>('');
  const [newEx, setNewEx] = useState({ name: '', muscleGroup: '', machine: '', sets: 3, repsLow: 8, repsHigh: 12 });

  if (!day || !exercises) return null;

  const exById = new Map(exercises.map((e) => [e.id!, e]));
  const notInDay = exercises.filter((e) => !day.exercises.some((de) => de.exerciseId === e.id));

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
      muscleGroup: newEx.muscleGroup.trim() || 'General',
      machine: newEx.machine.trim(),
      targetSets: newEx.sets,
      targetRepsLow: newEx.repsLow,
      targetRepsHigh: newEx.repsHigh,
    };
    const exId = await db.exercises.add(exData);
    const updated = [...day!.exercises, { exerciseId: exId as number, sets: exData.targetSets, repsLow: exData.targetRepsLow, repsHigh: exData.targetRepsHigh }];
    await db.planDays.update(day!.id!, { exercises: updated });
    setNewEx({ name: '', muscleGroup: '', machine: '', sets: 3, repsLow: 8, repsHigh: 12 });
    setShowNewExercise(false);
  }

  async function removeExercise(exerciseId: number) {
    const updated = day!.exercises.filter((e) => e.exerciseId !== exerciseId);
    await db.planDays.update(day!.id!, { exercises: updated });
  }

  return (
    <div className="pb-4">
      <PageHeader title={day.name} subtitle="Exercises & machines for this day" />
      <div className="flex flex-col gap-3 px-4">
        {day.exercises.length === 0 && <EmptyState text="No exercises yet — add some below." />}

        {day.exercises.map((de) => {
          const ex = exById.get(de.exerciseId);
          if (!ex) return null;
          return (
            <Card key={de.exerciseId}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{ex.name}</h3>
                  <p className="text-sm text-slate-400">{ex.machine}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {ex.muscleGroup} · {de.sets} sets × {de.repsLow}-{de.repsHigh} reps
                  </p>
                </div>
                <button
                  onClick={() => removeExercise(de.exerciseId)}
                  className="text-xs text-red-400/80 underline underline-offset-2"
                >
                  remove
                </button>
              </div>
            </Card>
          );
        })}

        <Button onClick={startWorkout} disabled={day.exercises.length === 0}>
          {openSession ? 'Resume Workout ▸' : 'Start Workout ▸'}
        </Button>

        <div className="mt-2 flex flex-col gap-2">
          {showAddExercise ? (
            <Card className="flex flex-col gap-2">
              <Select value={pickId} onChange={(e) => setPickId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Choose an exercise…</option>
                {notInDay.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} — {e.machine}
                  </option>
                ))}
              </Select>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={addExisting}>Add</Button>
                <Button variant="secondary" className="flex-1" onClick={() => setShowAddExercise(false)}>Cancel</Button>
              </div>
            </Card>
          ) : (
            <Button variant="secondary" onClick={() => setShowAddExercise(true)}>+ Add Existing Exercise</Button>
          )}

          {showNewExercise ? (
            <Card className="flex flex-col gap-2">
              <Input placeholder="Exercise name" value={newEx.name} onChange={(e) => setNewEx({ ...newEx, name: e.target.value })} />
              <Input placeholder="Muscle group (e.g. Chest)" value={newEx.muscleGroup} onChange={(e) => setNewEx({ ...newEx, muscleGroup: e.target.value })} />
              <Input placeholder="Machine / equipment" value={newEx.machine} onChange={(e) => setNewEx({ ...newEx, machine: e.target.value })} />
              <div className="flex gap-2">
                <Input type="number" placeholder="Sets" value={newEx.sets} onChange={(e) => setNewEx({ ...newEx, sets: Number(e.target.value) })} />
                <Input type="number" placeholder="Reps low" value={newEx.repsLow} onChange={(e) => setNewEx({ ...newEx, repsLow: Number(e.target.value) })} />
                <Input type="number" placeholder="Reps high" value={newEx.repsHigh} onChange={(e) => setNewEx({ ...newEx, repsHigh: Number(e.target.value) })} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={addNewExercise}>Create & Add</Button>
                <Button variant="secondary" className="flex-1" onClick={() => setShowNewExercise(false)}>Cancel</Button>
              </div>
            </Card>
          ) : (
            <Button variant="secondary" onClick={() => setShowNewExercise(true)}>+ Create New Exercise</Button>
          )}
        </div>
      </div>
    </div>
  );
}
