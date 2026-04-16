import { formatDate, formatDateTime } from "../../utils/date";
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
          className="rounded-3xl border border-white/10 bg-slate-900/75 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">{entry.workout}</h3>
              <p className="mt-1 text-sm text-slate-400">{formatDate(entry.recordDate)}</p>
              <p className="mt-1 text-xs text-slate-500">Concluido em {formatDateTime(entry.completedAt)}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
              {entry.exercises.length} exercicios
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            {entry.exercises.slice(0, 4).map((exercise) => (
              <div key={exercise.exercise} className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm">
                <p className="text-slate-200">{exercise.exercise}</p>
                <p className="text-xs text-slate-500">{exercise.sets} series • {exercise.reps} reps • Peso {exercise.usedWeight || "-"} kg</p>
              </div>
            ))}
            {entry.exercises.length > 4 ? (
              <p className="text-xs text-slate-500">+{entry.exercises.length - 4} exercicios</p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
