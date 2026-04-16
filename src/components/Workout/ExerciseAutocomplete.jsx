import { useEffect, useMemo, useState } from "react";
import {
  fetchApiExerciseSuggestions,
  filterExerciseSuggestions,
  getCustomExerciseSuggestions,
  getFallbackExerciseSuggestions,
  mergeExerciseSuggestions
} from "../../services/exerciseService";

const sourceLabels = {
  custom: "Seu treino",
  fallback: "Base local",
  api: "API"
};

export function ExerciseAutocomplete({
  value,
  workouts,
  onChange,
  onSelectSuggestion,
  label = "Exercicio"
}) {
  const [apiSuggestions, setApiSuggestions] = useState([]);
  const [loadingApi, setLoadingApi] = useState(false);

  const customSuggestions = useMemo(
    () => getCustomExerciseSuggestions(workouts),
    [workouts]
  );
  const fallbackSuggestions = useMemo(() => getFallbackExerciseSuggestions(), []);

  useEffect(() => {
    let active = true;

    if (!value || value.trim().length < 2) {
      setApiSuggestions([]);
      setLoadingApi(false);
      return undefined;
    }

    setLoadingApi(true);

    const timeoutId = window.setTimeout(async () => {
      const results = await fetchApiExerciseSuggestions(value);
      if (!active) return;
      setApiSuggestions(results);
      setLoadingApi(false);
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  const suggestions = useMemo(() => {
    const merged = mergeExerciseSuggestions(
      customSuggestions,
      fallbackSuggestions,
      apiSuggestions
    );

    return filterExerciseSuggestions(merged, value);
  }, [apiSuggestions, customSuggestions, fallbackSuggestions, value]);

  return (
    <div className="grid gap-2">
      <label className="grid gap-2 text-sm text-slate-300">
        {label}
        <input
          aria-label={label}
          autoComplete="off"
          className="input-base"
          placeholder="Digite ou escolha um exercicio"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>

      {value ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sugestoes</p>
            <p className="text-xs text-slate-400">
              {loadingApi ? "Buscando API..." : "Entrada manual sempre liberada"}
            </p>
          </div>

          {suggestions.length ? (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/[0.08]"
                  onClick={() => onSelectSuggestion(suggestion)}
                  type="button"
                >
                  <span className="block font-medium text-white">{suggestion.name}</span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {sourceLabels[suggestion.source]} • {suggestion.muscleGroup || "Grupo geral"} • {suggestion.sets || "3"}x{suggestion.reps || "10-12"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">
              Nenhuma sugestao encontrada. Voce pode digitar um exercicio manualmente.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
