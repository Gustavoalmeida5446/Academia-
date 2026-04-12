import { useEffect } from "react";

const typeClasses = {
  info: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  error: "border-rose-400/30 bg-rose-400/10 text-rose-100"
};

export function FeedbackMessage({ feedback, onClose }) {
  useEffect(() => {
    if (!feedback) return undefined;

    const timeoutId = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeoutId);
  }, [feedback, onClose]);

  if (!feedback) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
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
