export const defaultPlanParameters = {
  sex: "male",
  age: 38,
  heightCm: 171,
  weightKg: 67,
  activityFactor: 1.5,
  deficitPercent: 20,
  proteinTargetG: 147,
  carbsTargetG: 25,
  wakeTime: "06:30",
  trainingTime: "15:00",
  mealTime: "19:00",
  sleepTime: "22:30"
};

export const defaultFoods = [
  { id: "food-lombo", name: "Lombo suino cozido", protein: 27, fat: 10, carbs: 0, calories: 210, servingSize: 100, servingUnit: "g", source: "manual" },
  { id: "food-frango", name: "Peito de frango cozido", protein: 31, fat: 3.6, carbs: 0, calories: 165, servingSize: 100, servingUnit: "g", source: "manual" },
  { id: "food-pernil", name: "Pernil suino cozido", protein: 27, fat: 12, carbs: 0, calories: 228, servingSize: 100, servingUnit: "g", source: "manual" },
  { id: "food-tilapia", name: "Tilapia cozida", protein: 26, fat: 3, carbs: 0, calories: 129, servingSize: 100, servingUnit: "g", source: "manual" },
  { id: "food-bisteca", name: "Bisteca suina cozida", protein: 25, fat: 17, carbs: 0, calories: 257, servingSize: 100, servingUnit: "g", source: "manual" },
  { id: "food-acem", name: "Acem/Musculo bovino", protein: 26, fat: 15, carbs: 0, calories: 247, servingSize: 100, servingUnit: "g", source: "manual" },
  { id: "food-ovo", name: "Ovo", protein: 6.3, fat: 5.3, carbs: 0.4, calories: 72, servingSize: 1, servingUnit: "un", source: "manual" },
  { id: "food-manteiga", name: "Manteiga", protein: 0, fat: 81, carbs: 0, calories: 717, servingSize: 100, servingUnit: "g", source: "manual" },
  { id: "food-banha", name: "Banha", protein: 0, fat: 100, carbs: 0, calories: 900, servingSize: 100, servingUnit: "g", source: "manual" },
  { id: "food-azeite", name: "Azeite", protein: 0, fat: 100, carbs: 0, calories: 900, servingSize: 100, servingUnit: "g", source: "manual" }
];

export const defaultDietPlan = {
  segunda: [
    { id: "meal-seg-1", mealName: "Lombo", foodId: "food-lombo", servings: 5 },
    { id: "meal-seg-2", mealName: "Ovos", foodId: "food-ovo", servings: 4 },
    { id: "meal-seg-3", mealName: "Manteiga", foodId: "food-manteiga", servings: 0.15 }
  ],
  terca: [
    { id: "meal-ter-1", mealName: "Frango", foodId: "food-frango", servings: 4 },
    { id: "meal-ter-2", mealName: "Ovos", foodId: "food-ovo", servings: 4 },
    { id: "meal-ter-3", mealName: "Azeite", foodId: "food-azeite", servings: 0.1 }
  ],
  quarta: [
    { id: "meal-qua-1", mealName: "Pernil", foodId: "food-pernil", servings: 5 },
    { id: "meal-qua-2", mealName: "Ovos", foodId: "food-ovo", servings: 3 },
    { id: "meal-qua-3", mealName: "Banha", foodId: "food-banha", servings: 0.15 }
  ],
  quinta: [
    { id: "meal-qui-1", mealName: "Frango", foodId: "food-frango", servings: 4 },
    { id: "meal-qui-2", mealName: "Ovos", foodId: "food-ovo", servings: 4 },
    { id: "meal-qui-3", mealName: "Manteiga", foodId: "food-manteiga", servings: 0.15 }
  ],
  sexta: [
    { id: "meal-sex-1", mealName: "Tilapia", foodId: "food-tilapia", servings: 5 },
    { id: "meal-sex-2", mealName: "Ovos", foodId: "food-ovo", servings: 5 },
    { id: "meal-sex-3", mealName: "Azeite", foodId: "food-azeite", servings: 0.1 }
  ],
  sabado: [
    { id: "meal-sab-1", mealName: "Bisteca", foodId: "food-bisteca", servings: 6 },
    { id: "meal-sab-2", mealName: "Ovos", foodId: "food-ovo", servings: 3 },
    { id: "meal-sab-3", mealName: "Banha", foodId: "food-banha", servings: 0.15 }
  ],
  domingo: [
    { id: "meal-dom-1", mealName: "Acem", foodId: "food-acem", servings: 5 },
    { id: "meal-dom-2", mealName: "Ovos", foodId: "food-ovo", servings: 4 }
  ]
};
