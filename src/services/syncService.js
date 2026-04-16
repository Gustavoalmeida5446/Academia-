import { mergeState } from "./workoutService";

async function upsertAppState({ supabase, currentUser, state }) {
  return supabase.from("app_state").upsert(
    {
      user_id: currentUser.id,
      state,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id" }
  );
}

export async function syncExerciseToSupabase({
  supabase,
  currentUser,
  state
}) {
  if (!supabase || !currentUser) return;
  return upsertAppState({ supabase, currentUser, state });
}

export async function syncAllStateToSupabase({
  supabase,
  currentUser,
  state
}) {
  if (!supabase || !currentUser) return;
  return upsertAppState({ supabase, currentUser, state });
}

export async function syncHistoryEntryToSupabase({ supabase, currentUser, state }) {
  if (!supabase || !currentUser) return;
  return upsertAppState({ supabase, currentUser, state });
}

export async function saveDailyStatusToSupabase({ supabase, currentUser, recordDate, status }) {
  if (!supabase || !currentUser) return;

  return supabase.from("daily_logs").upsert(
    {
      user_id: currentUser.id,
      record_date: recordDate,
      workout_done: !!status?.workoutDone,
      diet_done: !!status?.dietDone,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,record_date" }
  );
}

export async function loadStateFromSupabase({ supabase, currentUser, currentState }) {
  if (!supabase || !currentUser) {
    return mergeState(currentState);
  }

  const stateResponse = await supabase
    .from("app_state")
    .select("state")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (stateResponse.error) {
    throw stateResponse.error;
  }

  const logsResponse = await supabase
    .from("daily_logs")
    .select("record_date, workout_done, diet_done")
    .eq("user_id", currentUser.id);

  if (logsResponse.error) {
    throw logsResponse.error;
  }

  const merged = mergeState(stateResponse.data?.state || currentState);

  const cloudDailyStatus = Object.fromEntries(
    (logsResponse.data || []).map((row) => [
      row.record_date,
      { workoutDone: !!row.workout_done, dietDone: !!row.diet_done }
    ])
  );

  return mergeState({
    ...merged,
    dailyStatus: {
      ...(merged.dailyStatus || {}),
      ...cloudDailyStatus
    }
  });
}
