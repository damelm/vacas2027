import { useCallback, useEffect, useState } from 'react';
import { api } from './lib/api.js';
import Countdown from './components/Countdown.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import AporteButton from './components/AporteButton.jsx';
import StatChips from './components/StatChips.jsx';
import PendingAlert from './components/PendingAlert.jsx';
import Projection from './components/Projection.jsx';
import SavingsChart from './components/SavingsChart.jsx';
import HistoryTable from './components/HistoryTable.jsx';
import ConfigModal from './components/ConfigModal.jsx';

export default function App() {
  const [resumen, setResumen] = useState(null);
  const [aportes, setAportes] = useState([]);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [ponerseAlDia, setPonerseAlDia] = useState(false);
  const [configAbierta, setConfigAbierta] = useState(false);

  const recargar = useCallback(async () => {
    const [r, a, c] = await Promise.all([api.getResumen(), api.getAportes(), api.getConfig()]);
    setResumen(r);
    setAportes(a);
    setConfig(c);
  }, []);

  useEffect(() => {
    recargar()
      .catch((e) => setError(e.message))
      .finally(() => setCargandoInicial(false));
  }, [recargar]);

  const registrarAporte = useCallback(
    async (body) => {
      await api.crearAporte(body);
      await recargar();
    },
    [recargar]
  );

  const editarAporte = useCallback(
    async (id, body) => {
      await api.editarAporte(id, body);
      await recargar();
    },
    [recargar]
  );

  const borrarAporte = useCallback(
    async (id) => {
      await api.borrarAporte(id);
      await recargar();
    },
    [recargar]
  );

  const guardarConfig = useCallback(
    async (payload) => {
      const c = await api.guardarConfig(payload);
      setConfig(c);
      await recargar();
    },
    [recargar]
  );

  async function handlePonerseAlDia() {
    if (!resumen) return;
    setPonerseAlDia(true);
    try {
      await registrarAporte({
        fecha: resumen.hoy,
        monto_gs: resumen.monto_al_dia_gs,
        nota: 'Ponerse al día'
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setPonerseAlDia(false);
    }
  }

  if (cargandoInicial) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-display text-xl text-white animate-floaty">🏖️ Cargando el viaje…</p>
      </div>
    );
  }

  if (error && !resumen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-2xl">😵‍💫</p>
        <p className="text-white font-600">No se pudo conectar con el servidor.</p>
        <p className="text-ocean-100/70 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-coral-500 px-4 py-2 font-600 text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const hoyRegistrado = aportes.some((a) => a.fecha === resumen.hoy);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-lg px-4 pb-16 pt-8 space-y-5">
        <header className="flex items-center justify-between">
          <span className="font-display font-600 text-sm text-ocean-100/80 tracking-wide">
            🌴 Vacas 2027
          </span>
          <button
            onClick={() => setConfigAbierta(true)}
            className="rounded-full bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 text-sm text-white transition"
          >
            ⚙️ Ajustes
          </button>
        </header>

        <Countdown fechaSalida={resumen.fecha_salida} destino={config?.destino} />

        <ProgressBar resumen={resumen} />

        <AporteButton
          resumen={resumen}
          hoyRegistrado={hoyRegistrado}
          onRegistrar={registrarAporte}
        />

        <PendingAlert
          resumen={resumen}
          onPonerseAlDia={handlePonerseAlDia}
          cargando={ponerseAlDia}
        />

        <StatChips resumen={resumen} />

        <Projection resumen={resumen} />

        <SavingsChart serie={resumen.serie} />

        <HistoryTable aportes={aportes} onEditar={editarAporte} onBorrar={borrarAporte} />

        <footer className="pt-4 text-center text-xs text-ocean-100/50">
          Asunción → Guaratuba · {config?.personas || 3} viajeros · hecho con 🧡 y guaraníes
        </footer>
      </div>

      {configAbierta && config && (
        <ConfigModal
          config={config}
          onGuardar={guardarConfig}
          onCerrar={() => setConfigAbierta(false)}
        />
      )}
    </div>
  );
}
