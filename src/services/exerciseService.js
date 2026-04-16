import {
  normalizeExercise,
  normalizeExerciseName,
  normalizeExerciseSuggestion
} from "../utils/normalizeExercise";

export function getDoneCount(exercises) {
  return Object.values(exercises).filter((item) => item.checked).length;
}

export function getTotalCount(exercises) {
  return Object.keys(exercises).length;
}

export function getCustomExerciseSuggestions(workouts) {
  const seen = new Set();
  const suggestions = [];

  (workouts || []).forEach((workout) => {
    (workout.exercises || []).forEach((exercise) => {
      const normalizedName = normalizeExerciseName(exercise.name);
      if (!normalizedName || seen.has(normalizedName)) return;

      seen.add(normalizedName);
      suggestions.push(normalizeExerciseSuggestion(exercise, "custom"));
    });
  });

  return suggestions;
}

export function filterExerciseSuggestions(suggestions, query) {
  const normalizedQuery = normalizeExerciseName(query);

  if (!normalizedQuery) {
    return suggestions.slice(0, 8);
  }

  return suggestions
    .filter((exercise) => normalizeExerciseName(exercise.name).includes(normalizedQuery))
    .slice(0, 8);
}

export function mergeExerciseSuggestions(...suggestionGroups) {
  const seen = new Set();
  const merged = [];

  suggestionGroups.flat().forEach((exercise) => {
    const normalized = normalizeExercise(exercise);
    const normalizedName = normalizeExerciseName(normalized.name);

    if (!normalizedName || seen.has(normalizedName)) return;

    seen.add(normalizedName);
    merged.push({
      ...normalized,
      source: exercise.source || "custom",
      key: exercise.key || normalizedName
    });
  });

  return merged;
}

export async function fetchApiExerciseSuggestions(query) {
  const normalizedQuery = normalizeExerciseName(query);

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `https://wger.de/api/v2/exerciseinfo/?language=2&limit=12&name=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    return results.map((item) => {
      const image = Array.isArray(item.images) ? item.images.find((img) => img.image) : null;
      return normalizeExerciseSuggestion(
        {
          name: item.name,
          sets: "3",
          reps: "10-12",
          videoQuery: item.name,
          muscleGroup: item.category?.name || "",
          mediaUrl: image?.image || "",
          externalId: String(item.id || "")
        },
        "api"
      );
    });
  } catch {
    return [];
  }
}
