// Formateo de guaraníes con separador de miles al estilo paraguayo (50.000 Gs).
export function fmtGs(valor) {
  const n = Math.round(Number(valor) || 0);
  return `${n.toLocaleString('es-PY')} Gs`;
}

export function fmtGsCorto(valor) {
  const n = Math.round(Number(valor) || 0);
  return n.toLocaleString('es-PY');
}

export function fmtUsd(valor) {
  const n = Number(valor) || 0;
  return `US$ ${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

const MESES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
];

// "2027-02-16" -> "16 feb 2027"
export function fmtFecha(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MESES[m - 1]} ${y}`;
}

// "2027-02-16" -> "martes 16 de febrero"
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES_LARGO = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];
export function fmtFechaLarga(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return `${DIAS[dt.getDay()]} ${d} de ${MESES_LARGO[m - 1]} de ${y}`;
}
