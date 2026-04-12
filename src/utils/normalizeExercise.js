export function normalizeExercise(exercise) {
  return {
    name: exercise?.name || "",
    sets: exercise?.sets || "",
    reps: exercise?.reps || "",
    videoQuery: exercise?.videoQuery || exercise?.name || ""
  };
}
