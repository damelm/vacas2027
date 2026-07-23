import { useEffect, useState } from 'react';
import { fmtFechaLarga } from '../lib/format.js';

const HERO = `${import.meta.env.BASE_URL}img/hero-beach.jpg`;

// Cuenta regresiva en vivo hasta la fecha de salida (00:00 hora local).
function calc(target) {
  const now = new Date();
  const dest = new Date(`${target}T00:00:00`);
  let diff = Math.max(0, dest - now);
  const dias = Math.floor(diff / 86_400_000);
  diff -= dias * 86_400_000;
  const horas = Math.floor(diff / 3_600_000);
  diff -= horas * 3_600_000;
  const minutos = Math.floor(diff / 60_000);
  diff -= minutos * 60_000;
  const segundos = Math.floor(diff / 1000);
  return { dias, horas, minutos, segundos, llegado: dest - now <= 0 };
}

function Celda({ valor, etiqueta }) {
  return (
    <div className="flex flex-col items-center">
      <div className="tabular rounded-2xl bg-white/15 px-2.5 py-2 sm:px-3.5 backdrop-blur-md
                      min-w-[3.7rem] sm:min-w-[5.2rem] border border-white/25 shadow-lg shadow-black/20">
        <span className="font-display font-600 text-4xl sm:text-6xl leading-none text-white
                         [text-shadow:0_2px_12px_rgba(0,0,0,0.4)]">
          {String(valor).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-[0.65rem] sm:text-xs uppercase tracking-widest text-white/85
                       [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
        {etiqueta}
      </span>
    </div>
  );
}

export default function Countdown({ fechaSalida, destino, onAjustes }) {
  const [t, setT] = useState(() => calc(fechaSalida));

  useEffect(() => {
    setT(calc(fechaSalida));
    const id = setInterval(() => setT(calc(fechaSalida)), 1000);
    return () => clearInterval(id);
  }, [fechaSalida]);

  const titulo = (destino || 'la playa').split(',')[0];

  return (
    <section className="relative min-h-[27rem] sm:min-h-[32rem] overflow-hidden">
      {/* Foto real del litoral */}
      <img
        src={HERO}
        alt="Playa del litoral de Paraná, Brasil"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        fetchpriority="high"
      />
      {/* Veladuras para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-ocean-950/10 to-ocean-950" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />

      <div className="relative flex min-h-[27rem] sm:min-h-[32rem] flex-col
                      px-4 pt-[calc(env(safe-area-inset-top)+0.9rem)] pb-9">
        {/* Barra superior */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-xs font-700
                           tracking-wide text-white border border-white/25 shadow">
            🌴 Vacas 2027
          </span>
          <button
            onClick={onAjustes}
            aria-label="Ajustes"
            className="rounded-full bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5
                       text-sm text-white border border-white/25 shadow transition active:scale-95"
          >
            ⚙️ Ajustes
          </button>
        </div>

        {/* Contenido centrado abajo */}
        <div className="flex-1 flex flex-col items-center justify-end text-center">
          <span className="mb-3 rounded-full bg-coral-500/95 px-3.5 py-1 text-xs font-700 text-white
                           shadow-lg shadow-coral-900/30">
            🇵🇾 Asunción&nbsp; → &nbsp;Guaratuba 🇧🇷
          </span>

          <p className="text-white/85 text-sm [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
            Faltan para llegar a
          </p>
          <h1 className="font-display font-700 text-5xl sm:text-7xl text-white leading-none
                         [text-shadow:0_3px_20px_rgba(0,0,0,0.45)]">
            {titulo}
          </h1>

          {t.llegado ? (
            <p className="mt-6 font-display text-3xl text-white animate-pop
                          [text-shadow:0_2px_14px_rgba(0,0,0,0.5)]">
              ¡Es hoy! Nos vamos de viaje 🚗🌊
            </p>
          ) : (
            <div className="mt-5 flex items-start justify-center gap-2 sm:gap-3">
              <Celda valor={t.dias} etiqueta="días" />
              <Celda valor={t.horas} etiqueta="horas" />
              <Celda valor={t.minutos} etiqueta="min" />
              <Celda valor={t.segundos} etiqueta="seg" />
            </div>
          )}

          <p className="mt-4 text-xs sm:text-sm text-white/80 [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
            {fmtFechaLarga(fechaSalida)}
          </p>
        </div>
      </div>
    </section>
  );
}
