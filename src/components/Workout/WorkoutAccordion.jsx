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
  busyAction,
  onlyPendingMode,
  expandMode,
  editingEnabled,
  onToggleEditing,
  onToggleExercise,
  onSaveWeight,
  onCompleteWorkout,
  onRenameWorkout,
  onDeleteWorkout,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onReorderExercise
}) {
  const [isOpen, setIsOpen] = useState(false);

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
  const canCompleteWorkout = exercises.length > 0 && doneCount === exercises.length;

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/78">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <button
          className="min-w-0 flex-1 text-left"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <p className="font-display text-2xl text-white">{workoutName}</p>
        </button>

        <div className="flex items-center gap-2">
          {editingEnabled ? (
            <button className="btn-secondary" onClick={() => onToggleEditing(workoutName)} type="button">
              Fechar edicao
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => onToggleEditing(workoutName)} type="button">
              Editar
            </button>
          )}
          <span className="text-sm text-slate-500">{isOpen ? "−" : "+"}</span>
        </div>
      </div>

      {isOpen ? (
        <div className="grid gap-4 border-t border-white/10 px-4 py-4 sm:px-5 sm:py-5">
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
                  busyAction={busyAction}
                  onToggle={onToggleExercise}
                  onSaveWeight={onSaveWeight}
                />
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-400">
              Nenhum exercicio visivel nesse filtro.
            </div>
          )}

          {canCompleteWorkout ? (
            <div className="flex justify-start">
              <button
                className="btn-primary"
                disabled={busyAction === "completeWorkout"}
                onClick={() => onCompleteWorkout(workoutName)}
                type="button"
              >
                {busyAction === "completeWorkout" ? "Concluindo..." : "Concluir treino"}
              </button>
            </div>
          ) : null}

          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
            {doneCount} de {exercises.length} exercicios marcados
          </div>
        </div>
      ) : null}
    </article>
  );
}
