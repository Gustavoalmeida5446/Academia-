export function formatWeight(value) {
  if (value === "" || value === null || value === undefined) return "-";
  return `${value} kg`;
}
