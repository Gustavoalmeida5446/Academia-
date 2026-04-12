import { useEffect, useMemo, useState } from "react";
import { AuthForm } from "./components/Auth/AuthForm";
import { ConfirmDialog } from "./components/Feedback/ConfirmDialog";
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
  const {
    feedback,
    confirmState,
    showFeedback,
    clearFeedback,
    requestConfirm,
    closeConfirm
  } = useFeedback();
  const { currentUser, setCurrentUser, authReady } = useAuth(supabase);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [historyFilter, setHistoryFilter] = useState("todos");
  const [bodyWeightDraft, setBodyWeightDraft] = useState("");
  const [expandMode, setExpandMode] = useState("first");
  const [showAccountScreen, setShowAccountScreen] = useState(false);

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
  const showSaveBodyWeight = bodyWeightDraft !== String(state.bodyWeight ?? "");

  useEffect(() => {
    setBodyWeightDraft(String(state.bodyWeight ?? ""));
  }, [state.bodyWeight]);

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
  }

  async function handleSaveBodyWeight() {
    const nextValue = sanitizeNumericInput(bodyWeightDraft);
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
      <Header
        currentUser={currentUser}
        onOpenAccount={() => setShowAccountScreen(true)}
        syncStatus={syncStatus}
      />

      <WorkoutSection
        expandMode={expandMode}
        onlyPendingMode={onlyPendingMode}
        state={state}
        workouts={workouts}
        workoutMap={workoutMap}
        onAddExercise={addExercise}
        onCreateWorkout={createWorkout}
        onDeleteExercise={(workoutName, exerciseName) =>
          deleteExercise(workoutName, exerciseName, requestConfirm)
        }
        onDeleteWorkout={(workoutName) => deleteWorkout(workoutName, requestConfirm)}
        onRenameWorkout={renameWorkout}
        onReorderExercise={reorderExercise}
        onToggleExercise={handleToggleExercise}
        onUpdateExercise={updateExerciseDefinition}
        onWeightChange={handleExerciseWeightChange}
      />

      <WorkoutControls
        busyAction={busyAction}
        bodyWeightDraft={bodyWeightDraft}
        showSaveBodyWeight={showSaveBodyWeight}
        state={state}
        syncStatus={syncStatus}
        onBodyWeightInputChange={handleBodyWeightInputChange}
        onClearAll={() => clearAllData(requestConfirm)}
        onClearChecks={() => clearChecks(requestConfirm)}
        onCloseAll={handleCloseAll}
        onCompleteWorkout={completeWorkoutForDate}
        onExportBackup={exportBackup}
        onImportBackup={importBackup}
        onOpenAll={handleOpenAll}
        onRecordDateChange={changeRecordDate}
        onSaveBodyWeight={handleSaveBodyWeight}
        onShowAllExercises={handleShowAllExercises}
        onShowPending={handleShowPending}
      />

      <details className="panel">
        <summary className="cursor-pointer list-none px-4 py-4 text-sm font-semibold text-slate-300 sm:px-5">
          Historico e resumo
        </summary>
        <div className="grid gap-5 border-t border-white/10 px-4 py-4 sm:px-5">
          <StatsCards
            bodyWeight={state.bodyWeight}
            doneCount={doneCount}
            lastUpdate={state.lastUpdate}
            totalCount={totalCount}
          />

          <div className="grid gap-4">
            <div className="w-full sm:max-w-xs">
              <HistoryFilter value={historyFilter} onChange={setHistoryFilter} />
            </div>
            <HistoryList history={filteredHistory} />
          </div>
        </div>
      </details>

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
          onSyncNow={syncNow}
          supabaseReady={Boolean(supabase)}
        />
      ) : null}

      <footer className="px-1 pb-4 text-center text-sm leading-6 text-slate-500">
        Os links de video abrem uma busca no YouTube para facilitar a consulta da execucao.
        {!authReady ? " Verificando sessao..." : ""}
      </footer>

      <FeedbackMessage feedback={feedback} onClose={clearFeedback} />
      <ConfirmDialog
        confirmState={confirmState}
        onCancel={() => closeConfirm(false)}
        onConfirm={() => closeConfirm(true)}
      />
    </PageShell>
  );
}
