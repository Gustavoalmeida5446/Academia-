const toneClasses = {
  default: {
    icon: "bg-sky-400/15 text-sky-200",
    button: "btn-primary"
  },
  danger: {
    icon: "bg-rose-400/15 text-rose-200",
    button: "btn-danger"
  }
};

export function ConfirmDialog({ confirmState, onCancel, onConfirm }) {
  if (!confirmState) return null;

  const tone = toneClasses[confirmState.tone] || toneClasses.default;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur sm:items-center">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-900 p-5 shadow-2xl sm:p-6">
        <div className="flex items-start gap-4">
          <div className={`rounded-2xl px-3 py-2 text-sm font-semibold ${tone.icon}`}>
            Confirmar
          </div>
          <div className="flex-1">
            <h3 className="font-display text-2xl text-white">{confirmState.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{confirmState.message}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button className="btn-secondary" onClick={onCancel} type="button">
            {confirmState.cancelLabel}
          </button>
          <button className={tone.button} onClick={onConfirm} type="button">
            {confirmState.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
