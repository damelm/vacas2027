// Datos semilla opcionales para probar la vista con historial cargado.
// Uso:  npm run seed   (dentro de /server o vía `npm run seed` en la raíz)
import db from './db.js';
import { isoHoy, addDays, diasEntre } from './logic.js';

const config = Object.fromEntries(
  db.prepare('SELECT clave, valor FROM config').all().map((r) => [r.clave, r.valor])
);
const aporteDiario = Number(config.aporte_diario_gs) || 50000;
const fechaInicio = config.fecha_inicio;
const hoy = isoHoy();

// Genera un historial realista: mayormente cumple los 50.000 Gs, con algún
// día de más, algún monto distinto y un par de días salteados.
const totalDias = Math.max(0, diasEntre(fechaInicio, hoy)); // hasta ayer, dejamos "hoy" pendiente
const filas = [];
// Patrón pseudoaleatorio determinístico (sin depender de Math.random).
const saltear = new Set([3, 4, 11, 19]);      // días salteados
const extra = new Map([[6, 20000], [14, 30000], [22, -15000]]); // variaciones

for (let i = 0; i < totalDias; i += 1) {
  if (saltear.has(i)) continue;
  const fecha = addDays(fechaInicio, i);
  const monto = aporteDiario + (extra.get(i) || 0);
  const nota = extra.has(i) ? 'Monto ajustado' : null;
  filas.push({ fecha, monto, nota });
}

const insert = db.prepare(
  'INSERT OR REPLACE INTO aportes (fecha, monto_gs, nota) VALUES (?, ?, ?)'
);
const insertMany = db.transaction((rows) => {
  db.prepare('DELETE FROM aportes').run();
  for (const r of rows) insert.run(r.fecha, r.monto, r.nota);
});
insertMany(filas);

const total = filas.reduce((s, r) => s + r.monto, 0);
console.log(`🌱 Sembrados ${filas.length} aportes (${total.toLocaleString('es-PY')} Gs) desde ${fechaInicio} hasta ${addDays(hoy, -1)}.`);
console.log('   El aporte de hoy queda pendiente a propósito para probar la alerta.');
