// Lógica de negocio pura (misma que el backend), para el modo estático que
// corre 100% en el navegador (GitHub Pages, sin servidor).
// Trabaja con fechas ISO local "YYYY-MM-DD" (los aportes son por día calendario).

export function isoHoy(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function addDays(iso, n) {
  const dt = parseISO(iso);
  dt.setDate(dt.getDate() + n);
  return isoHoy(dt);
}

export function diasEntre(a, b) {
  const ms = parseISO(b) - parseISO(a);
  return Math.round(ms / 86_400_000);
}

export function calcularRacha(fechasSet, hoy) {
  let cursor = hoy;
  if (!fechasSet.has(cursor)) {
    cursor = addDays(cursor, -1); // gracia: el aporte de hoy quizá aún no se cargó
  }
  let racha = 0;
  while (fechasSet.has(cursor)) {
    racha += 1;
    cursor = addDays(cursor, -1);
  }
  return racha;
}

export function calcularResumen(aportes, config) {
  const hoy = isoHoy();
  const metaUsd = Number(config.meta_total_usd) || 0;
  const tipoCambio = Number(config.tipo_cambio) || 0;
  const aporteDiario = Number(config.aporte_diario_gs) || 0;
  const fechaInicio = config.fecha_inicio;
  const fechaSalida = config.fecha_salida;

  const metaGs = Math.round(metaUsd * tipoCambio);
  const acumuladoGs = aportes.reduce((s, a) => s + a.monto_gs, 0);
  const acumuladoUsd = tipoCambio > 0 ? acumuladoGs / tipoCambio : 0;
  const porcentaje = metaGs > 0 ? Math.min(100, (acumuladoGs / metaGs) * 100) : 0;

  const fechasSet = new Set(aportes.map((a) => a.fecha));
  const racha = calcularRacha(fechasSet, hoy);

  const diasTranscurridos = Math.max(0, diasEntre(fechaInicio, hoy) + 1);
  const esperadoHoyGs = diasTranscurridos * aporteDiario;

  let diasRegistrados = 0;
  for (let i = 0; i < diasTranscurridos; i += 1) {
    if (fechasSet.has(addDays(fechaInicio, i))) diasRegistrados += 1;
  }
  const diasPendientes = Math.max(0, diasTranscurridos - diasRegistrados);
  const montoAlDiaGs = Math.max(0, esperadoHoyGs - acumuladoGs);

  const diasRestantes = Math.max(0, diasEntre(hoy, fechaSalida));

  let proyeccion = null;
  const fechasOrdenadas = aportes.map((a) => a.fecha).sort();
  if (aportes.length > 0 && acumuladoGs > 0) {
    const primeraFecha = fechasOrdenadas[0];
    const diasActivos = Math.max(1, diasEntre(primeraFecha, hoy) + 1);
    const ritmoDiario = acumuladoGs / diasActivos;
    const restanteGs = Math.max(0, metaGs - acumuladoGs);
    if (acumuladoGs >= metaGs) {
      proyeccion = { fecha: hoy, dias: 0, ritmo_diario_gs: Math.round(ritmoDiario), alcanzada: true, llegaATiempo: true };
    } else if (ritmoDiario > 0) {
      const diasFaltantes = Math.ceil(restanteGs / ritmoDiario);
      const fechaProyectada = addDays(hoy, diasFaltantes);
      proyeccion = {
        fecha: fechaProyectada,
        dias: diasFaltantes,
        ritmo_diario_gs: Math.round(ritmoDiario),
        alcanzada: false,
        llegaATiempo: diasEntre(fechaProyectada, fechaSalida) >= 0
      };
    }
  }

  return {
    hoy,
    meta_total_usd: metaUsd,
    meta_total_gs: metaGs,
    tipo_cambio: tipoCambio,
    aporte_diario_gs: aporteDiario,
    acumulado_gs: acumuladoGs,
    acumulado_usd: Math.round(acumuladoUsd * 100) / 100,
    restante_gs: Math.max(0, metaGs - acumuladoGs),
    porcentaje: Math.round(porcentaje * 100) / 100,
    racha,
    dias_transcurridos: diasTranscurridos,
    dias_registrados: diasRegistrados,
    dias_pendientes: diasPendientes,
    monto_al_dia_gs: montoAlDiaGs,
    esperado_hoy_gs: esperadoHoyGs,
    dias_restantes: diasRestantes,
    fecha_salida: fechaSalida,
    fecha_inicio: fechaInicio,
    total_aportes: aportes.length,
    proyeccion
  };
}

export function calcularSerie(aportes, config) {
  const aporteDiario = Number(config.aporte_diario_gs) || 0;
  const fechaInicio = config.fecha_inicio;
  const hoy = isoHoy();

  const porFecha = new Map();
  for (const a of aportes) {
    porFecha.set(a.fecha, (porFecha.get(a.fecha) || 0) + a.monto_gs);
  }
  const ultimaFecha = aportes.length
    ? aportes.map((a) => a.fecha).sort().at(-1)
    : hoy;
  const fin = diasEntre(hoy, ultimaFecha) > 0 ? ultimaFecha : hoy;
  const totalDias = Math.max(0, diasEntre(fechaInicio, fin));

  const serie = [];
  let acumulado = 0;
  for (let i = 0; i <= totalDias; i += 1) {
    const fecha = addDays(fechaInicio, i);
    acumulado += porFecha.get(fecha) || 0;
    const soloHastaHoy = diasEntre(fecha, hoy) >= 0;
    serie.push({
      fecha,
      real: soloHastaHoy ? acumulado : null,
      ideal: (i + 1) * aporteDiario
    });
  }
  return serie;
}
