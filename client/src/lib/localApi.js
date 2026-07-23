// Backend "de bolsillo": corre 100% en el navegador con localStorage.
// Se usa en el build estático de GitHub Pages (VITE_STORAGE=local), donde no
// hay servidor. Replica exactamente la interfaz de api.js y las validaciones.
import { calcularResumen, calcularSerie, isoHoy } from './logic.js';

const K_APORTES = 'vacas2027:aportes';
const K_CONFIG = 'vacas2027:config';
const K_SEQ = 'vacas2027:seq';

const CONFIG_DEFAULTS = {
  destino: 'Guaratuba, Paraná, Brasil',
  origen: 'Asunción, Paraguay',
  personas: '3',
  fecha_inicio: '2026-07-01',
  fecha_salida: '2027-02-16',
  meta_total_usd: '1500',
  aporte_diario_gs: '50000',
  tipo_cambio: '7300'
};

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

function leer(clave, fallback) {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function escribir(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function leerAportes() {
  return leer(K_APORTES, []);
}
function leerConfig() {
  return { ...CONFIG_DEFAULTS, ...leer(K_CONFIG, {}) };
}
function siguienteId() {
  const n = (Number(localStorage.getItem(K_SEQ)) || 0) + 1;
  localStorage.setItem(K_SEQ, String(n));
  return n;
}

function ordenarDesc(aportes) {
  return [...aportes].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
}

// Pequeño delay opcional para simular async; mantiene la misma forma de Promise.
const ok = (v) => Promise.resolve(v);
const fail = (msg) => Promise.reject(new Error(msg));

export const localApi = {
  getAportes: () => ok(ordenarDesc(leerAportes())),

  getConfig: () => ok(leerConfig()),

  getResumen: () => {
    const aportes = [...leerAportes()].sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
    const config = leerConfig();
    return ok({ ...calcularResumen(aportes, config), serie: calcularSerie(aportes, config) });
  },

  crearAporte: ({ fecha, monto_gs, nota } = {}) => {
    fecha = fecha || isoHoy();
    if (!FECHA_RE.test(fecha)) return fail('Fecha inválida (formato YYYY-MM-DD).');
    const monto = Math.round(Number(monto_gs));
    if (!Number.isFinite(monto) || monto <= 0) {
      return fail('El monto en guaraníes debe ser un número positivo.');
    }
    const aportes = leerAportes();
    if (aportes.some((a) => a.fecha === fecha)) {
      return fail(`Ya existe un aporte para el ${fecha}.`);
    }
    const nuevo = {
      id: siguienteId(),
      fecha,
      monto_gs: monto,
      nota: (nota && nota.trim()) || null,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    aportes.push(nuevo);
    escribir(K_APORTES, aportes);
    return ok(nuevo);
  },

  editarAporte: (id, body = {}) => {
    const aportes = leerAportes();
    const idx = aportes.findIndex((a) => a.id === Number(id));
    if (idx === -1) return fail('Aporte no encontrado.');
    const actual = aportes[idx];

    const fecha = body.fecha ?? actual.fecha;
    if (!FECHA_RE.test(fecha)) return fail('Fecha inválida (formato YYYY-MM-DD).');
    const monto = body.monto_gs != null ? Math.round(Number(body.monto_gs)) : actual.monto_gs;
    if (!Number.isFinite(monto) || monto <= 0) {
      return fail('El monto en guaraníes debe ser un número positivo.');
    }
    const nota = body.nota !== undefined ? (body.nota?.trim() || null) : actual.nota;

    if (aportes.some((a) => a.fecha === fecha && a.id !== actual.id)) {
      return fail(`Ya existe un aporte para el ${fecha}.`);
    }
    const actualizado = { ...actual, fecha, monto_gs: monto, nota };
    aportes[idx] = actualizado;
    escribir(K_APORTES, aportes);
    return ok(actualizado);
  },

  borrarAporte: (id) => {
    const aportes = leerAportes();
    const idx = aportes.findIndex((a) => a.id === Number(id));
    if (idx === -1) return fail('Aporte no encontrado.');
    aportes.splice(idx, 1);
    escribir(K_APORTES, aportes);
    return ok({ ok: true, id: Number(id) });
  },

  guardarConfig: (payload = {}) => {
    const permitidas = Object.keys(CONFIG_DEFAULTS);
    const config = leerConfig();
    for (const [clave, valor] of Object.entries(payload)) {
      if (permitidas.includes(clave)) config[clave] = String(valor);
    }
    escribir(K_CONFIG, config);
    return ok(config);
  }
};
