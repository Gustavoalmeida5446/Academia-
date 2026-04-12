import { useState } from "react";
import { StatusPill } from "../Feedback/StatusPill";
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
          <h2 className="mt-2 font-display text-3xl text-white">Treinos organizados por bloco</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Cada treino aparece como um card principal, com progresso no topo e exercicios em uma leitura mais direta.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <StatusPill>
            {onlyPendingMode ? "Filtro: pendentes" : "Filtro: todos"}
          </StatusPill>

          <form
            className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-slate-950/55 p-3 sm:flex-row sm:items-center"
            onSubmit={handleCreateWorkout}
          >
            <input
              className="input-base min-w-[220px] border-white/5 bg-white/[0.03]"
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
