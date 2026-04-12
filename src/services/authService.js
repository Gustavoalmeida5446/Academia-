export async function signUpWithEmail(supabase, email, password) {
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(supabase, email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOutUser(supabase) {
  return supabase.auth.signOut();
}

export async function getCurrentSession(supabase) {
  return supabase.auth.getSession();
}
