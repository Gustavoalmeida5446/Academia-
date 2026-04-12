import { useState } from "react";

export function ExerciseEditor({
  exercise,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onSave,
  onDelete
}) {
  const [draft, setDraft] = useState({
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    videoQuery: exercise.videoQuery
  });

  function updateDraft(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <div className="grid gap-3 xl:grid-cols-[1.2fr_0.45fr_0.45fr_1fr_auto]">
        <input
          className="input-base"
          placeholder="Nome"
          value={draft.name}
          onChange={(event) => updateDraft("name", event.target.value)}
        />
        <input
          className="input-base"
          placeholder="Series"
          value={draft.sets}
          onChange={(event) => updateDraft("sets", event.target.value)}
        />
        <input
          className="input-base"
          placeholder="Reps"
          value={draft.reps}
          onChange={(event) => updateDraft("reps", event.target.value)}
        />
        <input
          className="input-base"
          placeholder="Busca do video"
          value={draft.videoQuery}
          onChange={(event) => updateDraft("videoQuery", event.target.value)}
        />
        <button className="btn-secondary" onClick={() => onSave(draft)} type="button">
          Salvar
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="btn-secondary"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          type="button"
        >
          Subir
        </button>
        <button
          className="btn-secondary"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          type="button"
        >
          Descer
        </button>
        <button className="btn-danger" onClick={onDelete} type="button">
          Excluir
        </button>
      </div>
    </div>
  );
}
