import { useMemo, useState } from "react";
import { AuthForm } from "./components/Auth/AuthForm";
import { FeedbackMessage } from "./components/Feedback/FeedbackMessage";
import { HistoryFilter } from "./components/History/HistoryFilter";
import { HistoryList } from "./components/History/HistoryList";
import { Header } from "./components/Layout/Header";
import { PageShell } from "./components/Layout/PageShell";
import { StatsCards } from "./components/Stats/StatsCards";
import { WorkoutControls } from "./components/Workout/WorkoutControls";
import { WorkoutSection } from "./components/Workout/WorkoutSection";
import { useAuth } from "./hooks/useAuth";
import { useFeedback } from "./hooks/useFeedback";
import { useWorkoutState } from "./hooks/useWorkoutState";
import { getSupabaseClient } from "./lib/supabaseClient";
import {
  signInWithEmail,
  signOutUser,
  signUpWithEmail
} from "./services/authService";
import { getDoneCount, getTotalCount } from "./services/exerciseService";
import { sanitizeNumericInput } from "./utils/validators";

const supabase = getSupabaseClient();

function sortHistory(history, historyFilter) {
  const filtered = historyFilter === "todos"
    ? history
    : history.filter((item) => item.workout === historyFilter);

  return [...filtered].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
}

export default function App() {
  const { feedback, showFeedback, clearFeedback } = useFeedback();
  const { currentUser, setCurrentUser, authReady } = useAuth(supabase);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [historyFilter, setHistoryFilter] = useState("todos");
  const [bodyWeightDraft, setBodyWeightDraft] = useState("");
  const [expandMode, setExpandMode] = useState("first");

  const {
    workouts,
    workoutMap,
    state,
    setState,
    onlyPendingMode,
    setOnlyPendingMode,
    syncStatus,
    busyAction,
    handleToggleExercise,
    handleUsedWeightChange,
    saveBodyWeight,
    completeWorkoutForDate,
    syncNow,
    clearChecks,
    clearAllData,
    importBackup,
    exportBackup,
    changeRecordDate,
    createWorkout,
    renameWorkout,
    deleteWorkout,
    addExercise,
    updateExerciseDefinition,
    deleteExercise,
    reorderExercise
  } = useWorkoutState({
    supabase,
    currentUser,
    showFeedback
  });

  const doneCount = useMemo(() => getDoneCount(state.exercises), [state.exercises]);
  const totalCount = useMemo(() => getTotalCount(state.exercises), [state.exercises]);
  const filteredHistory = useMemo(
    () => sortHistory(state.history || [], historyFilter),
    [state.history, historyFilter]
  );

  function updateAuthForm(field, value) {
    setAuthForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSignUp() {
    if (!supabase) {
      showFeedback("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.", "error");
      return;
    }

    if (!authForm.email.trim() || !authForm.password.trim()) {
      showFeedback("Preencha email e senha.", "error");
      return;
    }

    const { error } = await signUpWithEmail(
      supabase,
      authForm.email.trim(),
      authForm.password.trim()
    );

    if (error) {
      showFeedback(`Erro ao cadastrar: ${error.message}`, "error");
      return;
    }

    showFeedback("Cadastro realizado. Agora faca login.", "success");
  }

  async function handleSignIn() {
    if (!supabase) {
      showFeedback("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.", "error");
      return;
    }

    if (!authForm.email.trim() || !authForm.password.trim()) {
      showFeedback("Preencha email e senha.", "error");
      return;
    }

    const { data, error } = await signInWithEmail(
      supabase,
      authForm.email.trim(),
      authForm.password.trim()
    );

    if (error) {
      showFeedback(`Erro ao entrar: ${error.message}`, "error");
      return;
    }

    setCurrentUser(data.user || null);
    showFeedback("Login realizado com sucesso.", "success");
  }

  async function handleSignOut() {
    if (!supabase) {
      setCurrentUser(null);
      return;
    }

    const { error } = await signOutUser(supabase);

    if (error) {
      showFeedback(`Erro ao sair: ${error.message}`, "error");
      return;
    }

    setCurrentUser(null);
    showFeedback("Voce saiu da conta.", "success");
  }

  function handleBodyWeightInputChange(value) {
    const nextValue = sanitizeNumericInput(value);

    if (value !== "" && nextValue === null) {
      return;
    }

    setBodyWeightDraft(nextValue ?? "");
    setState((current) => ({
      ...current,
      bodyWeight: nextValue ?? ""
    }));
  }

  async function handleSaveBodyWeight() {
    const nextValue = sanitizeNumericInput(bodyWeightDraft === "" ? state.bodyWeight : bodyWeightDraft);
    await saveBodyWeight(nextValue === null ? null : nextValue);
  }

  async function handleExerciseWeightChange(exerciseKey, value) {
    const nextValue = sanitizeNumericInput(value);
    if (value !== "" && nextValue === null) return;
    await handleUsedWeightChange(exerciseKey, nextValue ?? "");
  }

  function handleOpenAll() {
    setExpandMode("all");
  }

  function handleCloseAll() {
    setExpandMode("none");
  }

  function handleShowPending() {
    setOnlyPendingMode(true);
  }

  function handleShowAllExercises() {
    setOnlyPendingMode(false);
  }

  return (
    <PageShell>
      <Header currentUser={currentUser} syncStatus={syncStatus} />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <AuthForm
          authForm={authForm}
          busyAction={busyAction}
          currentUser={currentUser}
          onChange={updateAuthForm}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          onSignUp={handleSignUp}
          onSyncNow={syncNow}
          supabaseReady={Boolean(supabase)}
        />

        <WorkoutControls
          busyAction={busyAction}
          historyFilter={historyFilter}
          onlyPendingMode={onlyPendingMode}
          state={state}
          onBodyWeightInputChange={handleBodyWeightInputChange}
          onClearAll={clearAllData}
          onClearChecks={clearChecks}
          onCloseAll={handleCloseAll}
          onCompleteWorkout={completeWorkoutForDate}
          onExportBackup={exportBackup}
          onHistoryFilterChange={setHistoryFilter}
          onImportBackup={importBackup}
          onOpenAll={handleOpenAll}
          onRecordDateChange={changeRecordDate}
          onSaveBodyWeight={handleSaveBodyWeight}
          onShowAllExercises={handleShowAllExercises}
          onShowPending={handleShowPending}
        />
      </div>

      <StatsCards
        bodyWeight={state.bodyWeight}
        doneCount={doneCount}
        lastUpdate={state.lastUpdate}
        totalCount={totalCount}
      />

      <WorkoutSection
        expandMode={expandMode}
        onlyPendingMode={onlyPendingMode}
        state={state}
        workouts={workouts}
        workoutMap={workoutMap}
        onAddExercise={addExercise}
        onCreateWorkout={createWorkout}
        onDeleteExercise={deleteExercise}
        onDeleteWorkout={deleteWorkout}
        onRenameWorkout={renameWorkout}
        onReorderExercise={reorderExercise}
        onToggleExercise={handleToggleExercise}
        onUpdateExercise={updateExerciseDefinition}
        onWeightChange={handleExerciseWeightChange}
      />

      <section className="panel p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Historico
            </p>
            <h2 className="mt-2 font-display text-2xl text-white">Registros por data</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Cada conclusao de treino salva os exercicios do dia com cargas e peso corporal.
            </p>
          </div>

          <div className="w-full sm:max-w-xs">
            <HistoryFilter value={historyFilter} onChange={setHistoryFilter} />
          </div>
        </div>

        <HistoryList history={filteredHistory} />
      </section>

      <footer className="px-1 pb-4 text-center text-sm leading-6 text-slate-500">
        Os links de video abrem uma busca no YouTube para facilitar a consulta da execucao.
        {!authReady ? " Verificando sessao..." : ""}
      </footer>

      <FeedbackMessage feedback={feedback} onClose={clearFeedback} />
    </PageShell>
  );
}
