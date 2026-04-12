import { formatDateTime } from "../../utils/date";
import { formatWeight } from "../../utils/format";

export function StatsCards({ doneCount, totalCount, bodyWeight, lastUpdate }) {
  const cards = [
    {
      label: "Exercicios concluidos",
      value: doneCount
    },
    {
      label: "Total de exercicios",
      value: totalCount
    },
    {
      label: "Ultimo peso corporal",
      value: formatWeight(bodyWeight)
    },
    {
      label: "Ultima atualizacao",
      value: formatDateTime(lastUpdate)
    }
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="panel overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5"
        >
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className="mt-3 font-display text-3xl text-white">{card.value}</p>
        </article>
      ))}
    </section>
  );
}
