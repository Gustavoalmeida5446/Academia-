export function normalizeExercise(exercise) {
  return {
    name: exercise?.name || "",
    sets: exercise?.sets || "",
    reps: exercise?.reps || "",
    videoQuery: exercise?.videoQuery || exercise?.name || "",
    muscleGroup: exercise?.muscleGroup || "",
    mediaUrl: exercise?.mediaUrl || "",
    externalId: exercise?.externalId || ""
  };
}

export function normalizeExerciseSuggestion(exercise, source = "local") {
  const normalized = normalizeExercise(exercise);

  return {
    ...normalized,
    source,
    key: `${normalized.name.toLowerCase()}__${source}`
  };
}

export function normalizeExerciseName(value) {
  return (value || "").trim().toLowerCase();
}
