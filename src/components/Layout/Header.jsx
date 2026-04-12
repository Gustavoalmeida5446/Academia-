import { StatusPill } from "../Feedback/StatusPill";

function getSyncBadge(syncStatus) {
  if (syncStatus === "cloud") {
    return {
      label: "Supabase conectado",
      tone: "success"
    };
  }

  if (syncStatus === "syncing") {
    return {
      label: "Sincronizando agora",
      tone: "info"
    };
  }

  if (syncStatus === "error") {
    return {
      label: "Erro de sincronizacao",
      tone: "danger"
    };
  }

  return {
    label: "Modo local",
    tone: "warning"
  };
}

export function Header({ currentUser, syncStatus, onOpenAccount }) {
  const syncBadge = getSyncBadge(syncStatus);

  return (
    <header className="panel px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-600">
            Academia-
          </p>
          <h1 className="mt-2 font-display text-2xl text-white sm:text-3xl">
            Treinos
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Escolha um treino, abra e marque os exercicios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone={syncBadge.tone}>{syncBadge.label}</StatusPill>
          <button className="btn-secondary" onClick={onOpenAccount} type="button">
            {currentUser ? "Conta" : "Entrar"}
          </button>
        </div>
      </div>
    </header>
  );
}
