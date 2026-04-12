import { formatDateTime } from "../../utils/date";
import { youtubeSearchLink } from "../../utils/format";

export function ExerciseItem({
  exercise,
  exerciseKey,
  exerciseState,
  onToggle,
  onWeightChange
}) {
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
          <input
            className="input-base"
            min="0"
            placeholder="Ex: 20"
            step="0.5"
            type="number"
            value={exerciseState.usedWeight}
            aria-label={`Peso usado em ${exercise.name}`}
            onChange={(event) => onWeightChange(exerciseKey, event.target.value)}
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <a
            className="btn-secondary"
            href={youtubeSearchLink(exercise.videoQuery)}
            rel="noreferrer"
            target="_blank"
          >
            Ver execucao
          </a>
          <span className="self-center text-sm text-slate-500">
            Ultima alteracao: {formatDateTime(exerciseState.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
