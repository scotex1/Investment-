import {
  LineChart as ReLineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-ink-800 border border-white/10 rounded-xl px-4 py-3 text-sm">
        <div className="font-mono text-slate-400 text-xs mb-1">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="font-mono font-semibold" style={{ color: p.color }}>
            {typeof p.value === 'number' ? `$${p.value.toLocaleString()}` : p.value}
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function LineChart({ data = [], dataKey = 'value', color = '#0ea5e9', xKey = 'label' }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ReLineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey={xKey} tick={{ fill: '#475569', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={55}
          tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
          dot={false} activeDot={{ r: 5, fill: color, strokeWidth: 0 }} />
      </ReLineChart>
    </ResponsiveContainer>
  )
}
