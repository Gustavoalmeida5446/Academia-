import { useState } from "react";
import { EmptyWorkoutState } from "./EmptyWorkoutState";
import { WorkoutAccordion } from "./WorkoutAccordion";

export function WorkoutSection({
  workouts,
  workoutMap,
  state,
  onlyPendingMode,
  expandMode,
  onCreateWorkout,
  onToggleExercise,
  onWeightChange,
  onRenameWorkout,
  onDeleteWorkout,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onReorderExercise
}) {
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [editingWorkoutName, setEditingWorkoutName] = useState("");
  const entries = Object.entries(workoutMap);

  function handleCreateWorkout(event) {
    event.preventDefault();
    onCreateWorkout(newWorkoutName);
    setNewWorkoutName("");
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          Treinos
        </p>
        <h2 className="font-display text-3xl text-white">Escolha um treino para abrir</h2>
      </div>

      {entries.length ? (
        <div className="grid gap-4">
          {entries.map(([workoutName, exercises], index) => (
            <WorkoutAccordion
              key={workoutName}
              editingEnabled={editingWorkoutName === workoutName}
              expandMode={expandMode}
              onlyPendingMode={onlyPendingMode}
              state={state}
              workout={workouts[index]}
              workouts={workouts}
              exercises={exercises}
              workoutName={workoutName}
              onAddExercise={onAddExercise}
              onDeleteExercise={onDeleteExercise}
              onDeleteWorkout={onDeleteWorkout}
              onToggleExercise={onToggleExercise}
              onToggleEditing={(nextWorkoutName) =>
                setEditingWorkoutName((current) =>
                  current === nextWorkoutName ? "" : nextWorkoutName
                )
              }
              onWeightChange={onWeightChange}
              onRenameWorkout={onRenameWorkout}
              onReorderExercise={onReorderExercise}
              onUpdateExercise={onUpdateExercise}
            />
          ))}
        </div>
      ) : (
        <EmptyWorkoutState />
      )}

      <details className="panel">
        <summary className="cursor-pointer list-none px-4 py-4 text-sm font-semibold text-slate-300 sm:px-5">
          Editar e criar treinos
        </summary>
        <div className="border-t border-white/10 px-4 py-4 sm:px-5">
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleCreateWorkout}>
            <input
              className="input-base min-w-[220px]"
              placeholder="Novo treino"
              value={newWorkoutName}
              onChange={(event) => setNewWorkoutName(event.target.value)}
            />
            <button className="btn-primary" type="submit">
              Criar treino
            </button>
          </form>
        </div>
      </details>
    </section>
  );
}
