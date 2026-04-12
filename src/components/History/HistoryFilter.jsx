export function HistoryFilter({ value, onChange, options = [] }) {
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
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
