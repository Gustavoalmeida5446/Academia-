import { createPortal } from "react-dom";
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

export function Header({
  currentUser,
  syncStatus,
  busyAction,
  activeScreen,
  menuOpen,
  onOpenAccount,
  onToggleMenu,
  onNavigate,
  onSaveSync,
  onRefreshSync
}) {
  const syncBadge = getSyncBadge(syncStatus);
  const navItems = [
    { id: "home", label: "Inicio" },
    { id: "treinos", label: "Treinos" },
    { id: "dieta", label: "Dieta" },
    { id: "parametros", label: "Parametros" },
    { id: "historico", label: "Historico" },
    { id: "peso", label: "Peso corporal" },
    { id: "dados", label: "Backup e dados" }
  ];

  return (
    <header className="panel relative px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {currentUser ? (
            <>
              <button
                className="btn-primary"
                disabled={busyAction === "saveSync"}
                onClick={onSaveSync}
                type="button"
              >
                {busyAction === "saveSync" ? "Salvando..." : "Salvar"}
              </button>
              <button
                className="btn-secondary"
                disabled={busyAction === "refreshSync"}
                onClick={onRefreshSync}
                type="button"
              >
                {busyAction === "refreshSync" ? "Atualizando..." : "Atualizar"}
              </button>
            </>
          ) : (
            <span className="text-sm text-slate-500">Modo local</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-500 sm:inline">
            {navItems.find((item) => item.id === activeScreen)?.label}
          </span>
          <button
            aria-expanded={menuOpen}
            aria-label="Abrir menu de navegacao"
            className="btn-secondary"
            onClick={onToggleMenu}
            type="button"
          >
            Menu
          </button>
        </div>
      </div>

      {menuOpen && typeof document !== "undefined"
        ? createPortal(
        <div className="fixed inset-0 z-[9999]">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 h-full w-full bg-slate-950/70 backdrop-blur-sm"
            onClick={onToggleMenu}
            type="button"
          />

          <div className="absolute right-4 top-4 w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-white/10 bg-slate-950/96 p-3 shadow-2xl shadow-black/50 sm:right-5 sm:top-5">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="grid gap-1">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Conta</span>
                <span className="text-sm text-slate-200">
                  {currentUser ? currentUser.email : "Nao conectado"}
                </span>
              </div>
              <button className="btn-secondary" onClick={onOpenAccount} type="button">
                {currentUser ? "Conta" : "Entrar"}
              </button>
            </div>

            <div className="mb-3">
              <StatusPill tone={syncBadge.tone}>{syncBadge.label}</StatusPill>
            </div>

            <nav className="grid gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`rounded-2xl px-4 py-3 text-left text-sm transition ${
                    activeScreen === item.id
                      ? "bg-white/10 text-white"
                      : "bg-transparent text-slate-300 hover:bg-white/[0.05]"
                  }`}
                  onClick={() => onNavigate(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        , document.body)
        : null}
    </header>
  );
}
