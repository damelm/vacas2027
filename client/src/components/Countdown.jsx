import { useEffect, useState } from 'react';
import { fmtFechaLarga } from '../lib/format.js';

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
      <div className="tabular rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm shadow-card
                      min-w-[3.6rem] sm:min-w-[5rem] border border-white/10">
        <span className="font-display font-600 text-4xl sm:text-6xl leading-none text-white drop-shadow">
          {String(valor).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-[0.65rem] sm:text-xs uppercase tracking-widest text-ocean-100/80">
        {etiqueta}
      </span>
    </div>
  );
}

export default function Countdown({ fechaSalida, destino }) {
  const [t, setT] = useState(() => calc(fechaSalida));

  useEffect(() => {
    setT(calc(fechaSalida));
    const id = setInterval(() => setT(calc(fechaSalida)), 1000);
    return () => clearInterval(id);
  }, [fechaSalida]);

  return (
    <section className="text-center">
      <div className="animate-floaty text-5xl sm:text-6xl mb-1" aria-hidden="true">
        🏖️
      </div>
      <p className="font-body text-sm sm:text-base text-ocean-100/80">
        Faltan para llegar a
      </p>
      <h1 className="font-display font-700 text-3xl sm:text-5xl text-white leading-tight">
        {destino || 'la playa'}
      </h1>

      {t.llegado ? (
        <p className="mt-6 font-display text-3xl text-coral-400 animate-pop">
          ¡Es hoy! Nos vamos de viaje 🚗🌊
        </p>
      ) : (
        <div className="mt-6 flex items-start justify-center gap-2 sm:gap-4">
          <Celda valor={t.dias} etiqueta="días" />
          <Celda valor={t.horas} etiqueta="horas" />
          <Celda valor={t.minutos} etiqueta="min" />
          <Celda valor={t.segundos} etiqueta="seg" />
        </div>
      )}

      <p className="mt-4 text-xs sm:text-sm text-ocean-100/70">
        {fmtFechaLarga(fechaSalida)}
      </p>
    </section>
  );
}
