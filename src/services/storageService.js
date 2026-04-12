import { LOCAL_STORAGE_KEY } from "../utils/keys";

export function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStateToStorage(state) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

export function exportStateBackup(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "treino-backup.json";
  link.click();
  URL.revokeObjectURL(url);
}
