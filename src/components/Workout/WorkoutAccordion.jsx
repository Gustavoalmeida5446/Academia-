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
  const progress = exercises.length ? Math.round((doneCount / exercises.length) * 100) : 0;

  return (
    <article className="overflow-hidden rounded-[34px] border border-white/10 bg-gradient-to-br from-slate-900/85 via-slate-900/72 to-slate-950/90 shadow-glow">
      <div className="grid gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <button
          className="flex-1 text-left"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-3xl text-white">{workoutName}</p>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
              {exercises.length} exercicios
            </span>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Card principal do treino com progresso, acesso rapido a edicao e lista dos exercicios do dia.
          </p>
        </button>

        <div className="grid gap-4">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/65 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white">Progresso do treino</p>
              <p className="text-sm text-slate-300">{progress}%</p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {doneCount} de {exercises.length} exercicios concluidos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-secondary" onClick={() => onToggleEditing(workoutName)} type="button">
              {editingEnabled ? "Fechar edicao" : "Editar treino"}
            </button>
            <button className="btn-secondary" onClick={() => setIsOpen((current) => !current)} type="button">
              {isOpen ? "Ocultar exercicios" : "Mostrar exercicios"}
            </button>
          </div>
        </div>
      </div>

      {isOpen ? (
        <div className="grid gap-4 border-t border-white/10 bg-slate-950/35 p-4 sm:p-5">
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
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-400">
              Nenhum exercicio visivel nesse filtro.
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
