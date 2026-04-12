import { useEffect, useState } from "react";
import { ExerciseAutocomplete } from "./ExerciseAutocomplete";
import { ExerciseEditor } from "./ExerciseEditor";

const emptyExerciseForm = {
  name: "",
  sets: "3",
  reps: "10-12"
};

export function WorkoutEditor({
  workout,
  workouts,
  onRenameWorkout,
  onDeleteWorkout,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onReorderExercise
}) {
  const [workoutName, setWorkoutName] = useState(workout.name);
  const [exerciseForm, setExerciseForm] = useState(emptyExerciseForm);

  useEffect(() => {
    setWorkoutName(workout.name);
  }, [workout.name]);

  function submitWorkoutRename(event) {
    event.preventDefault();
    onRenameWorkout(workout.name, workoutName);
  }

  function submitExercise(event) {
    event.preventDefault();
    onAddExercise(workout.name, exerciseForm);
    setExerciseForm(emptyExerciseForm);
  }

  function applySuggestion(suggestion) {
    setExerciseForm((current) => ({
      ...current,
      name: suggestion.name,
      sets: current.sets || suggestion.sets || "3",
      reps: current.reps || suggestion.reps || "10-12"
    }));
  }

  return (
    <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={submitWorkoutRename}>
          <input
            className="input-base"
            placeholder="Nome do treino"
            value={workoutName}
            onChange={(event) => setWorkoutName(event.target.value)}
          />
          <button className="btn-secondary" type="submit">
            Renomear treino
          </button>
        </form>

        <button className="btn-danger" onClick={() => onDeleteWorkout(workout.name)} type="button">
          Excluir treino
        </button>
      </div>

      <form className="grid gap-3" onSubmit={submitExercise}>
        <ExerciseAutocomplete
          label="Novo exercicio"
          value={exerciseForm.name}
          workouts={workouts}
          onChange={(value) =>
            setExerciseForm((current) => ({
              ...current,
              name: value
            }))
          }
          onSelectSuggestion={applySuggestion}
        />

        <div className="grid gap-3 xl:grid-cols-[0.55fr_0.55fr_auto]">
          <input
            className="input-base"
            placeholder="Series"
            value={exerciseForm.sets}
            onChange={(event) =>
              setExerciseForm((current) => ({ ...current, sets: event.target.value }))
            }
          />
          <input
            className="input-base"
            placeholder="Reps"
            value={exerciseForm.reps}
            onChange={(event) =>
              setExerciseForm((current) => ({ ...current, reps: event.target.value }))
            }
          />
          <button className="btn-primary" type="submit">
            Adicionar
          </button>
        </div>
      </form>

      <div className="grid gap-3">
        {workout.exercises.length ? (
          workout.exercises.map((exercise, index) => (
            <ExerciseEditor
              key={`${workout.name}-${exercise.name}`}
              canMoveDown={index < workout.exercises.length - 1}
              canMoveUp={index > 0}
              exercise={exercise}
              workouts={workouts}
              onDelete={() => onDeleteExercise(workout.name, exercise.name)}
              onMoveDown={() => onReorderExercise(workout.name, exercise.name, "down")}
              onMoveUp={() => onReorderExercise(workout.name, exercise.name, "up")}
              onSave={(updates) => onUpdateExercise(workout.name, exercise.name, updates)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">
            Esse treino ainda nao tem exercicios.
          </div>
        )}
      </div>
    </div>
  );
}
