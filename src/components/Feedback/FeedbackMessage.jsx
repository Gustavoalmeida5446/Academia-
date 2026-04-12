import { useEffect } from "react";

const typeClasses = {
  info: "border-white/10 bg-slate-800/95 text-slate-100",
  success: "border-white/10 bg-slate-800/95 text-slate-100",
  error: "border-white/10 bg-slate-800/95 text-slate-100"
};

export function FeedbackMessage({ feedback, onClose }) {
  useEffect(() => {
    if (!feedback) return undefined;

    const timeoutId = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeoutId);
  }, [feedback, onClose]);

  if (!feedback) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm">
      <div
        className={`rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${typeClasses[feedback.type]}`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="leading-6">{feedback.message}</p>
          <button className="text-current/80 hover:text-current" onClick={onClose} type="button">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
