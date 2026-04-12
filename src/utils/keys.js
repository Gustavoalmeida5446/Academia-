export const LOCAL_STORAGE_KEY = "gustavo_treino_abc_local_v4";

export function makeExerciseKey(workoutName, exerciseName) {
  return `${workoutName}__${exerciseName}`;
}
