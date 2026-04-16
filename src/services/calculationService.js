const GOAL_MULTIPLIER = {
  ganho_massa: 1,
  manutencao: 0,
  perda_gordura: -1
};

export function calculatePlanTargets({ bodyWeight, planParameters }) {
  const weight = Number(bodyWeight) || 0;
  const age = Number(planParameters.age) || 0;
  const height = Number(planParameters.heightCm) || 0;
  const activityFactor = Number(planParameters.activityFactor) || 1;
  const adjustment = Number(planParameters.adjustmentCalories) || 0;
  const proteinPerKg = Number(planParameters.proteinPerKg) || 0;
  const fatPerKg = Number(planParameters.fatPerKg) || 0;
  const goalDirection = GOAL_MULTIPLIER[planParameters.goal] ?? 0;

  if (!weight || !age || !height) {
    return {
      maintenanceCalories: 0,
      targetCalories: 0,
      targetProtein: 0,
      targetFat: 0,
      targetCarbs: 0
    };
  }

  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const maintenanceCalories = Math.round(bmr * activityFactor);
  const targetCalories = Math.round(maintenanceCalories + adjustment * goalDirection);
  const targetProtein = Math.round(weight * proteinPerKg);
  const targetFat = Math.round(weight * fatPerKg);
  const caloriesFromProteinAndFat = targetProtein * 4 + targetFat * 9;
  const targetCarbs = Math.max(0, Math.round((targetCalories - caloriesFromProteinAndFat) / 4));

  return {
    maintenanceCalories,
    targetCalories,
    targetProtein,
    targetFat,
    targetCarbs
  };
}

export function calculateDietDayTotals({ foods, dayMeals }) {
  const foodsMap = Object.fromEntries((foods || []).map((item) => [item.id, item]));

  return (dayMeals || []).reduce(
    (totals, meal) => {
      const food = foodsMap[meal.foodId];
      if (!food) return totals;
      const servings = Number(meal.servings) || 0;

      return {
        calories: totals.calories + (Number(food.calories) || 0) * servings,
        protein: totals.protein + (Number(food.protein) || 0) * servings,
        carbs: totals.carbs + (Number(food.carbs) || 0) * servings,
        fat: totals.fat + (Number(food.fat) || 0) * servings
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
