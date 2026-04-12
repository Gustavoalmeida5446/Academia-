export function StatusPill({ children, tone = "default" }) {
  const toneClasses = {
    default: "border-white/10 bg-white/5 text-slate-200",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    warning: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    info: "border-sky-400/30 bg-sky-400/10 text-sky-200",
    danger: "border-rose-400/30 bg-rose-400/10 text-rose-200"
  };

  return (
    <span className={`badge ${toneClasses[tone] || toneClasses.default}`}>
      {children}
    </span>
  );
}
