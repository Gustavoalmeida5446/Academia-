import { useCallback, useRef, useState } from "react";

export function useFeedback() {
  const [feedback, setFeedback] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const confirmResolverRef = useRef(null);

  const showFeedback = useCallback((message, type = "info") => {
    setFeedback({
      id: Date.now(),
      message,
      type
    });
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  const requestConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmState({
        title: options?.title || "Confirmar acao",
        message: options?.message || "Deseja continuar?",
        confirmLabel: options?.confirmLabel || "Confirmar",
        cancelLabel: options?.cancelLabel || "Cancelar",
        tone: options?.tone || "default"
      });
    });
  }, []);

  const closeConfirm = useCallback((confirmed) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(confirmed);
      confirmResolverRef.current = null;
    }

    setConfirmState(null);
  }, []);

  return {
    feedback,
    confirmState,
    showFeedback,
    clearFeedback,
    requestConfirm,
    closeConfirm
  };
}
