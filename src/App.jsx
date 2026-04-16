import { useEffect, useMemo, useState } from "react";
import { AuthForm } from "./components/Auth/AuthForm";
import { ConfirmDialog } from "./components/Feedback/ConfirmDialog";
import { FeedbackMessage } from "./components/Feedback/FeedbackMessage";
import { HistoryFilter } from "./components/History/HistoryFilter";
import { HistoryList } from "./components/History/HistoryList";
import { WeeklyDietTracker } from "./components/Diet/WeeklyDietTracker";
import { Header } from "./components/Layout/Header";
import { PageShell } from "./components/Layout/PageShell";
import { WorkoutSection } from "./components/Workout/WorkoutSection";
import { useAuth } from "./hooks/useAuth";
import { useFeedback } from "./hooks/useFeedback";
import { useWorkoutState } from "./hooks/useWorkoutState";
import { getSupabaseClient } from "./lib/supabaseClient";
import { signInWithEmail, signOutUser, signUpWithEmail } from "./services/authService";
import { calculateDietDayTotals, calculatePlanTargets } from "./services/calculationService";
import { getDoneCount, getTotalCount } from "./services/exerciseService";
import { searchFoodsFromApi } from "./services/foodService";
import { makeExerciseKey } from "./utils/keys";
import { sanitizeNumericInput } from "./utils/validators";

const supabase = getSupabaseClient();
const weekDays = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];

function sortHistory(history, historyFilter) {
  const filtered = historyFilter === "todos"
    ? history
    : history.filter((item) => item.workout === historyFilter);

  return [...filtered].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
}

function getWeekDayKey(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  const map = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  return map[date.getDay()];
}

export default function App() {
  const { feedback, confirmState, showFeedback, clearFeedback, requestConfirm, closeConfirm } = useFeedback();
  const { currentUser, setCurrentUser, authReady } = useAuth(supabase);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [historyFilter, setHistoryFilter] = useState("todos");
  const [bodyWeightDraft, setBodyWeightDraft] = useState("");
  const [expandMode, setExpandMode] = useState("first");
  const [showAccountScreen, setShowAccountScreen] = useState(false);
  const [activeScreen, setActiveScreen] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState([]);
  const [foodLoading, setFoodLoading] = useState(false);

  const {
    workouts,
    workoutMap,
    state,
    onlyPendingMode,
    setOnlyPendingMode,
    syncStatus,
    busyAction,
    handleToggleExercise,
    handleUsedWeightChange,
    completeWorkout,
    saveBodyWeight,
    deleteBodyWeightEntry,
    updateDailyStatus,
    saveSync,
    refreshSync,
    clearHistory,
    clearChecks,
    clearAllData,
    importBackup,
    exportBackup,
    createWorkout,
    renameWorkout,
    deleteWorkout,
    addExercise,
    updateExerciseDefinition,
    deleteExercise,
    reorderExercise,
    updatePlanParameters,
    addFood,
    updateFood,
    deleteFood,
    addDietMeal,
    updateDietMeal,
    deleteDietMeal,
    toggleDietMealCheck
  } = useWorkoutState({ supabase, currentUser, showFeedback });

  const doneCount = useMemo(() => getDoneCount(state.exercises), [state.exercises]);
  const totalCount = useMemo(() => getTotalCount(state.exercises), [state.exercises]);
  const filteredHistory = useMemo(() => sortHistory(state.history || [], historyFilter), [state.history, historyFilter]);
  const bodyWeightHistory = useMemo(() => [...(state.bodyWeightHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date)), [state.bodyWeightHistory]);
  const workoutNames = workouts.map((workout) => workout.name);

  const todayDayKey = getWeekDayKey(state.recordDate);
  const todayMeals = state.dietPlan?.[todayDayKey] || [];
  const todayDietTotals = useMemo(
    () => calculateDietDayTotals({ foods: state.foods, dayMeals: todayMeals }),
    [state.foods, todayMeals]
  );
  const planTargets = useMemo(
    () => calculatePlanTargets({ bodyWeight: state.bodyWeight, planParameters: state.planParameters }),
    [state.bodyWeight, state.planParameters]
  );
  const todayStatus = state.dailyStatus?.[state.recordDate] || { workoutDone: false, dietDone: false };

  useEffect(() => {
    if (activeScreen === "peso" || activeScreen === "parametros") {
      setBodyWeightDraft(String(state.bodyWeight ?? ""));
    }
  }, [activeScreen, state.bodyWeight]);

  useEffect(() => {
    let active = true;
    if (foodQuery.trim().length < 2) {
      setFoodResults([]);
      setFoodLoading(false);
      return;
    }

    setFoodLoading(true);
    const timeoutId = window.setTimeout(async () => {
      const results = await searchFoodsFromApi(foodQuery);
      if (!active) return;
      setFoodResults(results);
      setFoodLoading(false);
    }, 350);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [foodQuery]);

  function updateAuthForm(field, value) {
    setAuthForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSignUp() {
    if (!supabase) return showFeedback("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.", "error");
    if (!authForm.email.trim() || !authForm.password.trim()) return showFeedback("Preencha email e senha.", "error");

    const { error } = await signUpWithEmail(supabase, authForm.email.trim(), authForm.password.trim());
    if (error) return showFeedback(`Erro ao cadastrar: ${error.message}`, "error");
    showFeedback("Cadastro realizado. Agora faca login.", "success");
  }

  async function handleSignIn() {
    if (!supabase) return showFeedback("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.", "error");
    if (!authForm.email.trim() || !authForm.password.trim()) return showFeedback("Preencha email e senha.", "error");

    const { data, error } = await signInWithEmail(supabase, authForm.email.trim(), authForm.password.trim());
    if (error) return showFeedback(`Erro ao entrar: ${error.message}`, "error");

    setCurrentUser(data.user || null);
    showFeedback("Login realizado com sucesso.", "success");
  }

  async function handleSignOut() {
    if (!supabase) return setCurrentUser(null);
    const { error } = await signOutUser(supabase);
    if (error) return showFeedback(`Erro ao sair: ${error.message}`, "error");
    setCurrentUser(null);
    showFeedback("Voce saiu da conta.", "success");
  }

  async function handleExerciseWeightChange(exerciseKey, value) {
    const nextValue = sanitizeNumericInput(value);
    if (value !== "" && nextValue === null) return;
    await handleUsedWeightChange(exerciseKey, nextValue ?? "");
  }

  async function handleExerciseToggle(exerciseKey, checked) {
    const workoutName = state.exercises[exerciseKey]?.workout;
    const workout = workouts.find((item) => item.name === workoutName);

    const willCompleteWorkout = Boolean(
      checked &&
      workout &&
      workout.exercises.length &&
      workout.exercises.every((exercise) => {
        const key = makeExerciseKey(workout.name, exercise.name);
        return key === exerciseKey ? checked : state.exercises[key]?.checked;
      })
    );

    await handleToggleExercise(exerciseKey, checked);
    if (!willCompleteWorkout) return;

    const confirmed = await requestConfirm({
      title: "Concluir treino",
      message: `Todos os exercicios de "${workoutName}" foram marcados. Deseja concluir esse treino agora?`,
      confirmLabel: "Concluir treino"
    });

    if (confirmed) await completeWorkout(workoutName);
  }

  function handleBodyWeightInputChange(value) {
    const nextValue = sanitizeNumericInput(value);
    if (value !== "" && nextValue === null) return;
    setBodyWeightDraft(nextValue ?? "");
  }

  async function handleSaveBodyWeight() {
    const nextValue = sanitizeNumericInput(bodyWeightDraft);
    await saveBodyWeight(nextValue === null ? null : nextValue);
  }

  function handleNavigate(nextScreen) {
    setActiveScreen(nextScreen);
    setMenuOpen(false);
    if (nextScreen === "treinos") setOnlyPendingMode(false);
  }

  return (
    <PageShell>
      <Header
        activeScreen={activeScreen}
        busyAction={busyAction}
        currentUser={currentUser}
        menuOpen={menuOpen}
        onNavigate={handleNavigate}
        onOpenAccount={() => setShowAccountScreen(true)}
        onRefreshSync={refreshSync}
        onSaveSync={saveSync}
        syncStatus={syncStatus}
        onToggleMenu={() => setMenuOpen((current) => !current)}
      />

      {activeScreen === "home" ? (
        <section className="grid gap-4">
          <div className="panel p-4 sm:p-5 grid gap-3">
            <h2 className="text-lg font-semibold text-white">Execucao diaria ({state.recordDate})</h2>
            <p className="text-sm text-slate-400">
              Treino e dieta no mesmo lugar para acompanhar sua rotina sem perder contexto.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="panel flex items-center justify-between px-4 py-3 text-sm">
                <span>Treino do dia concluido</span>
                <input checked={!!todayStatus.workoutDone} type="checkbox" onChange={(event) => updateDailyStatus({ workoutDone: event.target.checked })} />
              </label>
              <label className="panel flex items-center justify-between px-4 py-3 text-sm">
                <span>Dieta do dia concluida</span>
                <input checked={!!todayStatus.dietDone} type="checkbox" onChange={(event) => updateDailyStatus({ dietDone: event.target.checked })} />
              </label>
            </div>
            <p className="text-sm text-slate-300">
              Hoje ({todayDayKey}): {Math.round(todayDietTotals.calories)} kcal • {Math.round(todayDietTotals.protein)}g P • {Math.round(todayDietTotals.carbs)}g C • {Math.round(todayDietTotals.fat)}g G
            </p>
          </div>

          <WorkoutSection
            busyAction={busyAction}
            expandMode={expandMode}
            onlyPendingMode={onlyPendingMode}
            state={state}
            workouts={workouts}
            workoutMap={workoutMap}
            onAddExercise={addExercise}
            onCreateWorkout={createWorkout}
            onDeleteExercise={(workoutName, exerciseName) => deleteExercise(workoutName, exerciseName, requestConfirm)}
            onDeleteWorkout={(workoutName) => deleteWorkout(workoutName, requestConfirm)}
            onCompleteWorkout={completeWorkout}
            onRenameWorkout={renameWorkout}
            onReorderExercise={reorderExercise}
            onToggleExercise={handleExerciseToggle}
            onUpdateExercise={updateExerciseDefinition}
            onSaveWeight={handleExerciseWeightChange}
          />

          <WeeklyDietTracker
            foods={state.foods}
            dietPlan={state.dietPlan}
            weeklyMealChecks={state.weeklyMealChecks}
            planTargets={planTargets}
            onToggleMealCheck={toggleDietMealCheck}
          />
        </section>
      ) : null}

      {activeScreen === "treinos" ? (
        <>
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary" onClick={() => setExpandMode("all")} type="button">Abrir todos</button>
            <button className="btn-secondary" onClick={() => setExpandMode("none")} type="button">Fechar todos</button>
            <button className="btn-secondary" onClick={() => setOnlyPendingMode(true)} type="button">So pendentes</button>
            <button className="btn-secondary" onClick={() => setOnlyPendingMode(false)} type="button">Mostrar todos</button>
            <button className="btn-primary" disabled={busyAction === "completeWorkout"} onClick={() => completeWorkout()} type="button">
              {busyAction === "completeWorkout" ? "Concluindo..." : "Concluir treino"}
            </button>
          </div>

          <WorkoutSection
            busyAction={busyAction}
            expandMode={expandMode}
            onlyPendingMode={onlyPendingMode}
            state={state}
            workouts={workouts}
            workoutMap={workoutMap}
            onAddExercise={addExercise}
            onCreateWorkout={createWorkout}
            onDeleteExercise={(workoutName, exerciseName) => deleteExercise(workoutName, exerciseName, requestConfirm)}
            onDeleteWorkout={(workoutName) => deleteWorkout(workoutName, requestConfirm)}
            onCompleteWorkout={completeWorkout}
            onRenameWorkout={renameWorkout}
            onReorderExercise={reorderExercise}
            onToggleExercise={handleExerciseToggle}
            onUpdateExercise={updateExerciseDefinition}
            onSaveWeight={handleExerciseWeightChange}
          />
        </>
      ) : null}

      {activeScreen === "historico" ? (
        <section className="grid gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid gap-4 sm:max-w-xs">
              <HistoryFilter options={workoutNames} value={historyFilter} onChange={setHistoryFilter} />
            </div>
            <button className="btn-secondary sm:w-fit" onClick={() => clearHistory(requestConfirm)} type="button">Limpar historico</button>
          </div>
          <HistoryList history={filteredHistory} />
        </section>
      ) : null}

      {activeScreen === "parametros" ? (
        <section className="grid gap-4">
          <div className="panel p-4 sm:p-5 grid gap-3">
            <h3 className="text-lg font-semibold">Parametros do plano</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Sexo
                <select className="input-base mt-1" value={state.planParameters.sex} onChange={(e) => updatePlanParameters({ sex: e.target.value })}>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                </select>
              </label>
              <label className="text-sm">Idade<input className="input-base mt-1" type="number" value={state.planParameters.age} onChange={(e) => updatePlanParameters({ age: Number(e.target.value) || 0 })} /></label>
              <label className="text-sm">Altura (cm)<input className="input-base mt-1" type="number" value={state.planParameters.heightCm} onChange={(e) => updatePlanParameters({ heightCm: Number(e.target.value) || 0 })} /></label>
              <label className="text-sm">Peso de referencia (kg)<input className="input-base mt-1" type="number" step="0.1" value={state.planParameters.weightKg} onChange={(e) => updatePlanParameters({ weightKg: Number(e.target.value) || 0 })} /></label>
              <label className="text-sm">Fator de atividade<input className="input-base mt-1" type="number" step="0.05" value={state.planParameters.activityFactor} onChange={(e) => updatePlanParameters({ activityFactor: Number(e.target.value) || 1 })} /></label>
              <label className="text-sm">Deficit (%)<input className="input-base mt-1" type="number" value={state.planParameters.deficitPercent} onChange={(e) => updatePlanParameters({ deficitPercent: Number(e.target.value) || 0 })} /></label>
              <label className="text-sm">Carbo alvo (g)<input className="input-base mt-1" type="number" value={state.planParameters.carbsTargetG} onChange={(e) => updatePlanParameters({ carbsTargetG: Number(e.target.value) || 0 })} /></label>
            </div>
            <p className="text-xs text-slate-400">Proteina alvo calculada automaticamente em 2,2 g/kg conforme o peso informado.</p>
          </div>

          <div className="panel p-4 sm:p-5 grid gap-3">
            <h4 className="font-semibold">Rotina diaria</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Acordar<input className="input-base mt-1" type="time" value={state.planParameters.wakeTime || ""} onChange={(e) => updatePlanParameters({ wakeTime: e.target.value })} /></label>
              <label className="text-sm">Treino/Caminhada<input className="input-base mt-1" type="time" value={state.planParameters.trainingTime || ""} onChange={(e) => updatePlanParameters({ trainingTime: e.target.value })} /></label>
              <label className="text-sm">Refeicao (OMAD)<input className="input-base mt-1" type="time" value={state.planParameters.mealTime || ""} onChange={(e) => updatePlanParameters({ mealTime: e.target.value })} /></label>
              <label className="text-sm">Dormir<input className="input-base mt-1" type="time" value={state.planParameters.sleepTime || ""} onChange={(e) => updatePlanParameters({ sleepTime: e.target.value })} /></label>
            </div>
          </div>

          <div className="panel p-4 sm:p-5 text-sm grid gap-2">
            <p>BMR (Mifflin-St Jeor): <b>{planTargets.bmr} kcal</b></p>
            <p>TDEE: <b>{planTargets.tdee} kcal</b></p>
            <p>Meta calorica: <b>{planTargets.targetCalories} kcal</b></p>
            <p>Proteina: <b>{planTargets.targetProtein} g</b> • Gordura: <b>{planTargets.targetFat} g</b> • Carbo: <b>{planTargets.targetCarbs} g</b></p>
          </div>
        </section>
      ) : null}

      {activeScreen === "dieta" ? (
        <section className="grid gap-4">
          <div className="panel p-4 sm:p-5 grid gap-3">
            <h3 className="text-lg font-semibold">Buscar alimentos (API)</h3>
            <input className="input-base" placeholder="Digite para buscar alimentos" value={foodQuery} onChange={(e) => setFoodQuery(e.target.value)} />
            <p className="text-xs text-slate-400">{foodLoading ? "Buscando..." : "Selecione da API ou cadastre manualmente"}</p>
            {!foodLoading && foodQuery.trim().length >= 2 && !foodResults.length ? (
              <p className="text-xs text-amber-300">API sem resposta no momento. Voce ainda pode cadastrar alimentos manualmente.</p>
            ) : null}
            <div className="grid gap-2">
              {foodResults.map((food) => (
                <button key={food.id} type="button" className="btn-secondary justify-between" onClick={() => addFood(food)}>
                  <span>{food.name}</span><span>{Math.round(food.calories)} kcal • {Math.round(food.protein)}g P</span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel p-4 sm:p-5 grid gap-3">
            <h3 className="text-lg font-semibold">Alimentos cadastrados</h3>
            {state.foods.map((food) => (
              <div key={food.id} className="grid gap-2 rounded-2xl border border-white/10 p-3">
                <input className="input-base" value={food.name} onChange={(e) => updateFood(food.id, { name: e.target.value })} />
                <div className="grid gap-2 sm:grid-cols-6">
                  <input className="input-base" type="number" value={food.protein} onChange={(e) => updateFood(food.id, { protein: e.target.value })} placeholder="Proteina" />
                  <input className="input-base" type="number" value={food.calories} onChange={(e) => updateFood(food.id, { calories: e.target.value })} placeholder="Calorias" />
                  <input className="input-base" type="number" value={food.carbs} onChange={(e) => updateFood(food.id, { carbs: e.target.value })} placeholder="Carbo" />
                  <input className="input-base" type="number" value={food.fat} onChange={(e) => updateFood(food.id, { fat: e.target.value })} placeholder="Gordura" />
                  <input className="input-base" type="number" value={food.servingSize || 100} onChange={(e) => updateFood(food.id, { servingSize: e.target.value })} placeholder="Base" />
                  <input className="input-base" value={food.servingUnit || "g"} onChange={(e) => updateFood(food.id, { servingUnit: e.target.value })} placeholder="Unidade" />
                </div>
                <button className="btn-danger sm:w-fit" type="button" onClick={() => deleteFood(food.id)}>Excluir alimento</button>
              </div>
            ))}
            <button className="btn-secondary sm:w-fit" type="button" onClick={() => addFood({ name: "Novo alimento", protein: 0, calories: 0, carbs: 0, fat: 0, servingSize: 100, servingUnit: "g", source: "manual" })}>Adicionar manual</button>
          </div>

          <div className="panel p-4 sm:p-5 grid gap-3">
            <h3 className="text-lg font-semibold">Planejamento semanal</h3>
            {weekDays.map((day) => (
              <div key={day} className="rounded-2xl border border-white/10 p-3 grid gap-2">
                <div className="flex items-center justify-between"><p className="font-medium capitalize">{day}</p><button className="btn-secondary" type="button" onClick={() => addDietMeal(day, { mealName: "Refeicao", foodId: state.foods[0]?.id || "", servings: 1 })}>Adicionar refeicao</button></div>
                {(state.dietPlan?.[day] || []).map((meal) => (
                  <div key={meal.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_180px_auto]">
                    <input className="input-base" value={meal.mealName} onChange={(e) => updateDietMeal(day, meal.id, { mealName: e.target.value })} />
                    <select className="input-base" value={meal.foodId} onChange={(e) => updateDietMeal(day, meal.id, { foodId: e.target.value })}>
                      <option value="">Selecione</option>
                      {state.foods.map((food) => <option key={food.id} value={food.id}>{food.name}</option>)}
                    </select>
                    <input className="input-base" type="number" step="0.1" value={meal.servings} onChange={(e) => updateDietMeal(day, meal.id, { servings: e.target.value })} placeholder="Qtde (base do alimento)" />
                    <button className="btn-danger" type="button" onClick={() => deleteDietMeal(day, meal.id)}>Excluir</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {activeScreen === "peso" ? (
        <section className="grid gap-4">
          <div className="panel px-4 py-4 sm:px-5">
            <div className="grid gap-4 sm:max-w-md">
              <label className="grid gap-2 text-sm text-slate-300">
                Peso corporal (kg)
                <input className="input-base" min="0" placeholder="Ex: 67.0" step="0.1" type="number" value={bodyWeightDraft} onChange={(event) => handleBodyWeightInputChange(event.target.value)} />
              </label>
              <button className="btn-primary sm:w-fit sm:min-w-[160px]" disabled={busyAction === "bodyWeight"} onClick={handleSaveBodyWeight} type="button">
                {busyAction === "bodyWeight" ? "Salvando..." : "Salvar peso corporal"}
              </button>
            </div>
          </div>

          <section className="grid gap-3">
            {bodyWeightHistory.length ? bodyWeightHistory.map((entry) => (
              <article key={entry.id} className="panel flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div><p className="text-lg font-semibold text-white">{entry.weight} kg</p><p className="text-sm text-slate-400">{entry.date}</p></div>
                <button className="btn-danger sm:w-fit" onClick={() => deleteBodyWeightEntry(entry.id, requestConfirm)} type="button">Excluir</button>
              </article>
            )) : <div className="panel px-4 py-8 text-center text-sm text-slate-400 sm:px-5">Nenhum peso corporal salvo ainda.</div>}
          </section>
        </section>
      ) : null}

      {activeScreen === "dados" ? (
        <section className="grid gap-4">
          <div className="panel px-4 py-4 sm:px-5">
            <div className="grid gap-3 sm:max-w-sm">
              <p className="text-sm text-slate-400">Concluidos: {doneCount} de {totalCount} exercicios</p>
              <button className="btn-secondary sm:w-fit" onClick={exportBackup} type="button">Exportar backup</button>
              <label className="btn-secondary cursor-pointer sm:w-fit">{busyAction === "import" ? "Importando..." : "Importar backup"}<input accept=".json,application/json" className="hidden" type="file" onChange={(event) => importBackup(event.target.files?.[0])} /></label>
              <button className="btn-secondary sm:w-fit" onClick={() => clearChecks(requestConfirm)} type="button">Desmarcar tudo</button>
              <button className="btn-danger sm:w-fit" onClick={() => clearAllData(requestConfirm)} type="button">Apagar tudo</button>
            </div>
          </div>
        </section>
      ) : null}

      {showAccountScreen ? (
        <AuthForm
          authForm={authForm}
          busyAction={busyAction}
          currentUser={currentUser}
          onChange={updateAuthForm}
          onClose={() => setShowAccountScreen(false)}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onSignUp={handleSignUp}
          supabaseReady={Boolean(supabase)}
        />
      ) : null}

      <footer className="px-1 pb-4 text-center text-sm leading-6 text-slate-500">{!authReady ? "Verificando sessao..." : ""}</footer>

      <FeedbackMessage feedback={feedback} onClose={clearFeedback} />
      <ConfirmDialog confirmState={confirmState} onCancel={() => closeConfirm(false)} onConfirm={() => closeConfirm(true)} />
    </PageShell>
  );
}
