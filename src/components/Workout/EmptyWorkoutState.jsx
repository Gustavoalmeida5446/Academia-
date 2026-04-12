export function EmptyWorkoutState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02] px-4 py-12 text-center text-slate-400">
      <p className="font-semibold text-white">Nenhum treino cadastrado.</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Crie um treino para montar sua rotina e acompanhar a execucao por data.
      </p>
    </div>
  );
}
