import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { fmtFecha, fmtGs } from '../lib/format.js';

function TooltipBox({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-ocean-950/90 border border-white/10 px-3 py-2 text-xs shadow-card">
      <p className="text-ocean-100/80 mb-1">{fmtFecha(label)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey === 'real' ? 'Real' : 'Ideal'}: {fmtGs(p.value)}
        </p>
      ))}
    </div>
  );
}

const millones = (v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}k`);

export default function SavingsChart({ serie }) {
  const datos = serie || [];

  return (
    <div className="rounded-3xl bg-white/10 border border-white/10 p-4 sm:p-5 shadow-card backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📈</span>
        <h3 className="font-display font-600 text-lg text-white">Real vs. ideal</h3>
      </div>

      {datos.length === 0 ? (
        <p className="text-sm text-ocean-100/70 py-8 text-center">
          Todavía no hay datos para graficar.
        </p>
      ) : (
        <div className="h-64 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datos} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="fecha"
                tickFormatter={fmtFecha}
                tick={{ fill: 'rgba(234,252,255,0.6)', fontSize: 10 }}
                minTickGap={28}
              />
              <YAxis
                tickFormatter={millones}
                tick={{ fill: 'rgba(234,252,255,0.6)', fontSize: 10 }}
                width={38}
              />
              <Tooltip content={<TooltipBox />} />
              <Legend
                formatter={(v) => (v === 'real' ? 'Ahorro real' : 'Ideal 50.000/día')}
                wrapperStyle={{ fontSize: 12, color: 'rgba(234,252,255,0.8)' }}
              />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#e6ad4d"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="real"
                stroke="#ff6b3d"
                strokeWidth={3}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
