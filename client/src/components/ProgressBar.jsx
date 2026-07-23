import { fmtGs, fmtUsd } from '../lib/format.js';

const WAVES = `${import.meta.env.BASE_URL}img/aerial.jpg`;

export default function ProgressBar({ resumen }) {
  const pct = Math.min(100, resumen.porcentaje || 0);
  const acumUsd = resumen.tipo_cambio > 0 ? resumen.acumulado_gs / resumen.tipo_cambio : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 p-5 shadow-card">
      {/* Textura de mar */}
      <img
        src={WAVES}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-ocean-900/75 backdrop-blur-[2px]" />

      <div className="relative">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-ocean-100/80">Ahorrado</p>
            <p className="font-display font-700 text-2xl sm:text-3xl text-white">
              {fmtGs(resumen.acumulado_gs)}
            </p>
            <p className="text-sm text-sand-200">{fmtUsd(acumUsd)}</p>
          </div>
          <div className="text-right">
            <p className="font-display font-700 text-3xl sm:text-4xl text-coral-400
                          [text-shadow:0_2px_10px_rgba(0,0,0,0.3)]">
              {pct.toFixed(0)}%
            </p>
            <p className="text-xs text-ocean-100/80">de la meta</p>
          </div>
        </div>

        <div className="mt-4 h-5 w-full rounded-full bg-ocean-950/60 overflow-hidden border border-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sand-300 via-coral-400 to-coral-500
                       transition-[width] duration-700 ease-out flex items-center justify-end pr-2"
            style={{ width: `${Math.max(pct, 3)}%` }}
          >
            <span className="text-[0.6rem]" aria-hidden="true">🏄</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-ocean-100/80">
          <span>Meta: {fmtGs(resumen.meta_total_gs)}</span>
          <span>{fmtUsd(resumen.meta_total_usd)}</span>
        </div>
        {resumen.restante_gs > 0 && (
          <p className="mt-2 text-center text-sm text-ocean-100/85">
            Faltan <span className="font-700 text-white">{fmtGs(resumen.restante_gs)}</span> para
            tocar la arena de Guaratuba.
          </p>
        )}
      </div>
    </div>
  );
}
