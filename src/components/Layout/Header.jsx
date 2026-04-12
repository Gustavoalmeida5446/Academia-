function getSyncBadge(syncStatus) {
  if (syncStatus === "cloud") {
    return {
      label: "Sincronizando com Supabase",
      className: "badge border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
    };
  }

  if (syncStatus === "syncing") {
    return {
      label: "Sincronizando agora",
      className: "badge border-sky-400/30 bg-sky-400/10 text-sky-200"
    };
  }

  if (syncStatus === "error") {
    return {
      label: "Erro de sincronizacao",
      className: "badge border-rose-400/30 bg-rose-400/10 text-rose-200"
    };
  }

  return {
    label: "Modo local",
    className: "badge border-amber-400/30 bg-amber-400/10 text-amber-100"
  };
}

export function Header({ currentUser, syncStatus }) {
  const syncBadge = getSyncBadge(syncStatus);

  return (
    <header className="panel overflow-hidden">
      <div className="grid gap-8 bg-gradient-to-r from-white/[0.05] via-orange-500/[0.08] to-sky-500/[0.08] px-5 py-6 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:py-8">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <span className={syncBadge.className}>{syncBadge.label}</span>
            <span className="badge border-white/10 bg-white/5 text-slate-200">
              {currentUser?.email || "Nao logado"}
            </span>
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
          </div>
        </div>
      </div>
    </header>
  );
}
