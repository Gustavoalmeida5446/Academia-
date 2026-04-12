import { useCallback, useState } from "react";

export function useFeedback() {
  const [feedback, setFeedback] = useState(null);

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

  return {
    feedback,
    showFeedback,
    clearFeedback
  };
}
