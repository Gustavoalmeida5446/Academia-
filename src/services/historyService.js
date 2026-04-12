export function normalizeHistoryEntries(history) {
  const map = new Map();

  (Array.isArray(history) ? history : []).forEach((item) => {
    if (!item?.workout || !item?.recordDate) return;

    const key = `${item.workout}__${item.recordDate}`;
    const normalized = {
      workout: item.workout,
      recordDate: item.recordDate,
      bodyWeight: item.bodyWeight ?? "",
      completedAt: item.completedAt || "",
      exercises: Array.isArray(item.exercises) ? item.exercises : []
    };

    const existing = map.get(key);
    if (!existing) {
      map.set(key, normalized);
      return;
    }

    const existingTime = existing.completedAt ? new Date(existing.completedAt).getTime() : 0;
    const nextTime = normalized.completedAt ? new Date(normalized.completedAt).getTime() : 0;

    if (nextTime >= existingTime) {
      map.set(key, normalized);
    }
  });

  return Array.from(map.values());
}

export function buildHistoryEntry({ state, workoutName, recordDate, completedAt }) {
  const exercises = Object.values(state.exercises)
    .filter((item) => item.workout === workoutName)
    .map((item) => ({
      exercise: item.exercise,
      usedWeight: item.usedWeight,
      checked: item.checked
    }));

  return {
    workout: workoutName,
    recordDate,
    bodyWeight: state.bodyWeight,
    completedAt,
    exercises
  };
}
