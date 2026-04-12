import { formatDate, formatDateTime } from "../../utils/date";
import { formatWeight } from "../../utils/format";
import { EmptyHistoryState } from "./EmptyHistoryState";

export function HistoryList({ history }) {
  if (!history.length) {
    return <EmptyHistoryState />;
  }

  return (
    <div className="grid gap-4">
      {history.map((entry) => (
        <article
          key={`${entry.workout}-${entry.recordDate}`}
          className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/70 to-slate-900/60 p-5"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="font-semibold text-white">
                {entry.workout} • {formatDate(entry.recordDate)}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Finalizado em {formatDateTime(entry.completedAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-2xl bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                Peso corporal: {formatWeight(entry.bodyWeight)}
              </div>
              <div className="rounded-2xl bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                {entry.exercises.length} exercicios
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {entry.exercises.map((exercise) => (
              <div
                key={`${entry.workout}-${entry.recordDate}-${exercise.exercise}`}
                className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="block text-white">{exercise.exercise}</span>
                  <span className="mt-1 block text-xs uppercase tracking-[0.2em] text-slate-500">
                    {exercise.checked ? "feito" : "nao feito"}
                  </span>
                </div>
                <span className="text-slate-400">{formatWeight(exercise.usedWeight)}</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
