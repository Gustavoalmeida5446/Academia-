import { mergeState } from "./workoutService";

const DAY_KEYS = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];

async function replaceRows({ supabase, table, userId, rows }) {
  const { error: deleteError } = await supabase.from(table).delete().eq("user_id", userId);
  if (deleteError) throw deleteError;

  if (!rows.length) return;

  const { error: insertError } = await supabase.from(table).insert(rows);
  if (insertError) throw insertError;
}

function mapStateToRows({ userId, state }) {
  const now = new Date().toISOString();

  const workoutRows = [];
  const exerciseRows = [];

  (state.workouts || []).forEach((workout, workoutIndex) => {
    const workoutId = crypto.randomUUID();

    workoutRows.push({
      id: workoutId,
      user_id: userId,
      name: workout.name,
      sort_order: workoutIndex,
      updated_at: now
    });

    (workout.exercises || []).forEach((exercise, exerciseIndex) => {
      exerciseRows.push({
        id: crypto.randomUUID(),
        user_id: userId,
        workout_id: workoutId,
        name: exercise.name,
        sets: exercise.sets || "",
        reps: exercise.reps || "",
        video_query: exercise.videoQuery || "",
        muscle_group: exercise.muscleGroup || "",
        media_url: exercise.mediaUrl || "",
        external_id: exercise.externalId || "",
        sort_order: exerciseIndex,
        updated_at: now
      });
    });
  });

  const exerciseStateRows = Object.values(state.exercises || {}).map((item) => ({
    id: crypto.randomUUID(),
    user_id: userId,
    workout_name: item.workout,
    exercise_name: item.exercise,
    checked: !!item.checked,
    used_weight: item.usedWeight === "" ? null : Number(item.usedWeight),
    updated_at: item.updatedAt || now
  }));

  const historyRows = (state.history || []).map((entry) => ({
    id: crypto.randomUUID(),
    user_id: userId,
    workout_name: entry.workout,
    record_date: entry.recordDate,
    body_weight: entry.bodyWeight === "" ? null : Number(entry.bodyWeight),
    completed_at: entry.completedAt || now,
    exercises: Array.isArray(entry.exercises) ? entry.exercises : []
  }));

  const bodyWeightRows = (state.bodyWeightHistory || []).map((entry) => ({
    id: crypto.randomUUID(),
    user_id: userId,
    record_date: entry.date,
    weight: Number(entry.weight),
    created_at: entry.createdAt || now
  }));

  const dailyRows = Object.entries(state.dailyStatus || {}).map(([recordDate, status]) => ({
    user_id: userId,
    record_date: recordDate,
    workout_done: !!status?.workoutDone,
    diet_done: !!status?.dietDone,
    updated_at: now
  }));

  const foodsRows = (state.foods || []).map((food, index) => ({
    id: food.id || crypto.randomUUID(),
    user_id: userId,
    external_id: food.externalId || "",
    name: food.name,
    protein: Number(food.protein) || 0,
    calories: Number(food.calories) || 0,
    carbs: Number(food.carbs) || 0,
    fat: Number(food.fat) || 0,
    serving_size: Number(food.servingSize) || 100,
    serving_unit: food.servingUnit || "g",
    source: food.source || "manual",
    sort_order: index
  }));

  const dietRows = DAY_KEYS.flatMap((dayKey) =>
    (state.dietPlan?.[dayKey] || []).map((meal, index) => ({
      id: meal.id || crypto.randomUUID(),
      user_id: userId,
      day_key: dayKey,
      meal_name: meal.mealName || "Refeicao",
      food_id: meal.foodId || "",
      servings: Number(meal.servings) || 1,
      sort_order: index
    }))
  );

  const parametersRows = [
    {
      user_id: userId,
      sex: state.planParameters?.sex || "male",
      age: Number(state.planParameters?.age) || 0,
      height_cm: Number(state.planParameters?.heightCm) || 0,
      weight_kg: Number(state.planParameters?.weightKg) || 0,
      activity_factor: Number(state.planParameters?.activityFactor) || 1,
      deficit_percent: Number(state.planParameters?.deficitPercent) || 0,
      protein_target_g: Number(state.planParameters?.proteinTargetG) || 0,
      carbs_target_g: Number(state.planParameters?.carbsTargetG) || 0,
      wake_time: state.planParameters?.wakeTime || "",
      training_time: state.planParameters?.trainingTime || "",
      meal_time: state.planParameters?.mealTime || "",
      sleep_time: state.planParameters?.sleepTime || "",
      updated_at: now
    }
  ];

  return {
    workoutRows,
    exerciseRows,
    exerciseStateRows,
    historyRows,
    bodyWeightRows,
    dailyRows,
    foodsRows,
    dietRows,
    parametersRows
  };
}

async function saveNormalizedState({ supabase, currentUser, state }) {
  const rows = mapStateToRows({ userId: currentUser.id, state });

  await replaceRows({ supabase, table: "workouts", userId: currentUser.id, rows: rows.workoutRows });
  await replaceRows({ supabase, table: "exercises", userId: currentUser.id, rows: rows.exerciseRows });
  await replaceRows({ supabase, table: "exercise_state", userId: currentUser.id, rows: rows.exerciseStateRows });
  await replaceRows({ supabase, table: "workout_history", userId: currentUser.id, rows: rows.historyRows });
  await replaceRows({ supabase, table: "body_weight_entries", userId: currentUser.id, rows: rows.bodyWeightRows });
  await replaceRows({ supabase, table: "daily_logs", userId: currentUser.id, rows: rows.dailyRows });
  await replaceRows({ supabase, table: "foods", userId: currentUser.id, rows: rows.foodsRows });
  await replaceRows({ supabase, table: "diet_meals", userId: currentUser.id, rows: rows.dietRows });
  await replaceRows({ supabase, table: "plan_parameters", userId: currentUser.id, rows: rows.parametersRows });
}

function buildStateFromRows({
  currentState,
  workouts,
  exercises,
  exerciseState,
  history,
  bodyWeight,
  dailyLogs,
  foods,
  dietMeals,
  planParameters
}) {
  const stateWorkouts = (workouts || []).map((workout) => ({
    name: workout.name,
    exercises: (exercises || [])
      .filter((exercise) => exercise.workout_id === workout.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((exercise) => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        videoQuery: exercise.video_query,
        muscleGroup: exercise.muscle_group,
        mediaUrl: exercise.media_url,
        externalId: exercise.external_id
      }))
  }));

  const exercisesStateMap = Object.fromEntries(
    (exerciseState || []).map((item) => {
      const key = `${item.workout_name}::${item.exercise_name}`;
      return [
        key,
        {
          workout: item.workout_name,
          exercise: item.exercise_name,
          checked: !!item.checked,
          usedWeight: item.used_weight ?? "",
          updatedAt: item.updated_at || ""
        }
      ];
    })
  );

  const historyRows = (history || []).map((entry) => ({
    workout: entry.workout_name,
    recordDate: entry.record_date,
    bodyWeight: entry.body_weight ?? "",
    completedAt: entry.completed_at,
    exercises: Array.isArray(entry.exercises) ? entry.exercises : []
  }));

  const bodyWeightRows = (bodyWeight || [])
    .map((entry) => ({
      id: entry.id,
      date: entry.record_date,
      weight: entry.weight,
      createdAt: entry.created_at || ""
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const dailyStatus = Object.fromEntries(
    (dailyLogs || []).map((item) => [
      item.record_date,
      { workoutDone: !!item.workout_done, dietDone: !!item.diet_done }
    ])
  );

  const foodsRows = (foods || []).map((food) => ({
    id: food.id,
    externalId: food.external_id || "",
    name: food.name,
    protein: food.protein,
    calories: food.calories,
    carbs: food.carbs,
    fat: food.fat,
    servingSize: food.serving_size,
    servingUnit: food.serving_unit,
    source: food.source
  }));

  const dietPlan = Object.fromEntries(
    DAY_KEYS.map((dayKey) => [
      dayKey,
      (dietMeals || [])
        .filter((item) => item.day_key === dayKey)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => ({
          id: item.id,
          mealName: item.meal_name,
          foodId: item.food_id,
          servings: item.servings
        }))
    ])
  );

  const params = planParameters || null;

  return mergeState({
    ...currentState,
    workouts: stateWorkouts,
    exercises: exercisesStateMap,
    history: historyRows,
    bodyWeightHistory: bodyWeightRows,
    bodyWeight: bodyWeightRows[0]?.weight ?? currentState.bodyWeight,
    dailyStatus,
    foods: foodsRows,
    dietPlan,
    planParameters: params
      ? {
          sex: params.sex,
          age: params.age,
          heightCm: params.height_cm,
          weightKg: params.weight_kg,
          activityFactor: params.activity_factor,
          deficitPercent: params.deficit_percent,
          proteinTargetG: params.protein_target_g,
          carbsTargetG: params.carbs_target_g,
          wakeTime: params.wake_time,
          trainingTime: params.training_time,
          mealTime: params.meal_time,
          sleepTime: params.sleep_time
        }
      : currentState.planParameters
  });
}

export async function syncExerciseToSupabase({ supabase, currentUser, state }) {
  if (!supabase || !currentUser) return;

  const updates = Object.values(state.exercises || {}).map((item) => ({
    user_id: currentUser.id,
    workout_name: item.workout,
    exercise_name: item.exercise,
    checked: !!item.checked,
    used_weight: item.usedWeight === "" ? null : Number(item.usedWeight),
    updated_at: item.updatedAt || new Date().toISOString()
  }));

  if (!updates.length) return;

  return supabase
    .from("exercise_state")
    .upsert(updates, { onConflict: "user_id,workout_name,exercise_name" });
}

export async function syncAllStateToSupabase({ supabase, currentUser, state }) {
  if (!supabase || !currentUser) return;
  return saveNormalizedState({ supabase, currentUser, state });
}

export async function syncHistoryEntryToSupabase({ supabase, currentUser, state }) {
  if (!supabase || !currentUser) return;
  return saveNormalizedState({ supabase, currentUser, state });
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

  const [
    workoutsResponse,
    exercisesResponse,
    exerciseStateResponse,
    historyResponse,
    bodyWeightResponse,
    dailyLogsResponse,
    foodsResponse,
    dietMealsResponse,
    planParametersResponse
  ] = await Promise.all([
    supabase.from("workouts").select("id,name,sort_order").eq("user_id", currentUser.id).order("sort_order", { ascending: true }),
    supabase.from("exercises").select("workout_id,name,sets,reps,video_query,muscle_group,media_url,external_id,sort_order").eq("user_id", currentUser.id),
    supabase.from("exercise_state").select("workout_name,exercise_name,checked,used_weight,updated_at").eq("user_id", currentUser.id),
    supabase.from("workout_history").select("workout_name,record_date,body_weight,completed_at,exercises").eq("user_id", currentUser.id),
    supabase.from("body_weight_entries").select("id,record_date,weight,created_at").eq("user_id", currentUser.id),
    supabase.from("daily_logs").select("record_date,workout_done,diet_done").eq("user_id", currentUser.id),
    supabase.from("foods").select("id,external_id,name,protein,calories,carbs,fat,serving_size,serving_unit,source,sort_order").eq("user_id", currentUser.id).order("sort_order", { ascending: true }),
    supabase.from("diet_meals").select("id,day_key,meal_name,food_id,servings,sort_order").eq("user_id", currentUser.id),
    supabase.from("plan_parameters").select("sex,age,height_cm,weight_kg,activity_factor,deficit_percent,protein_target_g,carbs_target_g,wake_time,training_time,meal_time,sleep_time").eq("user_id", currentUser.id).maybeSingle()
  ]);

  const responses = [
    workoutsResponse,
    exercisesResponse,
    exerciseStateResponse,
    historyResponse,
    bodyWeightResponse,
    dailyLogsResponse,
    foodsResponse,
    dietMealsResponse,
    planParametersResponse
  ];

  const failed = responses.find((response) => response.error);
  if (failed) throw failed.error;

  return buildStateFromRows({
    currentState,
    workouts: workoutsResponse.data,
    exercises: exercisesResponse.data,
    exerciseState: exerciseStateResponse.data,
    history: historyResponse.data,
    bodyWeight: bodyWeightResponse.data,
    dailyLogs: dailyLogsResponse.data,
    foods: foodsResponse.data,
    dietMeals: dietMealsResponse.data,
    planParameters: planParametersResponse.data
  });
}
