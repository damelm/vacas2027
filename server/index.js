import express from 'express';
import cors from 'cors';
import db, { CONFIG_DEFAULTS } from './db.js';
import { calcularResumen, calcularSerie, isoHoy } from './logic.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ---------- Helpers de acceso a datos ----------
const q = {
  listaAportes: db.prepare('SELECT * FROM aportes ORDER BY fecha DESC'),
  listaAportesAsc: db.prepare('SELECT fecha, monto_gs FROM aportes ORDER BY fecha ASC'),
  aportePorId: db.prepare('SELECT * FROM aportes WHERE id = ?'),
  aportePorFecha: db.prepare('SELECT * FROM aportes WHERE fecha = ?'),
  insertAporte: db.prepare('INSERT INTO aportes (fecha, monto_gs, nota) VALUES (?, ?, ?)'),
  updateAporte: db.prepare('UPDATE aportes SET fecha = ?, monto_gs = ?, nota = ? WHERE id = ?'),
  deleteAporte: db.prepare('DELETE FROM aportes WHERE id = ?'),
  listaConfig: db.prepare('SELECT clave, valor FROM config'),
  upsertConfig: db.prepare(
    'INSERT INTO config (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor'
  )
};

function leerConfig() {
  const cfg = { ...CONFIG_DEFAULTS };
  for (const { clave, valor } of q.listaConfig.all()) cfg[clave] = valor;
  return cfg;
}

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------- Aportes ----------
app.get('/api/aportes', (_req, res) => {
  res.json(q.listaAportes.all());
});

app.post('/api/aportes', (req, res) => {
  let { fecha, monto_gs, nota } = req.body || {};
  fecha = fecha || isoHoy();
  if (!FECHA_RE.test(fecha)) {
    return res.status(400).json({ error: 'Fecha inválida (formato YYYY-MM-DD).' });
  }
  const monto = Math.round(Number(monto_gs));
  if (!Number.isFinite(monto) || monto <= 0) {
    return res.status(400).json({ error: 'El monto en guaraníes debe ser un número positivo.' });
  }
  if (q.aportePorFecha.get(fecha)) {
    return res.status(409).json({ error: `Ya existe un aporte para el ${fecha}.` });
  }
  const info = q.insertAporte.run(fecha, monto, nota?.trim() || null);
  res.status(201).json(q.aportePorId.get(info.lastInsertRowid));
});

app.put('/api/aportes/:id', (req, res) => {
  const id = Number(req.params.id);
  const existente = q.aportePorId.get(id);
  if (!existente) return res.status(404).json({ error: 'Aporte no encontrado.' });

  const fecha = req.body?.fecha ?? existente.fecha;
  if (!FECHA_RE.test(fecha)) {
    return res.status(400).json({ error: 'Fecha inválida (formato YYYY-MM-DD).' });
  }
  const monto = req.body?.monto_gs != null ? Math.round(Number(req.body.monto_gs)) : existente.monto_gs;
  if (!Number.isFinite(monto) || monto <= 0) {
    return res.status(400).json({ error: 'El monto en guaraníes debe ser un número positivo.' });
  }
  const nota = req.body?.nota !== undefined ? (req.body.nota?.trim() || null) : existente.nota;

  const choque = q.aportePorFecha.get(fecha);
  if (choque && choque.id !== id) {
    return res.status(409).json({ error: `Ya existe un aporte para el ${fecha}.` });
  }
  q.updateAporte.run(fecha, monto, nota, id);
  res.json(q.aportePorId.get(id));
});

app.delete('/api/aportes/:id', (req, res) => {
  const id = Number(req.params.id);
  const existente = q.aportePorId.get(id);
  if (!existente) return res.status(404).json({ error: 'Aporte no encontrado.' });
  q.deleteAporte.run(id);
  res.json({ ok: true, id });
});

// ---------- Resumen ----------
app.get('/api/resumen', (_req, res) => {
  const aportes = q.listaAportesAsc.all();
  const config = leerConfig();
  res.json({
    ...calcularResumen(aportes, config),
    serie: calcularSerie(aportes, config)
  });
});

// ---------- Config ----------
app.get('/api/config', (_req, res) => {
  res.json(leerConfig());
});

app.put('/api/config', (req, res) => {
  const permitidas = Object.keys(CONFIG_DEFAULTS);
  const cambios = req.body || {};
  const setMany = db.transaction((obj) => {
    for (const [clave, valor] of Object.entries(obj)) {
      if (permitidas.includes(clave)) q.upsertConfig.run(clave, String(valor));
    }
  });
  setMany(cambios);
  res.json(leerConfig());
});

// ---------- Health ----------
app.get('/api/health', (_req, res) => res.json({ ok: true, hoy: isoHoy() }));

app.listen(PORT, () => {
  console.log(`🏖️  Vacas 2027 API escuchando en http://localhost:${PORT}`);
});
