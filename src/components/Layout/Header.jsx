import { formatWeight } from "../../utils/format";
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

export function Header({ currentUser, syncStatus, recordDate, bodyWeight, doneCount, totalCount }) {
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
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-200/80">
              Academia-
            </p>
            <h1 className="max-w-3xl font-display text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl">
              Um painel de treino mais claro, mais bonito e muito mais facil de usar.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              O foco agora fica no treino do dia: progresso, peso corporal, acoes principais e
              treinos organizados em uma ordem que faz mais sentido no uso real.
            </p>
          </div>

          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Data ativa</p>
              <p className="mt-3 font-display text-2xl text-white">{recordDate || "-"}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Progresso</p>
              <p className="mt-3 font-display text-2xl text-white">
                {doneCount} / {totalCount}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Peso corporal</p>
              <p className="mt-3 font-display text-2xl text-white">{formatWeight(bodyWeight)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-[32px] border border-white/10 bg-slate-950/70 p-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Conta</p>
            <p className="mt-3 text-lg font-semibold text-white">
              {currentUser?.email || "Usando somente o modo local"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">{syncMessage}</p>
          </div>

          <div className="grid gap-3">
            <p className="text-sm font-semibold text-white">O que importa agora</p>
            <div className="grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                1. Escolha a data e ajuste seu peso corporal.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                2. Marque os exercicios e registre as cargas usadas.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                3. Conclua o treino para salvar o historico do dia.
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
