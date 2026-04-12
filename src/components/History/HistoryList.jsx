import { formatDate } from "../../utils/date";
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
          className="rounded-3xl border border-white/10 bg-slate-900/70 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white">{entry.workout}</h3>
              <p className="mt-1 text-sm text-slate-400">{formatDate(entry.recordDate)}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
              {entry.exercises.length} exercicios
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
