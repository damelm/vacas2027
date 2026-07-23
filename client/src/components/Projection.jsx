import { fmtFechaLarga, fmtGs } from '../lib/format.js';

// Proyección de llegada a la meta al ritmo actual.
export default function Projection({ resumen }) {
  const p = resumen.proyeccion;

  return (
    <div className="rounded-3xl bg-white/10 border border-white/10 p-5 shadow-card backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🔮</span>
        <h3 className="font-display font-600 text-lg text-white">Proyección</h3>
      </div>

      {!p ? (
        <p className="text-sm text-ocean-100/70">
          Cargá algunos aportes y calculamos cuándo llegás a la meta al ritmo actual.
        </p>
      ) : p.alcanzada ? (
        <p className="text-sm text-white">
          🎉 ¡Meta alcanzada! Ya tenés todo lo necesario para el viaje.
        </p>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="text-ocean-100/85">
            Ahorrás <span className="font-700 text-white">{fmtGs(p.ritmo_diario_gs)}</span> por día
            en promedio.
          </p>
          <p className="text-ocean-100/85">
            A ese ritmo llegás a la meta el{' '}
            <span className="font-700 text-sand-200">{fmtFechaLarga(p.fecha)}</span>{' '}
            <span className="text-ocean-100/60">({p.dias} días).</span>
          </p>
          <div
            className={`mt-2 rounded-xl px-3 py-2 text-sm font-600 ${
              p.llegaATiempo
                ? 'bg-ocean-500/25 text-ocean-50 border border-ocean-400/40'
                : 'bg-coral-600/25 text-coral-100 border border-coral-400/40'
            }`}
          >
            {p.llegaATiempo
              ? '✅ Vas a llegar con la meta cumplida antes de la salida.'
              : '⚠️ A este ritmo llegás después de la fecha de salida. Subí el aporte diario.'}
          </div>
        </div>
      )}
    </div>
  );
}
