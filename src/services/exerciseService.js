export function getDoneCount(exercises) {
  return Object.values(exercises).filter((item) => item.checked).length;
}

export function getTotalCount(exercises) {
  return Object.keys(exercises).length;
}
