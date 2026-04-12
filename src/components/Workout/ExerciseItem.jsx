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
    <details className="group overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02]">
      <summary className="grid cursor-pointer list-none gap-4 px-4 py-4 lg:grid-cols-[1.35fr_0.8fr_0.75fr] lg:items-center">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-white">{exercise.name}</p>
          <p className="mt-1 text-sm text-slate-400">
            {exercise.sets} series • {exercise.reps} reps
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-slate-300">
          Peso atual: <span className="font-semibold text-white">{exerciseState.usedWeight || "-"}</span>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              exerciseState.checked
                ? "bg-emerald-400/15 text-emerald-200"
                : "bg-rose-400/15 text-rose-200"
            }`}
          >
            {exerciseState.checked ? "Feito" : "Pendente"}
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Abrir</span>
        </div>
      </summary>

      <div className="grid gap-4 border-t border-white/10 px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
            <input
              checked={exerciseState.checked}
              className="h-5 w-5 accent-emerald-400"
              type="checkbox"
              aria-label={`Marcar ${exercise.name} como feito`}
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
              aria-label={`Peso usado em ${exercise.name}`}
              onChange={(event) => onWeightChange(exerciseKey, event.target.value)}
            />
          </label>

          <a
            className="btn-secondary min-h-[54px]"
            href={youtubeSearchLink(exercise.videoQuery)}
            rel="noreferrer"
            target="_blank"
          >
            Ver execucao
          </a>
        </div>

        <p className="text-sm text-slate-400">
          Ultima alteracao: {formatDateTime(exerciseState.updatedAt)}
        </p>
      </div>
    </details>
  );
}
