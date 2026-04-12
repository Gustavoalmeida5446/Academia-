export function StatusPill({ children, tone = "default" }) {
  const toneClasses = {
    default: "border-white/10 bg-white/5 text-slate-200",
    success: "border-slate-500/30 bg-slate-400/10 text-slate-200",
    warning: "border-slate-500/30 bg-slate-400/10 text-slate-200",
    info: "border-slate-500/30 bg-slate-400/10 text-slate-200",
    danger: "border-slate-500/30 bg-slate-400/10 text-slate-200"
  };

  return (
    <span className={`badge ${toneClasses[tone] || toneClasses.default}`}>
      {children}
    </span>
  );
}
