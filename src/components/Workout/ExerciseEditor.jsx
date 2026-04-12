import { useEffect, useState } from "react";
import { ExerciseAutocomplete } from "./ExerciseAutocomplete";

export function ExerciseEditor({
  exercise,
  workouts,
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
    reps: exercise.reps
  });

  useEffect(() => {
    setDraft({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps
    });
  }, [exercise]);

  function updateDraft(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: value
    }));
  }

  function applySuggestion(suggestion) {
    setDraft((current) => ({
      ...current,
      name: suggestion.name,
      sets: current.sets || suggestion.sets || "3",
      reps: current.reps || suggestion.reps || "10-12"
    }));
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <div className="grid gap-3">
        <ExerciseAutocomplete
          label="Nome"
          value={draft.name}
          workouts={workouts}
          onChange={(value) => updateDraft("name", value)}
          onSelectSuggestion={applySuggestion}
        />

        <div className="grid gap-3 xl:grid-cols-[0.45fr_0.45fr_auto]">
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
          <button className="btn-secondary" onClick={() => onSave(draft)} type="button">
            Salvar
          </button>
        </div>
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
