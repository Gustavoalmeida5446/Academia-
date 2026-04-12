export function sanitizeNumericInput(value, { allowEmpty = true } = {}) {
  if (allowEmpty && value === "") return "";

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return null;
  }

  return String(value);
}

export function validateImportedState(parsed) {
  if (!parsed || typeof parsed !== "object") return false;
  if (!parsed.exercises || typeof parsed.exercises !== "object") return false;
  if (parsed.history && !Array.isArray(parsed.history)) return false;
  if (parsed.bodyWeightHistory && !Array.isArray(parsed.bodyWeightHistory)) return false;
  if (parsed.workouts && !Array.isArray(parsed.workouts)) return false;
  return true;
}
