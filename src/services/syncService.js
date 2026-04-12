import { createDefaultState, mergeState, rebuildExerciseState } from "./workoutService";
import { normalizeHistoryEntries } from "./historyService";
import { makeExerciseKey } from "../utils/keys";
import { todayString } from "../utils/date";

function shouldSyncExercise(item, includeEmpty = false) {
  if (!item) return false;
  return includeEmpty || !!item.checked || item.usedWeight !== "" || !!item.updatedAt;
}

export async function syncExerciseToSupabase({
  supabase,
  currentUser,
  state,
  exerciseKey,
  includeEmpty = false
}) {
  if (!supabase || !currentUser) return;

  const item = state.exercises[exerciseKey];
  if (!shouldSyncExercise(item, includeEmpty)) return;

  const payload = {
    user_id: currentUser.id,
    workout: item.workout,
    exercise: item.exercise,
    used_weight: item.usedWeight === "" ? null : Number(item.usedWeight),
    done: !!item.checked,
    body_weight: state.bodyWeight === "" ? null : Number(state.bodyWeight),
    record_date: state.recordDate,
    updated_at: new Date().toISOString()
  };

  return supabase.from("workout_logs").upsert(payload, {
    onConflict: "user_id,workout,exercise,record_date"
  });
}

export async function syncAllStateToSupabase({
  supabase,
  currentUser,
  state,
  includeEmpty = false
}) {
  if (!supabase || !currentUser) return;

  for (const key of Object.keys(state.exercises)) {
    if (!shouldSyncExercise(state.exercises[key], includeEmpty)) continue;
    await syncExerciseToSupabase({
      supabase,
      currentUser,
      state,
      exerciseKey: key,
      includeEmpty
    });
  }
}

export async function syncHistoryEntryToSupabase({ supabase, currentUser, entry }) {
  if (!supabase || !currentUser) return;

  const rows = (entry.exercises || []).map((item) => ({
    user_id: currentUser.id,
    workout: entry.workout,
    exercise: item.exercise,
    used_weight: item.usedWeight === "" ? null : Number(item.usedWeight),
    done: !!item.checked,
    body_weight: entry.bodyWeight === "" ? null : Number(entry.bodyWeight),
    record_date: entry.recordDate,
    updated_at: entry.completedAt
  }));

  if (!rows.length) return;

  return supabase.from("workout_logs").upsert(rows, {
    onConflict: "user_id,workout,exercise,record_date"
  });
}

export async function loadStateFromSupabase({ supabase, currentUser, currentState }) {
  if (!supabase || !currentUser) {
    return mergeState(currentState);
  }

  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    throw error || new Error("Nao foi possivel carregar os dados do Supabase.");
  }

  if (!data.length) {
    return mergeState(currentState);
  }

  const nextState = createDefaultState();
  const currentWorkouts = currentState?.workouts?.length ? currentState.workouts : nextState.workouts;
  nextState.workouts = currentWorkouts;
  nextState.exercises = rebuildExerciseState(currentWorkouts, currentState?.exercises || {});
  const historyMap = new Map();
  const preferredRecordDate = currentState?.recordDate || todayString();
  const availableDates = new Set(data.map((row) => row.record_date).filter(Boolean));
  const latestRecordDate = data.find((row) => row.record_date)?.record_date || preferredRecordDate;
  const activeRecordDate = availableDates.has(preferredRecordDate)
    ? preferredRecordDate
    : latestRecordDate;

  nextState.recordDate = activeRecordDate;

  data.forEach((row) => {
    const key = makeExerciseKey(row.workout, row.exercise);

    if (nextState.exercises[key] && row.record_date === activeRecordDate) {
      nextState.exercises[key].checked = !!row.done;
      nextState.exercises[key].usedWeight = row.used_weight ?? "";
      nextState.exercises[key].updatedAt = row.updated_at || "";
    }

    if (row.body_weight !== null && row.body_weight !== undefined) {
      if (
        row.record_date === activeRecordDate ||
        (!nextState.bodyWeightDate || row.record_date >= nextState.bodyWeightDate)
      ) {
        nextState.bodyWeight = row.body_weight;
        nextState.bodyWeightDate = row.record_date || nextState.bodyWeightDate;
      }
    }

    if (row.updated_at) {
      if (!nextState.lastUpdate || new Date(row.updated_at) > new Date(nextState.lastUpdate)) {
        nextState.lastUpdate = row.updated_at;
      }
    }

    const historyKey = `${row.workout}__${row.record_date}`;

    if (!historyMap.has(historyKey)) {
      historyMap.set(historyKey, {
        workout: row.workout,
        recordDate: row.record_date,
        bodyWeight: row.body_weight ?? "",
        completedAt: row.updated_at || "",
        exercises: []
      });
    }

    historyMap.get(historyKey).exercises.push({
      exercise: row.exercise,
      usedWeight: row.used_weight ?? "",
      checked: !!row.done
    });
  });

  nextState.history = normalizeHistoryEntries(Array.from(historyMap.values()));

  return mergeState(nextState);
}
