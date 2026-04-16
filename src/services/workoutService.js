import { defaultWorkouts } from "../data/defaultWorkouts";
import {
  defaultDietPlan,
  defaultFoods,
  defaultPlanParameters
} from "../data/spreadsheetDefaults";
import { normalizeHistoryEntries } from "./historyService";
import { todayString } from "../utils/date";
import { makeExerciseKey } from "../utils/keys";
import { normalizeExercise } from "../utils/normalizeExercise";

function normalizeBodyWeightHistory(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      id: String(item?.id || `${item?.date || todayString()}-${item?.weight || ""}`),
      date: item?.date || "",
      weight: item?.weight ?? "",
      createdAt: item?.createdAt || ""
    }))
    .filter((item) => item.date && item.weight !== "" && item.weight !== null && item.weight !== undefined)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function normalizeFoods(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      id: item?.id || crypto.randomUUID(),
      externalId: item?.externalId || "",
      name: item?.name || "",
      protein: Number(item?.protein) || 0,
      calories: Number(item?.calories) || 0,
      carbs: Number(item?.carbs) || 0,
      fat: Number(item?.fat) || 0,
      servingSize: Number(item?.servingSize) || 100,
      servingUnit: item?.servingUnit || "g",
      source: item?.source || "manual"
    }))
    .filter((item) => item.name);
}

function normalizeDietPlan(plan) {
  const safePlan = plan || {};
  const dayKeys = Object.keys(defaultDietPlan);

  return Object.fromEntries(
    dayKeys.map((day) => [
      day,
      Array.isArray(safePlan[day])
        ? safePlan[day].map((meal) => ({
            id: meal?.id || crypto.randomUUID(),
            mealName: meal?.mealName || "Refeicao",
            foodId: meal?.foodId || "",
            servings: Number(meal?.servings) || 1
          }))
        : []
    ])
  );
}

function normalizePlanParameters(parameters) {
  return {
    ...defaultPlanParameters,
    ...(parameters || {}),
    age: Number(parameters?.age ?? defaultPlanParameters.age) || 0,
    heightCm: Number(parameters?.heightCm ?? defaultPlanParameters.heightCm) || 0,
    weightKg: Number(parameters?.weightKg ?? defaultPlanParameters.weightKg) || 0,
    activityFactor: Number(parameters?.activityFactor ?? defaultPlanParameters.activityFactor) || 1,
    deficitPercent: Number(parameters?.deficitPercent ?? defaultPlanParameters.deficitPercent) || 0,
    proteinTargetG: Number(parameters?.proteinTargetG ?? defaultPlanParameters.proteinTargetG) || 0,
    carbsTargetG: Number(parameters?.carbsTargetG ?? defaultPlanParameters.carbsTargetG) || 0
  };
}

export function normalizeWorkouts(workouts) {
  if (Array.isArray(workouts)) {
    return workouts
      .map((workout) => ({
        name: workout?.name || "",
        exercises: Array.isArray(workout?.exercises)
          ? workout.exercises.map(normalizeExercise)
          : []
      }))
      .filter((workout) => workout.name);
  }

  return Object.entries(workouts || {}).map(([name, exercises]) => ({
    name,
    exercises: Array.isArray(exercises) ? exercises.map(normalizeExercise) : []
  }));
}

export function createDefaultWorkouts() {
  return normalizeWorkouts(defaultWorkouts);
}

export function getWorkoutMap(workouts = createDefaultWorkouts()) {
  return Object.fromEntries(workouts.map((workout) => [workout.name, workout.exercises]));
}

export function createDefaultExerciseState(workouts = createDefaultWorkouts()) {
  const exercises = {};

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const normalized = normalizeExercise(exercise);
      const key = makeExerciseKey(workout.name, normalized.name);

      exercises[key] = {
        workout: workout.name,
        exercise: normalized.name,
        checked: false,
        usedWeight: "",
        updatedAt: ""
      };
    });
  });

  return exercises;
}

export function createDefaultState() {
  const workouts = createDefaultWorkouts();

  return {
    recordDate: todayString(),
    bodyWeight: defaultPlanParameters.weightKg,
    bodyWeightDate: "",
    bodyWeightHistory: [],
    lastUpdate: "",
    workouts,
    exercises: createDefaultExerciseState(workouts),
    history: [],
    dailyStatus: {},
    weeklyMealChecks: {},
    planParameters: normalizePlanParameters(defaultPlanParameters),
    foods: normalizeFoods(defaultFoods),
    dietPlan: normalizeDietPlan(defaultDietPlan)
  };
}

export function mergeState(saved) {
  const base = createDefaultState();
  const safeSaved = saved || {};
  const workouts = normalizeWorkouts(safeSaved.workouts || base.workouts);
  const exerciseBase = createDefaultExerciseState(workouts);

  return {
    ...base,
    ...safeSaved,
    workouts,
    recordDate: safeSaved.recordDate || safeSaved.bodyWeightDate || base.recordDate,
    exercises: {
      ...exerciseBase,
      ...(safeSaved.exercises || {})
    },
    bodyWeight: Number(safeSaved.bodyWeight ?? base.bodyWeight) || "",
    bodyWeightHistory: normalizeBodyWeightHistory(safeSaved.bodyWeightHistory),
    history: normalizeHistoryEntries(safeSaved.history),
    planParameters: normalizePlanParameters(safeSaved.planParameters),
    foods: normalizeFoods(safeSaved.foods || base.foods),
    dietPlan: normalizeDietPlan(safeSaved.dietPlan || base.dietPlan),
    dailyStatus: safeSaved.dailyStatus || {},
    weeklyMealChecks: safeSaved.weeklyMealChecks || {}
  };
}

export function rebuildExerciseState(workouts, currentExercises = {}) {
  const nextExercises = {};

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const key = makeExerciseKey(workout.name, exercise.name);
      const previous = currentExercises[key];

      nextExercises[key] = {
        workout: workout.name,
        exercise: exercise.name,
        checked: previous?.checked || false,
        usedWeight: previous?.usedWeight ?? "",
        updatedAt: previous?.updatedAt || ""
      };
    });
  });

  return nextExercises;
}

export function reorderItems(items, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}
