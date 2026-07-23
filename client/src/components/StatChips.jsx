import { fmtGs } from '../lib/format.js';

// Fila de indicadores: racha, días restantes y aportes cargados.
export default function StatChips({ resumen }) {
  const chips = [
    {
      icono: '🔥',
      valor: resumen.racha,
      etiqueta: resumen.racha === 1 ? 'día de racha' : 'días de racha',
      destacado: resumen.racha > 0
    },
    {
      icono: '🗓️',
      valor: resumen.dias_restantes,
      etiqueta: 'días de viaje'
    },
    {
      icono: '💰',
      valor: resumen.total_aportes,
      etiqueta: 'aportes'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {chips.map((c) => (
        <div
          key={c.etiqueta}
          className={`rounded-2xl border p-3 text-center backdrop-blur-sm shadow-card
            ${c.destacado
              ? 'bg-coral-500/20 border-coral-400/40'
              : 'bg-white/10 border-white/10'}`}
        >
          <div className="text-2xl leading-none">{c.icono}</div>
          <div className="tabular font-display font-700 text-2xl text-white mt-1">
            {c.valor}
          </div>
          <div className="text-[0.65rem] uppercase tracking-wide text-ocean-100/70">
            {c.etiqueta}
          </div>
        </div>
      ))}
    </div>
  );
}
