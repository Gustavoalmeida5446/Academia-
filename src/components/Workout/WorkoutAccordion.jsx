import { useEffect, useState } from "react";
import { makeExerciseKey } from "../../utils/keys";
import { ExerciseItem } from "./ExerciseItem";
import { WorkoutEditor } from "./WorkoutEditor";

export function WorkoutAccordion({
  workout,
  workouts,
  workoutName,
  exercises,
  state,
  onlyPendingMode,
  expandMode,
  editingEnabled,
  onToggleEditing,
  onToggleExercise,
  onWeightChange,
  onRenameWorkout,
  onDeleteWorkout,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onReorderExercise
}) {
  const [isOpen, setIsOpen] = useState(workoutName === "Treino A");

  useEffect(() => {
    if (expandMode === "all") setIsOpen(true);
    if (expandMode === "none") setIsOpen(false);
  }, [expandMode]);

  const visibleExercises = exercises.filter((exercise) => {
    const exerciseKey = makeExerciseKey(workoutName, exercise.name);
    const exerciseState = state.exercises[exerciseKey];

    if (!exerciseState) return false;
    if (onlyPendingMode && exerciseState.checked) return false;
    return true;
  });

  const doneCount = exercises.filter((exercise) => {
    const exerciseKey = makeExerciseKey(workoutName, exercise.name);
    return state.exercises[exerciseKey]?.checked;
  }).length;

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70">
      <div className="flex flex-col gap-4 bg-gradient-to-r from-white/[0.06] to-white/[0.02] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          className="flex-1 text-left"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <p className="font-display text-2xl text-white">{workoutName}</p>
          <p className="mt-1 text-sm text-slate-400">{exercises.length} exercicios no total</p>
        </button>

        <div className="flex items-center gap-3">
          <button className="btn-secondary" onClick={() => onToggleEditing(workoutName)} type="button">
            {editingEnabled ? "Fechar edicao" : "Editar"}
          </button>
          <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-slate-200">
            {doneCount} / {exercises.length} concluidos
          </span>
          <button className="text-sm text-slate-400" onClick={() => setIsOpen((current) => !current)} type="button">
            {isOpen ? "Fechar" : "Abrir"}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="grid gap-3 border-t border-white/10 p-4 sm:p-5">
          {editingEnabled ? (
            <WorkoutEditor
              workout={workout}
              workouts={workouts}
              onAddExercise={onAddExercise}
              onDeleteExercise={onDeleteExercise}
              onDeleteWorkout={onDeleteWorkout}
              onRenameWorkout={onRenameWorkout}
              onReorderExercise={onReorderExercise}
              onUpdateExercise={onUpdateExercise}
            />
          ) : null}

          {visibleExercises.length ? (
            visibleExercises.map((exercise) => {
              const exerciseKey = makeExerciseKey(workoutName, exercise.name);

              return (
                <ExerciseItem
                  key={exerciseKey}
                  exercise={exercise}
                  exerciseKey={exerciseKey}
                  exerciseState={state.exercises[exerciseKey]}
                  onToggle={onToggleExercise}
                  onWeightChange={onWeightChange}
                />
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-slate-400">
              Nenhum exercicio visivel nesse filtro.
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
