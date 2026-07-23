import { fmtGs } from '../lib/format.js';

// Alerta de días pendientes con el monto para ponerse al día.
export default function PendingAlert({ resumen, onPonerseAlDia, cargando }) {
  if (!resumen.dias_pendientes || resumen.monto_al_dia_gs <= 0) return null;

  return (
    <div className="rounded-2xl bg-coral-600/20 border border-coral-400/50 p-4 shadow-card animate-pop">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⏳</span>
        <div className="flex-1">
          <p className="font-600 text-white">
            Tenés {resumen.dias_pendientes}{' '}
            {resumen.dias_pendientes === 1 ? 'día pendiente' : 'días pendientes'}
          </p>
          <p className="text-sm text-ocean-100/85 mt-0.5">
            Para ponerte al día necesitás{' '}
            <span className="font-700 text-coral-300">{fmtGs(resumen.monto_al_dia_gs)}</span>.
          </p>
          {onPonerseAlDia && (
            <button
              onClick={onPonerseAlDia}
              disabled={cargando}
              className="mt-3 rounded-xl bg-coral-500 hover:bg-coral-400 px-4 py-2 text-sm
                         font-600 text-white transition disabled:opacity-60"
            >
              {cargando ? 'Guardando…' : `Registrar hoy con ${fmtGs(resumen.monto_al_dia_gs)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
