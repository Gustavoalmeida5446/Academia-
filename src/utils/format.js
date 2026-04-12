export function formatWeight(value) {
  if (value === "" || value === null || value === undefined) return "-";
  return `${value} kg`;
}

export function youtubeSearchLink(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
