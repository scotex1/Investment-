import clsx from 'clsx'

export default function StatCard({ label, value, sub, icon: Icon, color = 'azure', trend }) {
  const colors = {
    azure: 'text-azure-400 bg-azure-500/10 border-azure-500/20',
    jade:  'text-jade-400 bg-jade-500/10 border-jade-500/20',
    flame: 'text-flame-400 bg-flame-500/10 border-flame-500/20',
    rose:  'text-rose-400 bg-rose-500/10 border-rose-500/20',
    gold:  'text-gold-400 bg-gold-500/10 border-gold-500/20',
  }

  return (
    <div className="card-glow group hover:border-white/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className={clsx('w-10 h-10 rounded-xl border flex items-center justify-center', colors[color])}>
            <Icon size={18} />
          </div>
        )}
        {trend !== undefined && (
          <span className={clsx('text-xs font-mono font-semibold', trend >= 0 ? 'text-jade-400' : 'text-rose-400')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="font-mono text-[11px] text-slate-600 mt-1">{sub}</div>}
    </div>
  )
}
