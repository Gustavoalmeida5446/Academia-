export function EmptyHistoryState() {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center">
      <p className="font-semibold text-white">Nenhum historico ainda</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Conclua um treino para registrar cargas e peso corporal por data.
      </p>
    </div>
  );
}
