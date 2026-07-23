const BASE = '/api';

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* respuesta sin cuerpo */
  }
  if (!res.ok) {
    throw new Error(data?.error || `Error ${res.status}`);
  }
  return data;
}

export const api = {
  getResumen: () => req('/resumen'),
  getAportes: () => req('/aportes'),
  crearAporte: (body) => req('/aportes', { method: 'POST', body: JSON.stringify(body) }),
  editarAporte: (id, body) => req(`/aportes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  borrarAporte: (id) => req(`/aportes/${id}`, { method: 'DELETE' }),
  getConfig: () => req('/config'),
  guardarConfig: (body) => req('/config', { method: 'PUT', body: JSON.stringify(body) })
};
