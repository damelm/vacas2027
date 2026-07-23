# 🏖️ Vacas 2027 · Cuenta regresiva + tracker de ahorro

Aplicación web personal para la familia que viaja de **Asunción (Paraguay)** a
**Guaratuba, litoral de Paraná (Brasil)** en auto. Combina una **cuenta regresiva
en vivo** hasta la salida con un **tracker de ahorro diario** en guaraníes.

- 📅 **Salida objetivo:** 16 de febrero de 2027
- 👨‍👩‍👧 **Viajan:** 3 personas
- 🎯 **Meta de ahorro:** 1.500 USD (referencial, configurable)
- 💵 **Aporte diario:** 50.000 Gs
- 🪙 **Moneda principal:** guaraní (PYG), con conversión a USD configurable

## ✨ Funcionalidades

- Cuenta regresiva grande y en vivo: días, horas, minutos y segundos.
- Barra de progreso del ahorro (en guaraníes y su equivalente en USD).
- Botón **"Registrar aporte de hoy"** con un click (50.000 Gs), o un monto distinto.
- Indicador de **racha** de días consecutivos cumplidos.
- **Alerta** de días pendientes con el monto exacto para ponerse al día.
- **Historial** de aportes en tabla, con editar y eliminar.
- **Gráfico** de línea: ahorro real acumulado vs. la línea ideal de 50.000 Gs/día.
- **Proyección**: al ritmo actual, en qué fecha se alcanza la meta.

## 🧱 Stack

| Capa      | Tecnología                          |
| --------- | ----------------------------------- |
| Frontend  | React + Vite + TailwindCSS + Recharts |
| Backend   | Node.js + Express                   |
| Base datos| SQLite (better-sqlite3), archivo local |
| Auth      | ninguna (uso personal)              |

## 🚀 Instalación

Requiere **Node.js 18+** (probado en Node 22).

```bash
# 1. Instalar dependencias de la raíz, backend y frontend
npm run install:all
```

## ▶️ Arranque

```bash
# Levanta backend (:3001) y frontend (:5173) juntos
npm run dev
```

Luego abrí **http://localhost:5173** en el navegador (el frontend proxea `/api`
hacia el backend automáticamente).

### Datos semilla (opcional)

Para probar la vista con historial ya cargado:

```bash
npm run seed
```

Genera aportes desde la fecha de inicio configurada hasta ayer (dejando el
aporte de **hoy** pendiente a propósito, para ver la alerta de "ponerse al día").

> ⚠️ `npm run seed` **borra** los aportes existentes antes de sembrar.

## 🌐 Publicar en GitHub Pages (sin servidor)

GitHub Pages solo sirve archivos estáticos, así que **no puede correr el backend**.
Para eso, la app tiene un **modo estático** que guarda los datos en el navegador
(`localStorage`) en vez de en el servidor. Funciona 100% en Pages, gratis.

> 📱 Los datos quedan guardados **en ese dispositivo/navegador**. Ideal para uso
> personal desde el celular. Si la abrís en otro dispositivo, tendrá su propio
> historial (no se sincronizan).

### Activar Pages (una sola vez)

1. Andá a **Settings → Pages** en el repo de GitHub.
2. En **Source**, elegí **"GitHub Actions"**.

Con eso, cada push a `main` dispara el workflow `.github/workflows/deploy-pages.yml`,
que hace el build estático y lo publica. La URL queda en:

```
https://<tu-usuario>.github.io/<nombre-del-repo>/
```

Para probar el build estático localmente:

```bash
npm run build --prefix client -- --base=/  # o: cd client && npm run build:pages
npm run preview --prefix client
```

## 📡 API REST

Base: `http://localhost:3001/api`

| Método | Ruta            | Descripción                                                   |
| ------ | --------------- | ------------------------------------------------------------- |
| GET    | `/aportes`      | Lista todos los aportes                                       |
| POST   | `/aportes`      | Crea un aporte `{ fecha, monto_gs, nota }`                    |
| PUT    | `/aportes/:id`  | Edita un aporte                                               |
| DELETE | `/aportes/:id`  | Elimina un aporte                                             |
| GET    | `/resumen`      | Total, % de meta, racha, días restantes, proyección y serie  |
| GET    | `/config`       | Configuración actual                                          |
| PUT    | `/config`       | Edita fecha de salida, meta total, aporte diario, tipo de cambio… |

### Ejemplos

```bash
# Registrar el aporte de hoy (50.000 Gs)
curl -X POST http://localhost:3001/api/aportes \
  -H 'Content-Type: application/json' \
  -d '{"monto_gs": 50000}'

# Ver el resumen
curl http://localhost:3001/api/resumen

# Cambiar el tipo de cambio referencial
curl -X PUT http://localhost:3001/api/config \
  -H 'Content-Type: application/json' \
  -d '{"tipo_cambio": "7450"}'
```

## 🗄️ Esquema de base de datos

```sql
aportes(id INTEGER PK, fecha DATE UNIQUE, monto_gs INTEGER, nota TEXT, created_at TEXT)
config(clave TEXT PRIMARY KEY, valor TEXT)
```

Claves de `config`: `destino`, `origen`, `personas`, `fecha_inicio`,
`fecha_salida`, `meta_total_usd`, `aporte_diario_gs`, `tipo_cambio`.

El archivo SQLite vive en `server/data/vacas.db` (ignorado por git).

## 📁 Estructura

```
vacas2027/
├── package.json          # scripts raíz (dev, seed, build)
├── server/               # API Express + SQLite
│   ├── index.js          # rutas REST
│   ├── db.js             # conexión + esquema + config por defecto
│   ├── logic.js          # racha, proyección, resumen y serie
│   └── seed.js           # datos de prueba
└── client/               # frontend React + Vite + Tailwind
    └── src/
        ├── App.jsx
        ├── components/    # Countdown, ProgressBar, AporteButton, …
        └── lib/          # api.js, format.js
```

## 📜 Scripts npm

| Script                | Qué hace                                          |
| --------------------- | ------------------------------------------------- |
| `npm run install:all` | Instala dependencias de raíz, server y client     |
| `npm run dev`         | Levanta backend y frontend juntos                 |
| `npm run seed`        | Carga datos semilla de prueba                     |
| `npm run build`       | Build de producción del frontend                  |
| `npm start`           | Corre solo el backend                             |

## 🖼️ Créditos de las fotos

Las imágenes de `client/public/img/` (playa, mar y atardecer) son de
[Unsplash](https://unsplash.com), de uso libre bajo su licencia.

---

Hecho con 🧡 y guaraníes. ¡Nos vemos en la playa! 🌊
