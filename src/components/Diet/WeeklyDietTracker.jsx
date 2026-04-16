import { useMemo, useState } from "react";
import { calculateDietDayTotals } from "../../services/calculationService";

const weekDays = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];

export function WeeklyDietTracker({
  foods,
  dietPlan,
  weeklyMealChecks,
  planTargets,
  onToggleMealCheck
}) {
  const [openDay, setOpenDay] = useState("segunda");

  const weekSummary = useMemo(() => {
    const dayTotals = weekDays.map((dayKey) =>
      calculateDietDayTotals({
        foods,
        dayMeals: dietPlan?.[dayKey] || []
      })
    );

    const total = dayTotals.reduce(
      (acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fat: acc.fat + day.fat
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      avgCalories: total.calories / weekDays.length,
      avgProtein: total.protein / weekDays.length,
      avgCarbs: total.carbs / weekDays.length,
      avgFat: total.fat / weekDays.length
    };
  }, [foods, dietPlan]);

  const shoppingSummary = useMemo(() => {
    const totalsByFood = {};

    weekDays.forEach((dayKey) => {
      (dietPlan?.[dayKey] || []).forEach((meal) => {
        if (!meal.foodId) return;

        totalsByFood[meal.foodId] = (totalsByFood[meal.foodId] || 0) + (Number(meal.servings) || 0);
      });
    });

    return Object.entries(totalsByFood)
      .map(([foodId, totalServings]) => {
        const food = foods.find((item) => item.id === foodId);
        return {
          foodId,
          name: food?.name || "Alimento removido",
          servingUnit: food?.servingUnit || "porcao",
          totalServings
        };
      })
      .sort((a, b) => b.totalServings - a.totalServings);
  }, [dietPlan, foods]);

  return (
    <section className="panel p-4 sm:p-5 grid gap-4">
      <div>
        <h3 className="text-lg font-semibold">Dieta semanal (OMAD)</h3>
        <p className="mt-1 text-sm text-slate-400">
          Expanda cada dia para marcar as refeicoes concluidas e comparar com as metas.
        </p>
      </div>

      <div className="grid gap-3">
        {weekDays.map((dayKey) => {
          const meals = dietPlan?.[dayKey] || [];
          const totals = calculateDietDayTotals({ foods, dayMeals: meals });
          const checkedMeals = meals.filter((meal) => weeklyMealChecks?.[dayKey]?.[meal.id]).length;
          const isOpen = openDay === dayKey;

          return (
            <article key={dayKey} className="rounded-2xl border border-white/10 bg-white/[0.03]">
              <button
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                onClick={() => setOpenDay((current) => (current === dayKey ? "" : dayKey))}
                type="button"
              >
                <div>
                  <p className="font-medium capitalize text-white">{dayKey}</p>
                  <p className="text-xs text-slate-400">
                    {checkedMeals}/{meals.length} refeicoes marcadas
                  </p>
                </div>
                <div className="text-right text-xs text-slate-300">
                  <p>{Math.round(totals.calories)} kcal</p>
                  <p>{Math.round(totals.protein)}g P • {Math.round(totals.carbs)}g C • {Math.round(totals.fat)}g G</p>
                </div>
              </button>

              {isOpen ? (
                <div className="border-t border-white/10 px-4 py-3 grid gap-2">
                  {meals.length ? meals.map((meal) => {
                    const food = foods.find((item) => item.id === meal.foodId);
                    const checked = !!weeklyMealChecks?.[dayKey]?.[meal.id];

                    return (
                      <label key={meal.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2 text-sm">
                        <div>
                          <p className="text-slate-100">{meal.mealName}</p>
                          <p className="text-xs text-slate-400">
                            {food?.name || "Alimento removido"} • {meal.servings} porcao
                            {meal.servings > 1 ? "es" : ""}
                          </p>
                        </div>
                        <input
                          checked={checked}
                          type="checkbox"
                          onChange={(event) => onToggleMealCheck(dayKey, meal.id, event.target.checked)}
                        />
                      </label>
                    );
                  }) : (
                    <p className="text-sm text-slate-400">Nenhuma refeicao planejada para este dia.</p>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300 grid gap-1">
        <p>Media semanal estimada: <b>{Math.round(weekSummary.avgCalories)} kcal</b></p>
        <p>
          Proteina <b>{Math.round(weekSummary.avgProtein)} g</b> • Carbo <b>{Math.round(weekSummary.avgCarbs)} g</b> • Gordura <b>{Math.round(weekSummary.avgFat)} g</b>
        </p>
        <p className="text-xs text-slate-400">
          Meta diaria: {Math.round(planTargets.targetCalories)} kcal • {Math.round(planTargets.targetProtein)}g P • {Math.round(planTargets.targetCarbs)}g C • {Math.round(planTargets.targetFat)}g G
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300 grid gap-2">
        <p className="font-medium text-white">Lista de compras (semana)</p>
        {shoppingSummary.length ? (
          <ul className="grid gap-1">
            {shoppingSummary.map((item) => (
              <li key={item.foodId} className="flex items-center justify-between gap-3">
                <span>{item.name}</span>
                <span className="text-slate-400">{item.totalServings.toFixed(2)} {item.servingUnit}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400">Adicione refeicoes no planejamento para gerar a lista automaticamente.</p>
        )}
      </div>
    </section>
  );
}
