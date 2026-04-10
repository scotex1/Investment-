import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4']

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-ink-800 border border-white/10 rounded-xl px-4 py-3 text-sm">
        <div className="font-display font-semibold text-white">{payload[0].name}</div>
        <div className="font-mono text-azure-400">{payload[0].value.toFixed(1)}%</div>
      </div>
    )
  }
  return null
}

export default function PortfolioChart({ holdings = [] }) {
  if (!holdings.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-600 font-body text-sm">
        No holdings to display
      </div>
    )
  }

  const total = holdings.reduce((sum, h) => sum + (h.quantity * (h.current_price || h.avg_buy_price)), 0)
  const data = holdings.map(h => ({
    name: h.ticker,
    value: total > 0 ? ((h.quantity * (h.current_price || h.avg_buy_price)) / total * 100) : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
          paddingAngle={3} dataKey="value" strokeWidth={0}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.9} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle" iconSize={8}
          formatter={(v) => <span className="text-xs font-mono text-slate-400">{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
