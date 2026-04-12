import { formatDateTime } from "../../utils/date";
import { formatWeight } from "../../utils/format";

export function StatsCards({ doneCount, totalCount, bodyWeight, lastUpdate }) {
  const cards = [
    {
      label: "Exercicios concluidos",
      value: doneCount,
      accent: "from-white/[0.08] to-white/[0.02]"
    },
    {
      label: "Total de exercicios",
      value: totalCount,
      accent: "from-white/[0.08] to-white/[0.02]"
    },
    {
      label: "Ultimo peso corporal",
      value: formatWeight(bodyWeight),
      accent: "from-white/[0.08] to-white/[0.02]"
    },
    {
      label: "Ultima atualizacao",
      value: formatDateTime(lastUpdate),
      accent: "from-white/[0.08] to-white/[0.02]"
    }
  ];

  return (
    <section aria-label="Resumo do treino" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`panel overflow-hidden border-white/10 bg-gradient-to-br ${card.accent} p-5`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="max-w-[12rem] text-sm leading-6 text-slate-300">{card.label}</p>
            <span className="mt-1 h-3 w-3 rounded-full bg-white/60" />
          </div>
          <p className="mt-6 font-display text-3xl leading-none text-white">{card.value}</p>
        </article>
      ))}
    </section>
  );
}
