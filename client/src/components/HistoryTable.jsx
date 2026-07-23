import { useState } from 'react';
import { fmtFecha, fmtGs, fmtGsCorto } from '../lib/format.js';

function FilaEdicion({ aporte, onGuardar, onCancelar }) {
  const [monto, setMonto] = useState(String(aporte.monto_gs));
  const [fecha, setFecha] = useState(aporte.fecha);
  const [nota, setNota] = useState(aporte.nota || '');
  const [error, setError] = useState('');

  async function guardar() {
    setError('');
    const m = Math.round(Number(monto));
    if (!Number.isFinite(m) || m <= 0) {
      setError('Monto inválido');
      return;
    }
    try {
      await onGuardar(aporte.id, { fecha, monto_gs: m, nota: nota.trim() || null });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <tr className="bg-ocean-950/40">
      <td className="px-2 py-2">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full rounded-lg bg-ocean-950/60 border border-white/10 px-2 py-1 text-xs text-white"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="w-24 rounded-lg bg-ocean-950/60 border border-white/10 px-2 py-1 text-xs text-white text-right"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="text"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="—"
          className="w-full rounded-lg bg-ocean-950/60 border border-white/10 px-2 py-1 text-xs text-white"
        />
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-right">
        {error && <span className="block text-[0.6rem] text-coral-400">{error}</span>}
        <button onClick={guardar} className="text-emerald-300 hover:text-emerald-200 mr-2" title="Guardar">
          ✔
        </button>
        <button onClick={onCancelar} className="text-ocean-100/60 hover:text-white" title="Cancelar">
          ✕
        </button>
      </td>
    </tr>
  );
}

export default function HistoryTable({ aportes, onEditar, onBorrar }) {
  const [editando, setEditando] = useState(null);

  async function guardar(id, body) {
    await onEditar(id, body);
    setEditando(null);
  }

  return (
    <div className="rounded-3xl bg-white/10 border border-white/10 p-4 sm:p-5 shadow-card backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🧾</span>
        <h3 className="font-display font-600 text-lg text-white">Historial de aportes</h3>
      </div>

      {aportes.length === 0 ? (
        <p className="text-sm text-ocean-100/70 py-6 text-center">
          Todavía no cargaste ningún aporte. ¡Empezá hoy! 🌅
        </p>
      ) : (
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm text-ocean-50">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ocean-100/60 border-b border-white/10">
                <th className="px-2 py-2 font-600">Fecha</th>
                <th className="px-2 py-2 font-600 text-right">Monto</th>
                <th className="px-2 py-2 font-600">Nota</th>
                <th className="px-2 py-2 font-600 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {aportes.map((a) =>
                editando === a.id ? (
                  <FilaEdicion
                    key={a.id}
                    aporte={a}
                    onGuardar={guardar}
                    onCancelar={() => setEditando(null)}
                  />
                ) : (
                  <tr key={a.id} className="hover:bg-white/5">
                    <td className="px-2 py-2 whitespace-nowrap">{fmtFecha(a.fecha)}</td>
                    <td className="px-2 py-2 text-right tabular font-600 text-sand-200">
                      {fmtGsCorto(a.monto_gs)}
                    </td>
                    <td className="px-2 py-2 text-ocean-100/70 max-w-[10rem] truncate">
                      {a.nota || '—'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-right">
                      <button
                        onClick={() => setEditando(a.id)}
                        className="text-ocean-200 hover:text-white mr-3"
                        title="Editar"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el aporte del ${fmtFecha(a.fecha)}?`)) onBorrar(a.id);
                        }}
                        className="text-coral-400 hover:text-coral-300"
                        title="Eliminar"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td className="px-2 py-2 text-xs uppercase tracking-wide text-ocean-100/60">Total</td>
                <td className="px-2 py-2 text-right tabular font-700 text-white">
                  {fmtGs(aportes.reduce((s, a) => s + a.monto_gs, 0))}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
