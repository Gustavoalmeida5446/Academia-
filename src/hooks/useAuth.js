import { useEffect, useState } from "react";
import { getCurrentSession } from "../services/authService";

export function useAuth(supabase) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return undefined;
    }

    let active = true;

    getCurrentSession(supabase)
      .then(({ data }) => {
        if (!active) return;
        setCurrentUser(data?.session?.user || null);
        setAuthReady(true);
      })
      .catch(() => {
        if (!active) return;
        setAuthReady(true);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setCurrentUser(session?.user || null);
      setAuthReady(true);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    currentUser,
    setCurrentUser,
    authReady
  };
}
