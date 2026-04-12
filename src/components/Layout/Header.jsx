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

export function Header({ currentUser, syncStatus }) {
  const syncBadge = getSyncBadge(syncStatus);
  const syncMessage =
    syncStatus === "cloud"
      ? "Seus dados podem ser sincronizados com a nuvem."
      : syncStatus === "syncing"
        ? "O app esta atualizando seus dados agora."
        : syncStatus === "error"
          ? "Houve um problema de sincronizacao. O modo local continua funcionando."
          : "Voce ainda pode usar tudo localmente neste navegador.";

  return (
    <header className="panel overflow-hidden">
      <div className="grid gap-8 bg-gradient-to-r from-white/[0.05] via-orange-500/[0.08] to-sky-500/[0.08] px-5 py-6 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:py-8">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <StatusPill tone={syncBadge.tone}>{syncBadge.label}</StatusPill>
            <StatusPill>{currentUser?.email || "Nao logado"}</StatusPill>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-200/80">
              Academia-
            </p>
            <h1 className="max-w-3xl font-display text-4xl leading-tight text-white sm:text-5xl">
              Seu treino A/B/C com visual melhor, estrutura melhor e o mesmo fluxo simples.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Login com Supabase, fallback local, historico por data, backup em JSON e uma
              interface mais organizada para usar no celular ou no desktop.
            </p>
          </div>
        </div>

          <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-sm font-semibold text-white">Resumo rapido</p>
          <div className="grid gap-2 text-sm text-slate-300">
            <p>Auth: cadastro, login e logout continuam funcionando.</p>
            <p>Dados: localStorage continua sendo o fallback padrao.</p>
            <p>Cloud: sincronizacao com Supabase segue disponivel.</p>
            <p className="pt-2 text-slate-400">{syncMessage}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
