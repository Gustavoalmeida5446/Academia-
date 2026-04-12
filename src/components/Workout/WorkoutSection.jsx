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
    <section className="panel p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Exercicios
          </p>
          <h2 className="mt-2 font-display text-2xl text-white">Seus treinos</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            {onlyPendingMode ? "Filtro: pendentes" : "Filtro: todos"}
          </div>

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
    </section>
  );
}
