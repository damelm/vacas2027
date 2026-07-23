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
      {/* Hero a pantalla completa con foto real */}
      <Countdown
        fechaSalida={resumen.fecha_salida}
        destino={config?.destino}
        onAjustes={() => setConfigAbierta(true)}
      />

      {/* Contenido, montado sobre el degradado del hero */}
      <div className="relative z-10 mx-auto max-w-lg px-4 pb-16 -mt-6 space-y-5">
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

        {/* Postal motivacional de atardecer */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 shadow-card">
          <img
            src={`${import.meta.env.BASE_URL}img/sunset.jpg`}
            alt="Atardecer en la playa"
            className="h-44 w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/90 via-ocean-950/25 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4">
            <p className="font-display font-700 text-white text-xl leading-tight
                          [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
              Cada aporte te acerca al mar
            </p>
            <p className="text-white/85 text-xs mt-1 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
              Guaratuba te espera · {config?.personas || 3} viajeros · 🇵🇾 → 🇧🇷
            </p>
          </div>
        </section>

        <footer className="pt-2 text-center text-xs text-ocean-100/50">
          Asunción → Guaratuba · hecho con 🧡 y guaraníes
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
