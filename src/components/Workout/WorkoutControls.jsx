export function WorkoutControls({
  state,
  syncStatus,
  onBodyWeightInputChange,
  onSaveBodyWeight,
  onRecordDateChange,
  onOpenAll,
  onCloseAll,
  onShowPending,
  onShowAllExercises,
  onCompleteWorkout,
  onExportBackup,
  onImportBackup,
  onClearChecks,
  onClearAll,
  busyAction
}) {
  return (
    <details className="panel">
      <summary className="cursor-pointer list-none px-4 py-4 text-sm font-semibold text-slate-300 sm:px-5">
        Mais opcoes e dados
      </summary>
      <div className="grid gap-4 border-t border-white/10 px-4 py-4 sm:px-5 sm:py-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-2 text-sm text-slate-300">
            Peso corporal (kg)
            <input
              className="input-base"
              min="0"
              placeholder="Ex: 67.0"
              step="0.1"
              type="number"
              value={state.bodyWeight}
              aria-label="Peso corporal em quilos"
              onChange={(event) => onBodyWeightInputChange(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-300">
            Data do treino
            <input
              className="input-base"
              type="date"
              value={state.recordDate}
              aria-label="Data do treino"
              onChange={(event) => onRecordDateChange(event.target.value)}
            />
          </label>

          <div className="grid gap-2 text-sm text-slate-300">
            <span className="opacity-0">Salvar</span>
            <button
              className="btn-primary min-w-[180px]"
              disabled={busyAction === "bodyWeight"}
              onClick={onSaveBodyWeight}
              type="button"
            >
              {busyAction === "bodyWeight" ? "Salvando..." : "Salvar peso corporal"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary" onClick={onOpenAll} type="button">
            Abrir todos
          </button>
          <button className="btn-secondary" onClick={onCloseAll} type="button">
            Fechar todos
          </button>
          <button className="btn-secondary" onClick={onShowPending} type="button">
            So pendentes
          </button>
          <button className="btn-secondary" onClick={onShowAllExercises} type="button">
            Mostrar todos
          </button>
          <button
            className="btn-success"
            disabled={busyAction === "completeWorkout"}
            onClick={onCompleteWorkout}
            type="button"
          >
            {busyAction === "completeWorkout" ? "Concluindo..." : "Concluir treino"}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
          <button className="btn-secondary" onClick={onExportBackup} type="button">
            Exportar backup
          </button>
          <label className="btn-secondary cursor-pointer">
            {busyAction === "import" ? "Importando..." : "Importar backup"}
            <input
              accept=".json,application/json"
              className="hidden"
              type="file"
              onChange={(event) => onImportBackup(event.target.files?.[0])}
            />
          </label>
          <button className="btn-secondary" onClick={onClearChecks} type="button">
            Desmarcar tudo
          </button>
          <button className="btn-danger" onClick={onClearAll} type="button">
            Apagar tudo
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
          Status de sync: {syncStatus}
        </div>
      </div>
    </details>
  );
}
