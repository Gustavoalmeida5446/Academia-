import { memo, useEffect, useState } from "react";
import { formatDateTime } from "../../utils/date";

function ExerciseItemComponent({
  exercise,
  exerciseKey,
  exerciseState,
  onToggle,
  onSaveWeight,
  busyAction
}) {
  const [weightDraft, setWeightDraft] = useState(exerciseState.usedWeight ?? "");
  const showSaveWeight = String(weightDraft) !== String(exerciseState.usedWeight ?? "");

  useEffect(() => {
    setWeightDraft(exerciseState.usedWeight ?? "");
  }, [exerciseState.usedWeight]);

  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold text-white">{exercise.name}</p>
          <p className="mt-1 text-sm text-slate-400">
            {exercise.sets} series • {exercise.reps} reps
          </p>
        </div>

          <label className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
            <input
              checked={exerciseState.checked}
              className="h-5 w-5 accent-slate-300"
              type="checkbox"
              aria-label={`Marcar ${exercise.name} como feito`}
              onChange={(event) => onToggle(exerciseKey, event.target.checked)}
            />
          <span>{exerciseState.checked ? "Feito" : "Marcar como feito"}</span>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-[220px_auto] sm:items-end">
        <label className="grid gap-2 text-sm text-slate-300">
          Peso usado (kg)
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="input-base sm:flex-1"
              min="0"
              placeholder="Ex: 20"
              step="0.5"
              type="number"
              value={weightDraft}
              aria-label={`Peso usado em ${exercise.name}`}
              onChange={(event) => setWeightDraft(event.target.value)}
            />
            <button
              className="btn-secondary sm:min-w-[140px]"
              disabled={!showSaveWeight || busyAction === `exerciseWeight:${exerciseKey}`}
              onClick={() => onSaveWeight(exerciseKey, weightDraft)}
              type="button"
            >
              {busyAction === `exerciseWeight:${exerciseKey}` ? "Salvando..." : "Salvar peso"}
            </button>
          </div>
        </label>

        <div className="flex flex-wrap gap-3">
          <span className="self-center text-sm text-slate-500">
            Ultima alteracao: {formatDateTime(exerciseState.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

export const ExerciseItem = memo(ExerciseItemComponent);
