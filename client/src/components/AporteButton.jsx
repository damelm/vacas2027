import { useState } from 'react';
import { fmtGs, fmtGsCorto } from '../lib/format.js';

export default function AporteButton({ resumen, hoyRegistrado, onRegistrar }) {
  const [abierto, setAbierto] = useState(false);
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(resumen.hoy);
  const [nota, setNota] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const aporteDiario = resumen.aporte_diario_gs;

  async function registrarHoy() {
    setError('');
    setCargando(true);
    try {
      await onRegistrar({ fecha: resumen.hoy, monto_gs: aporteDiario, nota: null });
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  async function registrarOtro(e) {
    e.preventDefault();
    setError('');
    const m = Math.round(Number(monto));
    if (!Number.isFinite(m) || m <= 0) {
      setError('Ingresá un monto válido en guaraníes.');
      return;
    }
    setCargando(true);
    try {
      await onRegistrar({ fecha, monto_gs: m, nota: nota.trim() || null });
      setMonto('');
      setNota('');
      setAbierto(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white/10 border border-white/10 p-5 shadow-card backdrop-blur-sm">
      {hoyRegistrado ? (
        <div className="text-center">
          <p className="font-display font-600 text-lg text-white">
            ✅ Aporte de hoy registrado
          </p>
          <p className="text-sm text-ocean-100/70">¡Un día más cerca del mar!</p>
        </div>
      ) : (
        <button
          onClick={registrarHoy}
          disabled={cargando}
          className="w-full rounded-2xl bg-gradient-to-br from-coral-400 to-coral-600
                     px-6 py-4 font-display font-600 text-lg sm:text-xl text-white
                     shadow-lg shadow-coral-600/30 active:scale-[0.98] transition
                     disabled:opacity-60"
        >
          {cargando ? 'Guardando…' : `Registrar aporte de hoy · ${fmtGs(aporteDiario)}`}
        </button>
      )}

      <button
        onClick={() => setAbierto((v) => !v)}
        className="mt-3 w-full text-sm text-ocean-100/80 hover:text-white transition"
      >
        {abierto ? '× Cerrar' : '+ Cargar otro monto o fecha'}
      </button>

      {abierto && (
        <form onSubmit={registrarOtro} className="mt-3 space-y-3 animate-pop">
          <div>
            <label className="block text-xs text-ocean-100/70 mb-1">Monto (Gs)</label>
            <input
              type="number"
              inputMode="numeric"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder={fmtGsCorto(aporteDiario)}
              className="w-full rounded-xl bg-ocean-950/40 border border-white/10 px-3 py-2
                         text-white placeholder:text-ocean-100/40 focus:outline-none
                         focus:ring-2 focus:ring-coral-400"
            />
          </div>
          <div>
            <label className="block text-xs text-ocean-100/70 mb-1">Fecha</label>
            <input
              type="date"
              value={fecha}
              max={resumen.hoy}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-xl bg-ocean-950/40 border border-white/10 px-3 py-2
                         text-white focus:outline-none focus:ring-2 focus:ring-coral-400"
            />
          </div>
          <div>
            <label className="block text-xs text-ocean-100/70 mb-1">Nota (opcional)</label>
            <input
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: propina extra, changa…"
              className="w-full rounded-xl bg-ocean-950/40 border border-white/10 px-3 py-2
                         text-white placeholder:text-ocean-100/40 focus:outline-none
                         focus:ring-2 focus:ring-coral-400"
            />
          </div>
          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-xl bg-ocean-500 hover:bg-ocean-400 px-4 py-2.5
                       font-600 text-white transition disabled:opacity-60"
          >
            {cargando ? 'Guardando…' : 'Guardar aporte'}
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-coral-400 text-center">{error}</p>}
    </div>
  );
}
