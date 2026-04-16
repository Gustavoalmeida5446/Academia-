export const defaultPlanParameters = {
  goal: "ganho_massa",
  age: 30,
  heightCm: 175,
  activityFactor: 1.55,
  adjustmentCalories: 250,
  proteinPerKg: 2,
  fatPerKg: 0.8,
  workoutDays: ["segunda", "terca", "quarta", "quinta", "sexta"]
};

export const defaultFoods = [
  { id: "food-frango", name: "Peito de frango", protein: 31, calories: 165, carbs: 0, fat: 3.6, source: "manual" },
  { id: "food-arroz", name: "Arroz cozido", protein: 2.7, calories: 130, carbs: 28, fat: 0.3, source: "manual" },
  { id: "food-ovo", name: "Ovo inteiro", protein: 13, calories: 155, carbs: 1.1, fat: 11, source: "manual" },
  { id: "food-aveia", name: "Aveia", protein: 13.5, calories: 389, carbs: 66, fat: 6.9, source: "manual" }
];

export const defaultDietPlan = {
  segunda: [
    { id: "meal-1", mealName: "Cafe da manha", foodId: "food-aveia", servings: 0.8 },
    { id: "meal-2", mealName: "Almoco", foodId: "food-frango", servings: 1.5 },
    { id: "meal-3", mealName: "Jantar", foodId: "food-arroz", servings: 2 }
  ],
  terca: [],
  quarta: [],
  quinta: [],
  sexta: [],
  sabado: [],
  domingo: []
};
