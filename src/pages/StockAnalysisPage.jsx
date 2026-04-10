import { useState } from 'react'
import { Search, TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react'
import { investAPI } from '@/services/api'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import PlanGate from '@/components/ui/PlanGate'
import useAuthStore from '@/store/authStore'
import clsx from 'clsx'

const PERIODS = ['1mo', '3mo', '6mo', '1y', '5y']
const POPULAR = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'META', 'JPM', 'TSM', '9988.HK']

const SIGNAL_STYLE = {
  buy:  { badge: 'badge-green', icon: TrendingUp,   color: 'jade' },
  sell: { badge: 'badge-red',   icon: TrendingDown, color: 'rose' },
  hold: { badge: 'badge-gray',  icon: Minus,        color: 'slate' },
}

export default function StockAnalysisPage() {
  const { plan } = useAuthStore()
  const userPlan = plan?.plan || 'free'
  const [ticker, setTicker] = useState('')
  const [period, setPeriod] = useState('1y')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  if (userPlan === 'free') return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Stock Analysis" subtitle="Deep technical & trend analysis powered by AI" />
      <PlanGate requiredPlan="Pro" feature="Stock Analysis with AI signals" />
    </div>
  )

  const analyse = async (t = ticker) => {
    if (!t) return
    setLoading(true)
    setResult(null)
    try {
      const res = await investAPI.stock(t.toUpperCase(), period)
      setResult(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  const sig = result ? SIGNAL_STYLE[result.signal] || SIGNAL_STYLE.hold : null
  const SignalIcon = sig?.icon || Minus

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Stock Analysis" subtitle="Deep technical & trend analysis powered by AI" />

      {/* Search bar */}
      <div className="card-glow">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input-field pl-10" placeholder="Enter ticker (e.g. AAPL, TSM, 9988.HK)"
              value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && analyse()} />
          </div>
          <div className="flex gap-1.5">
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={clsx('px-3 py-2 rounded-xl font-mono text-xs transition-all',
                  period === p ? 'bg-azure-500/20 text-azure-300 border border-azure-500/30'
                               : 'text-slate-500 hover:text-slate-300 border border-white/8')}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={() => analyse()} disabled={loading || !ticker} className="btn-primary text-sm px-5">
            {loading ? <Spinner size="sm" /> : 'Analyse'}
          </button>
        </div>

        {/* Popular */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-slate-600 uppercase tracking-wider">Popular:</span>
          {POPULAR.map(t => (
            <button key={t} onClick={() => { setTicker(t); analyse(t) }}
              className="font-mono text-xs text-slate-400 hover:text-azure-400 bg-white/5 hover:bg-azure-500/10 px-2.5 py-1 rounded-lg transition-all border border-white/8 hover:border-azure-500/30">
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {result && (
        <div className="space-y-5 animate-slide-up">
          {/* Header */}
          <div className="card-glow">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-display font-bold text-3xl text-white">{result.ticker}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={clsx('badge', sig.badge)}>
                    <SignalIcon size={11} /> {result.signal.toUpperCase()}
                  </span>
                  <span className="badge-gray capitalize">{result.trend}</span>
                  <span className="font-mono text-xs text-slate-500">{result.period} period</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-3xl font-bold text-white">${result.current_price?.toFixed(2) || '—'}</div>
                <div className={clsx('font-mono text-sm font-semibold mt-1',
                  result.period_return_pct >= 0 ? 'text-jade-400' : 'text-rose-400')}>
                  {result.period_return_pct >= 0 ? '+' : ''}{result.period_return_pct}%
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Volatility (Ann.)', value: `${(result.volatility_annual * 100).toFixed(1)}%`, color: result.volatility_annual > 0.3 ? 'rose' : 'jade' },
              { label: '50-Day MA', value: result.moving_avg_50d ? `$${result.moving_avg_50d}` : '—', color: 'azure' },
              { label: '200-Day MA', value: result.moving_avg_200d ? `$${result.moving_avg_200d}` : '—', color: 'azure' },
              { label: 'Signal Confidence', value: result.signal_confidence, color: result.signal_confidence === 'high' ? 'jade' : result.signal_confidence === 'medium' ? 'gold' : 'slate' },
            ].map(m => (
              <div key={m.label} className="card-glow">
                <div className={`font-mono text-xl font-bold text-${m.color}-400 mb-1`}>{m.value}</div>
                <div className="font-body text-xs text-slate-500">{m.label}</div>
              </div>
            ))}
          </div>

          {/* AI Summary */}
          <div className="card-glow border-azure-500/15 p-5">
            <div className="flex items-start gap-3">
              <BarChart2 size={16} className="text-azure-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="label mb-1">AI Analysis Summary</div>
                <p className="font-body text-sm text-slate-300 leading-relaxed">{result.summary}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
