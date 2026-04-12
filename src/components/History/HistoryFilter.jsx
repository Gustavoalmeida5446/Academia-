export function HistoryFilter({ value, onChange }) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      Filtrar historico
      <select
        aria-label="Filtrar historico por treino"
        className="input-base"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="todos">Todos os treinos</option>
        <option value="Treino A">Treino A</option>
        <option value="Treino B">Treino B</option>
        <option value="Treino C">Treino C</option>
      </select>
    </label>
  );
}
