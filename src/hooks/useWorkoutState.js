import { useEffect, useMemo, useState } from "react";
import { buildHistoryEntry, normalizeHistoryEntries } from "../services/historyService";
import {
  loadStateFromSupabase,
  saveDailyStatusToSupabase,
  syncAllStateToSupabase,
  syncExerciseToSupabase,
  syncHistoryEntryToSupabase
} from "../services/syncService";
import {
  exportStateBackup,
  loadStateFromStorage,
  saveStateToStorage
} from "../services/storageService";
import {
  createDefaultState,
  getWorkoutMap,
  mergeState,
  rebuildExerciseState,
  reorderItems
} from "../services/workoutService";
import { makeExerciseKey } from "../utils/keys";
import { validateImportedState } from "../utils/validators";

export function useWorkoutState({ supabase, currentUser, showFeedback }) {
  const [state, setState] = useState(() => {
    const saved = loadStateFromStorage();
    return mergeState(saved);
  });
  const [onlyPendingMode, setOnlyPendingMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState("local");
  const [busyAction, setBusyAction] = useState("");

  const workoutMap = useMemo(() => getWorkoutMap(state.workouts), [state.workouts]);

  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  useEffect(() => {
    if (!supabase || !currentUser) {
      setSyncStatus("local");
      return;
    }

    let active = true;
    setSyncStatus("syncing");

    loadStateFromSupabase({
      supabase,
      currentUser,
      currentState: state
    })
      .then((nextState) => {
        if (!active) return;
        setState(nextState);
        setSyncStatus("cloud");
      })
      .catch(() => {
        if (!active) return;
        setSyncStatus("error");
        showFeedback("Nao foi possivel carregar os dados do Supabase.", "error");
      });

    return () => {
      active = false;
    };
  }, [supabase, currentUser, showFeedback]);

  function replaceState(nextState) {
    setState({
      ...nextState,
      lastUpdate: new Date().toISOString()
    });
  }

  function updateExercise(exerciseKey, updates) {
    const updatedAt = new Date().toISOString();

    setState((current) => ({
      ...current,
      lastUpdate: updatedAt,
      exercises: {
        ...current.exercises,
        [exerciseKey]: {
          ...current.exercises[exerciseKey],
          ...updates,
          updatedAt
        }
      }
    }));
  }

  function updateWorkoutStructure(workouts, nextExercises, history = state.history) {
    const updatedAt = new Date().toISOString();

    setState((current) => ({
      ...current,
      workouts,
      exercises: nextExercises,
      history,
      lastUpdate: updatedAt
    }));
  }

  async function handleToggleExercise(exerciseKey, checked) {
    updateExercise(exerciseKey, { checked });

    if (supabase && currentUser) {
      const nextState = {
        ...state,
        exercises: {
          ...state.exercises,
          [exerciseKey]: {
            ...state.exercises[exerciseKey],
            checked
          }
        }
      };

      try {
        await syncExerciseToSupabase({
          supabase,
          currentUser,
          state: nextState,
          exerciseKey
        });
        setSyncStatus("cloud");
      } catch {
        setSyncStatus("error");
      }
    }
  }

  async function handleUsedWeightChange(exerciseKey, usedWeight) {
    setBusyAction(`exerciseWeight:${exerciseKey}`);
    updateExercise(exerciseKey, { usedWeight });

    if (supabase && currentUser) {
      setSyncStatus("syncing");
      const nextState = {
        ...state,
        exercises: {
          ...state.exercises,
          [exerciseKey]: {
            ...state.exercises[exerciseKey],
            usedWeight
          }
        }
      };

      try {
        await syncExerciseToSupabase({
          supabase,
          currentUser,
          state: nextState,
          exerciseKey
        });
        setSyncStatus("cloud");
        showFeedback("Peso do exercicio salvo.", "success");
      } catch {
        setSyncStatus("error");
        showFeedback("Nao foi possivel salvar o peso do exercicio.", "error");
      }
    } else {
      showFeedback("Peso do exercicio salvo localmente.", "success");
    }

    setBusyAction("");
  }

  async function saveBodyWeight(bodyWeight) {
    if (bodyWeight === null) {
      showFeedback("Digite um peso corporal valido.", "error");
      return;
    }

    setBusyAction("bodyWeight");

    const updatedAt = new Date().toISOString();
    const nextWeightEntry = {
      id: state.recordDate,
      date: state.recordDate,
      weight: Number(bodyWeight),
      createdAt: updatedAt
    };
    const nextBodyWeightHistory = [
      nextWeightEntry,
      ...(state.bodyWeightHistory || []).filter((item) => item.date !== state.recordDate)
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const nextState = {
      ...state,
      bodyWeight,
      bodyWeightDate: state.recordDate,
      bodyWeightHistory: nextBodyWeightHistory,
      lastUpdate: updatedAt
    };

    setState(nextState);

    if (supabase && currentUser) {
      setSyncStatus("syncing");
      try {
        await syncAllStateToSupabase({ supabase, currentUser, state: nextState });
        setSyncStatus("cloud");
      } catch {
        setSyncStatus("error");
      }
    }

    showFeedback("Peso corporal salvo.", "success");
    setBusyAction("");
  }

  async function deleteBodyWeightEntry(entryId, requestConfirm) {
    const confirmed = await requestConfirm({
      title: "Excluir peso corporal",
      message: "Esse registro antigo de peso sera removido do app.",
      confirmLabel: "Excluir peso",
      tone: "danger"
    });

    if (!confirmed) return;

    const nextBodyWeightHistory = (state.bodyWeightHistory || []).filter((item) => item.id !== entryId);
    const latestEntry = nextBodyWeightHistory[0];

    const nextState = {
      ...state,
      bodyWeightHistory: nextBodyWeightHistory,
      bodyWeight: latestEntry?.weight ?? "",
      bodyWeightDate: latestEntry?.date ?? "",
      lastUpdate: new Date().toISOString()
    };

    setState(nextState);
    await syncAllStateToSupabase({ supabase, currentUser, state: nextState });
    showFeedback("Registro de peso removido.", "success");
  }

  async function completeWorkout(workoutName) {
    const eligibleWorkouts = state.workouts
      .filter((workout) => {
        if (workoutName && workout.name !== workoutName) return false;
        if (!workout.exercises.length) return false;
        return workout.exercises.every((exercise) => {
          const exerciseKey = makeExerciseKey(workout.name, exercise.name);
          return state.exercises[exerciseKey]?.checked;
        });
      })
      .map((workout) => workout.name);

    if (!eligibleWorkouts.length) {
      showFeedback("Marque todos os exercicios do treino antes de concluir.", "error");
      return;
    }

    setBusyAction("completeWorkout");

    const completedAt = new Date().toISOString();
    const entries = eligibleWorkouts.map((name) =>
      buildHistoryEntry({
        state,
        workoutName: name,
        recordDate: state.recordDate,
        completedAt
      })
    );

    const nextExercises = Object.fromEntries(
      Object.entries(state.exercises).map(([key, item]) => [
        key,
        eligibleWorkouts.includes(item.workout)
          ? {
              ...item,
              checked: false,
              updatedAt: completedAt
            }
          : item
      ])
    );

    const nextState = {
      ...state,
      exercises: nextExercises,
      lastUpdate: completedAt,
      history: normalizeHistoryEntries([...(state.history || []), ...entries]),
      dailyStatus: {
        ...(state.dailyStatus || {}),
        [state.recordDate]: {
          ...(state.dailyStatus?.[state.recordDate] || {}),
          workoutDone: true
        }
      }
    };

    setState(nextState);

    if (supabase && currentUser) {
      setSyncStatus("syncing");
      try {
        await syncHistoryEntryToSupabase({ supabase, currentUser, state: nextState });
        await saveDailyStatusToSupabase({
          supabase,
          currentUser,
          recordDate: state.recordDate,
          status: nextState.dailyStatus[state.recordDate]
        });
        setSyncStatus("cloud");
      } catch {
        setSyncStatus("error");
      }
    }

    showFeedback("Treino concluido e checks limpos.", "success");
    setBusyAction("");
  }

  async function updateDailyStatus(partial) {
    const nextStatus = {
      ...(state.dailyStatus?.[state.recordDate] || {}),
      ...partial
    };

    const nextState = {
      ...state,
      dailyStatus: {
        ...(state.dailyStatus || {}),
        [state.recordDate]: nextStatus
      }
    };

    setState(nextState);

    if (supabase && currentUser) {
      await saveDailyStatusToSupabase({
        supabase,
        currentUser,
        recordDate: state.recordDate,
        status: nextStatus
      });
      await syncAllStateToSupabase({ supabase, currentUser, state: nextState });
    }
  }

  async function saveSync() {
    if (!supabase || !currentUser) {
      showFeedback("Voce precisa estar logado para salvar na nuvem.", "error");
      return;
    }

    setBusyAction("saveSync");
    setSyncStatus("syncing");

    try {
      await syncAllStateToSupabase({ supabase, currentUser, state });
      setSyncStatus("cloud");
      showFeedback("Dados salvos no Supabase.", "success");
    } catch {
      setSyncStatus("error");
      showFeedback("Nao foi possivel salvar no Supabase agora.", "error");
    } finally {
      setBusyAction("");
    }
  }

  async function refreshSync() {
    if (!supabase || !currentUser) {
      showFeedback("Voce precisa estar logado para atualizar da nuvem.", "error");
      return;
    }

    setBusyAction("refreshSync");
    setSyncStatus("syncing");

    try {
      const freshState = await loadStateFromSupabase({ supabase, currentUser, currentState: state });
      setState(freshState);
      setSyncStatus("cloud");
      showFeedback("Dados atualizados do Supabase.", "success");
    } catch {
      setSyncStatus("error");
      showFeedback("Nao foi possivel atualizar os dados do Supabase.", "error");
    } finally {
      setBusyAction("");
    }
  }

  async function clearChecks(requestConfirm) {
    const confirmed = await requestConfirm({
      title: "Desmarcar exercicios",
      message: "Isso vai remover a marcacao de todos os exercicios do treino atual.",
      confirmLabel: "Desmarcar tudo"
    });

    if (!confirmed) return;

    const updatedAt = new Date().toISOString();
    const nextExercises = Object.fromEntries(
      Object.entries(state.exercises).map(([key, item]) => [
        key,
        {
          ...item,
          checked: false,
          updatedAt
        }
      ])
    );

    const nextState = { ...state, exercises: nextExercises, lastUpdate: updatedAt };
    setState(nextState);

    if (supabase && currentUser) {
      setSyncStatus("syncing");
      try {
        await syncAllStateToSupabase({ supabase, currentUser, state: nextState });
        setSyncStatus("cloud");
      } catch {
        setSyncStatus("error");
      }
    }
  }

  async function clearAllData(requestConfirm) {
    const confirmed = await requestConfirm({
      title: "Apagar todos os dados",
      message: "Essa acao limpa treinos, checks, pesos, historico e dados locais salvos no app.",
      confirmLabel: "Apagar tudo",
      tone: "danger"
    });

    if (!confirmed) return;

    const nextState = createDefaultState();
    setState(nextState);

    if (supabase && currentUser) {
      setSyncStatus("syncing");
      try {
        await Promise.all([
          supabase.from("workouts").delete().eq("user_id", currentUser.id),
          supabase.from("exercise_state").delete().eq("user_id", currentUser.id),
          supabase.from("workout_history").delete().eq("user_id", currentUser.id),
          supabase.from("body_weight_entries").delete().eq("user_id", currentUser.id),
          supabase.from("foods").delete().eq("user_id", currentUser.id),
          supabase.from("diet_meals").delete().eq("user_id", currentUser.id),
          supabase.from("plan_parameters").delete().eq("user_id", currentUser.id),
          supabase.from("daily_logs").delete().eq("user_id", currentUser.id)
        ]);
        setSyncStatus("cloud");
      } catch {
        setSyncStatus("error");
      }
    }

    showFeedback("Todos os dados foram apagados.", "success");
  }

  async function clearHistory(requestConfirm) {
    const confirmed = await requestConfirm({
      title: "Limpar historico",
      message: "Isso remove o historico salvo localmente do app.",
      confirmLabel: "Limpar historico",
      tone: "danger"
    });

    if (!confirmed) return;

    const nextState = { ...state, history: [], lastUpdate: new Date().toISOString() };
    setState(nextState);
    await syncAllStateToSupabase({ supabase, currentUser, state: nextState });
    showFeedback("Historico limpo.", "success");
  }

  async function importBackup(file) {
    if (!file) return;

    setBusyAction("import");

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!validateImportedState(parsed)) {
        showFeedback("Arquivo de backup invalido.", "error");
        return;
      }

      const nextState = mergeState(parsed);
      setState(nextState);

      if (supabase && currentUser) {
        await syncAllStateToSupabase({ supabase, currentUser, state: nextState });
      }

      showFeedback("Backup importado com sucesso.", "success");
    } catch {
      showFeedback("Arquivo de backup invalido.", "error");
    } finally {
      setBusyAction("");
    }
  }

  function exportBackup() {
    exportStateBackup(state);
    showFeedback("Backup exportado.", "success");
  }

  function changeRecordDate(recordDate) {
    setState((current) => ({ ...current, recordDate: recordDate || current.recordDate }));
  }

  function updatePlanParameters(updates) {
    replaceState({
      ...state,
      planParameters: {
        ...state.planParameters,
        ...updates
      }
    });
  }

  function addFood(food) {
    const nextFood = {
      id: food.id || crypto.randomUUID(),
      externalId: food.externalId || "",
      name: food.name,
      protein: Number(food.protein) || 0,
      calories: Number(food.calories) || 0,
      carbs: Number(food.carbs) || 0,
      fat: Number(food.fat) || 0,
      servingSize: Number(food.servingSize) || 100,
      servingUnit: food.servingUnit || "g",
      source: food.source || "manual"
    };

    const nextFoods = [nextFood, ...state.foods.filter((item) => item.id !== nextFood.id)];
    replaceState({ ...state, foods: nextFoods });
  }

  function updateFood(foodId, updates) {
    const nextFoods = state.foods.map((item) =>
      item.id === foodId
        ? {
            ...item,
            ...updates,
            protein: Number(updates.protein ?? item.protein) || 0,
            calories: Number(updates.calories ?? item.calories) || 0,
            carbs: Number(updates.carbs ?? item.carbs) || 0,
            fat: Number(updates.fat ?? item.fat) || 0,
            servingSize: Number(updates.servingSize ?? item.servingSize) || 100,
            servingUnit: updates.servingUnit ?? item.servingUnit ?? "g"
          }
        : item
    );
    replaceState({ ...state, foods: nextFoods });
  }

  function deleteFood(foodId) {
    const nextFoods = state.foods.filter((item) => item.id !== foodId);
    const nextDietPlan = Object.fromEntries(
      Object.entries(state.dietPlan || {}).map(([day, meals]) => [
        day,
        meals.filter((meal) => meal.foodId !== foodId)
      ])
    );
    replaceState({ ...state, foods: nextFoods, dietPlan: nextDietPlan });
  }

  function addDietMeal(dayKey, meal) {
    const nextMeal = {
      id: crypto.randomUUID(),
      mealName: meal.mealName || "Refeicao",
      foodId: meal.foodId,
      servings: Number(meal.servings) || 1
    };

    replaceState({
      ...state,
      dietPlan: {
        ...state.dietPlan,
        [dayKey]: [...(state.dietPlan?.[dayKey] || []), nextMeal]
      }
    });
  }

  function updateDietMeal(dayKey, mealId, updates) {
    replaceState({
      ...state,
      dietPlan: {
        ...state.dietPlan,
        [dayKey]: (state.dietPlan?.[dayKey] || []).map((item) =>
          item.id === mealId
            ? {
                ...item,
                ...updates,
                servings: Number(updates.servings ?? item.servings) || 1
              }
            : item
        )
      }
    });
  }

  function deleteDietMeal(dayKey, mealId) {
    replaceState({
      ...state,
      dietPlan: {
        ...state.dietPlan,
        [dayKey]: (state.dietPlan?.[dayKey] || []).filter((item) => item.id !== mealId)
      }
    });
  }

  function createWorkout(workoutName) {
    const trimmedName = workoutName.trim();
    if (!trimmedName) return showFeedback("Digite um nome para o treino.", "error");

    const alreadyExists = state.workouts.some(
      (workout) => workout.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (alreadyExists) return showFeedback("Ja existe um treino com esse nome.", "error");

    const workouts = [...state.workouts, { name: trimmedName, exercises: [] }];
    const nextExercises = rebuildExerciseState(workouts, state.exercises);

    updateWorkoutStructure(workouts, nextExercises);
    showFeedback("Treino criado com sucesso.", "success");
  }

  function renameWorkout(currentName, nextName) {
    const trimmedName = nextName.trim();
    if (!trimmedName) return showFeedback("O nome do treino nao pode ficar vazio.", "error");

    const duplicateWorkout = state.workouts.some(
      (workout) =>
        workout.name !== currentName && workout.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicateWorkout) return showFeedback("Ja existe outro treino com esse nome.", "error");

    const workouts = state.workouts.map((workout) =>
      workout.name === currentName ? { ...workout, name: trimmedName } : workout
    );

    const nextExercises = {};
    Object.entries(state.exercises).forEach(([key, item]) => {
      if (item.workout === currentName) {
        const nextKey = makeExerciseKey(trimmedName, item.exercise);
        nextExercises[nextKey] = { ...item, workout: trimmedName };
      } else {
        nextExercises[key] = item;
      }
    });

    const nextHistory = (state.history || []).map((entry) =>
      entry.workout === currentName ? { ...entry, workout: trimmedName } : entry
    );

    updateWorkoutStructure(workouts, nextExercises, nextHistory);
    showFeedback("Treino renomeado.", "success");
  }

  async function deleteWorkout(workoutName, requestConfirm) {
    const confirmed = await requestConfirm({
      title: "Excluir treino",
      message: `O treino "${workoutName}" e o historico relacionado a ele serao removidos do app.`,
      confirmLabel: "Excluir treino",
      tone: "danger"
    });

    if (!confirmed) return;

    const workouts = state.workouts.filter((workout) => workout.name !== workoutName);
    const nextExercises = Object.fromEntries(
      Object.entries(state.exercises).filter(([, item]) => item.workout !== workoutName)
    );
    const nextHistory = (state.history || []).filter((entry) => entry.workout !== workoutName);

    updateWorkoutStructure(workouts, nextExercises, nextHistory);
    showFeedback("Treino excluido.", "success");
  }

  function addExercise(workoutName, exerciseData) {
    const trimmedName = exerciseData.name.trim();
    if (!trimmedName) return showFeedback("Digite um nome para o exercicio.", "error");

    const duplicateExercise = state.workouts
      .find((workout) => workout.name === workoutName)
      ?.exercises.some((exercise) => exercise.name.toLowerCase() === trimmedName.toLowerCase());

    if (duplicateExercise) return showFeedback("Esse exercicio ja existe nesse treino.", "error");

    const workouts = state.workouts.map((workout) => {
      if (workout.name !== workoutName) return workout;

      return {
        ...workout,
        exercises: [
          ...workout.exercises,
          {
            name: trimmedName,
            sets: exerciseData.sets.trim() || "3",
            reps: exerciseData.reps.trim() || "10-12",
            videoQuery: trimmedName,
            muscleGroup: exerciseData.muscleGroup || "",
            mediaUrl: exerciseData.mediaUrl || "",
            externalId: exerciseData.externalId || ""
          }
        ]
      };
    });

    const nextExercises = rebuildExerciseState(workouts, state.exercises);
    updateWorkoutStructure(workouts, nextExercises);
    showFeedback("Exercicio adicionado.", "success");
  }

  function updateExerciseDefinition(workoutName, currentExerciseName, updates) {
    const trimmedName = updates.name.trim();
    if (!trimmedName) return showFeedback("O nome do exercicio nao pode ficar vazio.", "error");

    const duplicateExercise = state.workouts
      .find((workout) => workout.name === workoutName)
      ?.exercises.some(
        (exercise) =>
          exercise.name !== currentExerciseName &&
          exercise.name.toLowerCase() === trimmedName.toLowerCase()
      );

    if (duplicateExercise) {
      return showFeedback("Ja existe outro exercicio com esse nome nesse treino.", "error");
    }

    const workouts = state.workouts.map((workout) => {
      if (workout.name !== workoutName) return workout;

      return {
        ...workout,
        exercises: workout.exercises.map((exercise) =>
          exercise.name === currentExerciseName
            ? {
                ...exercise,
                name: trimmedName,
                sets: updates.sets.trim(),
                reps: updates.reps.trim(),
                videoQuery: trimmedName,
                muscleGroup: updates.muscleGroup || exercise.muscleGroup || "",
                mediaUrl: updates.mediaUrl || exercise.mediaUrl || "",
                externalId: updates.externalId || exercise.externalId || ""
              }
            : exercise
        )
      };
    });

    const currentKey = makeExerciseKey(workoutName, currentExerciseName);
    const nextKey = makeExerciseKey(workoutName, trimmedName);
    const nextExercises = { ...state.exercises };
    const currentExerciseState = nextExercises[currentKey];

    delete nextExercises[currentKey];
    nextExercises[nextKey] = {
      ...currentExerciseState,
      workout: workoutName,
      exercise: trimmedName
    };

    const nextHistory = (state.history || []).map((entry) => {
      if (entry.workout !== workoutName) return entry;
      return {
        ...entry,
        exercises: entry.exercises.map((exercise) =>
          exercise.exercise === currentExerciseName
            ? { ...exercise, exercise: trimmedName }
            : exercise
        )
      };
    });

    updateWorkoutStructure(workouts, nextExercises, nextHistory);
    showFeedback("Exercicio atualizado.", "success");
  }

  async function deleteExercise(workoutName, exerciseName, requestConfirm) {
    const confirmed = await requestConfirm({
      title: "Excluir exercicio",
      message: `O exercicio "${exerciseName}" sera removido do treino "${workoutName}".`,
      confirmLabel: "Excluir exercicio",
      tone: "danger"
    });

    if (!confirmed) return;

    const workouts = state.workouts.map((workout) => {
      if (workout.name !== workoutName) return workout;
      return {
        ...workout,
        exercises: workout.exercises.filter((exercise) => exercise.name !== exerciseName)
      };
    });

    const exerciseKey = makeExerciseKey(workoutName, exerciseName);
    const nextExercises = { ...state.exercises };
    delete nextExercises[exerciseKey];

    const nextHistory = (state.history || [])
      .map((entry) => {
        if (entry.workout !== workoutName) return entry;
        return {
          ...entry,
          exercises: entry.exercises.filter((exercise) => exercise.exercise !== exerciseName)
        };
      })
      .filter((entry) => entry.exercises.length > 0);

    updateWorkoutStructure(workouts, nextExercises, nextHistory);
    showFeedback("Exercicio excluido.", "success");
  }

  function reorderExercise(workoutName, exerciseName, direction) {
    const workout = state.workouts.find((item) => item.name === workoutName);
    const currentIndex = workout?.exercises.findIndex((item) => item.name === exerciseName) ?? -1;
    if (currentIndex < 0) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const workouts = state.workouts.map((item) =>
      item.name === workoutName
        ? { ...item, exercises: reorderItems(item.exercises, currentIndex, targetIndex) }
        : item
    );

    const nextExercises = rebuildExerciseState(workouts, state.exercises);
    updateWorkoutStructure(workouts, nextExercises);
  }

  return {
    workouts: state.workouts,
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
    completeWorkout,
    updateDailyStatus,
    saveSync,
    refreshSync,
    clearHistory,
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
    reorderExercise,
    updatePlanParameters,
    addFood,
    updateFood,
    deleteFood,
    addDietMeal,
    updateDietMeal,
    deleteDietMeal
  };
}
