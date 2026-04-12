import { useEffect, useMemo, useState } from "react";
import { AuthForm } from "./components/Auth/AuthForm";
import { ConfirmDialog } from "./components/Feedback/ConfirmDialog";
import { FeedbackMessage } from "./components/Feedback/FeedbackMessage";
import { HistoryFilter } from "./components/History/HistoryFilter";
import { HistoryList } from "./components/History/HistoryList";
import { Header } from "./components/Layout/Header";
import { PageShell } from "./components/Layout/PageShell";
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
  const [activeScreen, setActiveScreen] = useState("treinos");
  const [menuOpen, setMenuOpen] = useState(false);

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
    saveBodyWeight,
    deleteBodyWeightEntry,
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
  const bodyWeightHistory = useMemo(
    () => [...(state.bodyWeightHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [state.bodyWeightHistory]
  );

  useEffect(() => {
    if (activeScreen === "peso") {
      setBodyWeightDraft(String(state.bodyWeight ?? ""));
    }
  }, [activeScreen, state.bodyWeight]);

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

  async function handleExerciseWeightChange(exerciseKey, value) {
    const nextValue = sanitizeNumericInput(value);
    if (value !== "" && nextValue === null) return;
    await handleUsedWeightChange(exerciseKey, nextValue ?? "");
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

  function handleImportFile(file) {
    importBackup(file);
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

  function handleNavigate(nextScreen) {
    setActiveScreen(nextScreen);
    setMenuOpen(false);
    if (nextScreen === "treinos") {
      setOnlyPendingMode(false);
    }
    if (nextScreen === "peso") {
      setBodyWeightDraft(String(state.bodyWeight ?? ""));
    }
  }

  const workoutNames = workouts.map((workout) => workout.name);

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

      {activeScreen === "treinos" ? (
        <>
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary" onClick={handleOpenAll} type="button">
              Abrir todos
            </button>
            <button className="btn-secondary" onClick={handleCloseAll} type="button">
              Fechar todos
            </button>
            <button className="btn-secondary" onClick={handleShowPending} type="button">
              So pendentes
            </button>
            <button className="btn-secondary" onClick={handleShowAllExercises} type="button">
              Mostrar todos
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
            onDeleteExercise={(workoutName, exerciseName) =>
              deleteExercise(workoutName, exerciseName, requestConfirm)
            }
            onDeleteWorkout={(workoutName) => deleteWorkout(workoutName, requestConfirm)}
            onRenameWorkout={renameWorkout}
            onReorderExercise={reorderExercise}
            onToggleExercise={handleToggleExercise}
            onUpdateExercise={updateExerciseDefinition}
            onSaveWeight={handleExerciseWeightChange}
          />
        </>
      ) : null}

      {activeScreen === "historico" ? (
        <section className="grid gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid gap-4 sm:max-w-xs">
              <HistoryFilter
                options={workoutNames}
                value={historyFilter}
                onChange={setHistoryFilter}
              />
            </div>
            <button
              className="btn-secondary sm:w-fit"
              onClick={() => clearHistory(requestConfirm)}
              type="button"
            >
              Limpar historico
            </button>
          </div>
          <HistoryList history={filteredHistory} />
        </section>
      ) : null}

      {activeScreen === "peso" ? (
        <section className="grid gap-4">
          <div className="panel px-4 py-4 sm:px-5">
            <div className="grid gap-4 sm:max-w-md">
              <label className="grid gap-2 text-sm text-slate-300">
                Peso corporal (kg)
                <input
                  className="input-base"
                  min="0"
                  placeholder="Ex: 67.0"
                  step="0.1"
                  type="number"
                  value={bodyWeightDraft}
                  onChange={(event) => handleBodyWeightInputChange(event.target.value)}
                />
              </label>
              <button
                className="btn-primary sm:w-fit sm:min-w-[160px]"
                disabled={busyAction === "bodyWeight"}
                onClick={handleSaveBodyWeight}
                type="button"
              >
                {busyAction === "bodyWeight" ? "Salvando..." : "Salvar peso corporal"}
              </button>
            </div>
          </div>

          <section className="grid gap-3">
            {bodyWeightHistory.length ? (
              bodyWeightHistory.map((entry) => (
                <article
                  key={entry.id}
                  className="panel flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div>
                    <p className="text-lg font-semibold text-white">{entry.weight} kg</p>
                    <p className="text-sm text-slate-400">{entry.date}</p>
                  </div>
                  <button
                    className="btn-danger sm:w-fit"
                    onClick={() => deleteBodyWeightEntry(entry.id, requestConfirm)}
                    type="button"
                  >
                    Excluir
                  </button>
                </article>
              ))
            ) : (
              <div className="panel px-4 py-8 text-center text-sm text-slate-400 sm:px-5">
                Nenhum peso corporal salvo ainda.
              </div>
            )}
          </section>
        </section>
      ) : null}

      {activeScreen === "dados" ? (
        <section className="grid gap-4">
          <div className="panel px-4 py-4 sm:px-5">
            <div className="grid gap-3 sm:max-w-sm">
              <p className="text-sm text-slate-400">Concluidos: {doneCount} de {totalCount} exercicios</p>
              <button className="btn-secondary sm:w-fit" onClick={exportBackup} type="button">
                Exportar backup
              </button>
              <label className="btn-secondary cursor-pointer sm:w-fit">
                {busyAction === "import" ? "Importando..." : "Importar backup"}
                <input
                  accept=".json,application/json"
                  className="hidden"
                  type="file"
                  onChange={(event) => handleImportFile(event.target.files?.[0])}
                />
              </label>
              <button className="btn-secondary sm:w-fit" onClick={() => clearChecks(requestConfirm)} type="button">
                Desmarcar tudo
              </button>
              <button className="btn-danger sm:w-fit" onClick={() => clearAllData(requestConfirm)} type="button">
                Apagar tudo
              </button>
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

      <footer className="px-1 pb-4 text-center text-sm leading-6 text-slate-500">
        {!authReady ? "Verificando sessao..." : ""}
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
