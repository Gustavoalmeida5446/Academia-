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
    <details className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-950/55">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{exercise.name}</p>
          <p className="mt-1 text-sm text-slate-400">
            {exercise.sets} series • {exercise.reps} reps
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            exerciseState.checked
              ? "bg-emerald-400/15 text-emerald-200"
              : "bg-rose-400/15 text-rose-200"
          }`}
        >
          {exerciseState.checked ? "Feito" : "Pendente"}
        </span>
      </summary>

      <div className="grid gap-4 border-t border-white/10 px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
            <input
              checked={exerciseState.checked}
              className="h-5 w-5 accent-emerald-400"
              type="checkbox"
              onChange={(event) => onToggle(exerciseKey, event.target.checked)}
            />
            <span>Marcar exercicio como feito</span>
          </label>

          <label className="grid gap-2 text-sm text-slate-300">
            Peso usado (kg)
            <input
              className="input-base"
              min="0"
              placeholder="Ex: 20"
              step="0.5"
              type="number"
              value={exerciseState.usedWeight}
              onChange={(event) => onWeightChange(exerciseKey, event.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Ultima alteracao: {formatDateTime(exerciseState.updatedAt)}
          </p>

          <a
            className="btn-secondary"
            href={youtubeSearchLink(exercise.videoQuery)}
            rel="noreferrer"
            target="_blank"
          >
            Ver execucao
          </a>
        </div>
      </div>
    </details>
  );
}
