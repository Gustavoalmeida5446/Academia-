import { StatusPill } from "../Feedback/StatusPill";

export function AuthForm({
  currentUser,
  authForm,
  onChange,
  onSignUp,
  onSignIn,
  onSignOut,
  onSyncNow,
  supabaseReady,
  busyAction
}) {
  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Conta
          </p>
          <h2 className="mt-2 font-display text-2xl text-white">Acesso e sincronizacao</h2>
        </div>
        <StatusPill tone={supabaseReady ? "success" : "warning"}>
          {supabaseReady ? "Supabase configurado" : "Supabase nao configurado"}
        </StatusPill>
      </div>

      {!currentUser ? (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-300">
              Email
              <input
                className="input-base"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={authForm.email}
                onChange={(event) => onChange("email", event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-300">
              Senha
              <input
                className="input-base"
                type="password"
                placeholder="Sua senha"
                value={authForm.password}
                onChange={(event) => onChange("password", event.target.value)}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="btn-secondary" onClick={onSignUp} type="button">
              Cadastrar
            </button>
            <button className="btn-success" onClick={onSignIn} type="button">
              Entrar
            </button>
          </div>

          <p className="text-sm leading-6 text-slate-400">
            Sem login, o app continua funcionando no navegador atual com `localStorage`.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Logado como <span className="font-semibold">{currentUser.email}</span>.
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="btn-success"
              disabled={busyAction === "sync"}
              onClick={onSyncNow}
              type="button"
            >
              {busyAction === "sync" ? "Sincronizando..." : "Sincronizar agora"}
            </button>
            <button className="btn-secondary" onClick={onSignOut} type="button">
              Sair
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
