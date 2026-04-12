import { StatusPill } from "../Feedback/StatusPill";

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
  onlyPendingMode,
  busyAction
}) {
  const syncLabel =
    syncStatus === "cloud"
      ? "Pronto para sincronizar"
      : syncStatus === "syncing"
        ? "Sincronizando..."
        : syncStatus === "error"
          ? "Erro de sincronizacao"
          : "Modo local";

  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Controle geral
          </p>
          <h2 className="mt-2 font-display text-2xl text-white">Treino do dia</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusPill tone={syncStatus === "error" ? "danger" : syncStatus === "syncing" ? "info" : syncStatus === "cloud" ? "success" : "warning"}>
            Status: {syncLabel}
          </StatusPill>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            className="btn-primary"
            disabled={busyAction === "bodyWeight"}
            onClick={onSaveBodyWeight}
            type="button"
          >
            {busyAction === "bodyWeight" ? "Salvando..." : "Salvar peso corporal"}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button className="btn-secondary" onClick={onOpenAll} type="button">
          Abrir todos
        </button>
        <button className="btn-secondary" onClick={onCloseAll} type="button">
          Fechar todos
        </button>
        <button className="btn-secondary" onClick={onShowPending} type="button">
          {onlyPendingMode ? "Mostrando pendentes" : "Mostrar so pendentes"}
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
          {busyAction === "completeWorkout" ? "Concluindo..." : "Concluir treino da data"}
        </button>
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
    </section>
  );
}
