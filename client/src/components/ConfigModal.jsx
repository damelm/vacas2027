import { useState } from 'react';

const CAMPOS = [
  { clave: 'fecha_salida', etiqueta: 'Fecha de salida', tipo: 'date' },
  { clave: 'fecha_inicio', etiqueta: 'Inicio del ahorro', tipo: 'date' },
  { clave: 'meta_total_usd', etiqueta: 'Meta total (USD)', tipo: 'number' },
  { clave: 'aporte_diario_gs', etiqueta: 'Aporte diario (Gs)', tipo: 'number' },
  { clave: 'tipo_cambio', etiqueta: 'Tipo de cambio (Gs por 1 USD)', tipo: 'number' },
  { clave: 'personas', etiqueta: 'Personas', tipo: 'number' },
  { clave: 'destino', etiqueta: 'Destino', tipo: 'text' }
];

export default function ConfigModal({ config, onGuardar, onCerrar }) {
  const [form, setForm] = useState(() => ({ ...config }));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  function set(clave, valor) {
    setForm((f) => ({ ...f, [clave]: valor }));
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const payload = {};
      for (const { clave } of CAMPOS) payload[clave] = form[clave];
      await onGuardar(payload);
      onCerrar();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ocean-950/70 backdrop-blur-sm p-3"
      onClick={onCerrar}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={guardar}
        className="w-full max-w-md rounded-3xl bg-ocean-800 border border-white/10 p-5 shadow-card
                   max-h-[90vh] overflow-y-auto thin-scroll animate-pop"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-600 text-xl text-white">⚙️ Configuración</h3>
          <button type="button" onClick={onCerrar} className="text-ocean-100/70 hover:text-white text-xl">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {CAMPOS.map(({ clave, etiqueta, tipo }) => (
            <div key={clave}>
              <label className="block text-xs text-ocean-100/70 mb-1">{etiqueta}</label>
              <input
                type={tipo}
                value={form[clave] ?? ''}
                onChange={(e) => set(clave, e.target.value)}
                className="w-full rounded-xl bg-ocean-950/50 border border-white/10 px-3 py-2
                           text-white focus:outline-none focus:ring-2 focus:ring-coral-400"
              />
            </div>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-coral-400">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCerrar}
            className="flex-1 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 font-600 text-white transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando}
            className="flex-1 rounded-xl bg-coral-500 hover:bg-coral-400 px-4 py-2.5 font-600 text-white transition disabled:opacity-60"
          >
            {cargando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
