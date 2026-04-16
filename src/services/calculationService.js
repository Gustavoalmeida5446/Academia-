function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function getBodyWeight({ bodyWeight, planParameters }) {
  const stateWeight = Number(bodyWeight) || 0;
  if (stateWeight > 0) return stateWeight;
  return Number(planParameters?.weightKg) || 0;
}

export function calculatePlanTargets({ bodyWeight, planParameters }) {
  const weight = getBodyWeight({ bodyWeight, planParameters });
  const age = Number(planParameters?.age) || 0;
  const height = Number(planParameters?.heightCm) || 0;
  const sex = String(planParameters?.sex || "male").toLowerCase();
  const activityFactor = Number(planParameters?.activityFactor) || 1;
  const deficitPercent = Number(planParameters?.deficitPercent) || 0;
  const carbsTargetG = Number(planParameters?.carbsTargetG) || 0;

  if (!weight || !age || !height) {
    return {
      bmr: 0,
      tdee: 0,
      targetCalories: 0,
      targetProtein: 0,
      targetCarbs: 0,
      targetFat: 0
    };
  }

  const sexOffset = sex === "female" ? -161 : 5;
  const bmr = 10 * weight + 6.25 * height - 5 * age + sexOffset;
  const tdee = bmr * activityFactor;
  const targetCalories = tdee * (1 - deficitPercent / 100);

  const targetProtein = weight * 2.2;
  const targetCarbs = carbsTargetG > 0 ? carbsTargetG : 25;
  const proteinCalories = targetProtein * 4;
  const carbsCalories = targetCarbs * 4;
  const remainingCalories = Math.max(0, targetCalories - proteinCalories - carbsCalories);
  const targetFat = remainingCalories / 9;

  return {
    bmr: round(bmr),
    tdee: round(tdee),
    targetCalories: round(targetCalories),
    targetProtein: round(targetProtein),
    targetCarbs: round(targetCarbs),
    targetFat: round(targetFat)
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
