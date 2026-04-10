import { useEffect, useState } from 'react'
import { Newspaper, RefreshCw, ExternalLink } from 'lucide-react'
import { investAPI } from '@/services/api'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import PlanGate from '@/components/ui/PlanGate'
import useAuthStore from '@/store/authStore'
import clsx from 'clsx'

const SENTIMENT_STYLE = {
  positive: { badge: 'badge-green',  bar: 'bg-jade-500' },
  negative: { badge: 'badge-red',    bar: 'bg-rose-500' },
  neutral:  { badge: 'badge-gray',   bar: 'bg-slate-500' },
}

const SECTOR_COLOR = {
  technology: 'badge-blue', energy: 'badge-amber', finance: 'badge-green',
  defense: 'badge-red', agriculture: 'badge-amber', shipping: 'badge-gray',
}

export default function NewsPage() {
  const { plan } = useAuthStore()
  const userPlan = plan?.plan || 'free'
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [tickers, setTickers] = useState('')

  if (userPlan === 'free') return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="News Intelligence" subtitle="Real-time financial news with AI sentiment analysis" />
      <PlanGate requiredPlan="Pro" feature="real-time news intelligence" />
    </div>
  )

  const load = async () => {
    setLoading(true)
    try {
      const tickerList = tickers.split(',').map(t => t.trim()).filter(Boolean)
      const res = await investAPI.news(tickerList.length ? tickerList : undefined)
      setNews(res.data.news || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="News Intelligence"
        subtitle="Real-time financial news with AI sentiment analysis & sector tagging"
        action={
          <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm py-2.5">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      {/* Filter */}
      <div className="flex gap-3">
        <input className="input-field max-w-xs" placeholder="Filter by tickers (e.g. AAPL, MSFT)"
          value={tickers} onChange={e => setTickers(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()} />
        <button onClick={load} className="btn-primary text-sm">Filter</button>
      </div>

      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {!loading && news.length === 0 && (
        <div className="card-glow text-center py-16">
          <Newspaper size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="font-body text-slate-500">No news found. Try refreshing or adjusting your ticker filter.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.map((n, i) => {
          const style = SENTIMENT_STYLE[n.sentiment] || SENTIMENT_STYLE.neutral
          const score = Math.abs(n.sentiment_score)
          return (
            <div key={i} className="card-glow hover:border-white/10 transition-all duration-200 group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-body font-medium text-sm text-slate-200 leading-snug flex-1 group-hover:text-white transition-colors">
                  {n.headline}
                </h3>
                <ExternalLink size={13} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0 mt-0.5 transition-colors" />
              </div>

              <p className="font-body text-xs text-slate-500 mb-3 line-clamp-2">{n.summary}</p>

              {/* Sentiment bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-600 uppercase tracking-wider">Sentiment</span>
                  <span className="font-mono text-[10px] text-slate-500">{(score * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className={clsx('h-full rounded-full transition-all duration-500', style.bar)}
                    style={{ width: `${score * 100}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={clsx('badge text-[10px]', style.badge)}>{n.sentiment}</span>
                {n.affected_sectors?.slice(0, 3).map(s => (
                  <span key={s} className={clsx('badge text-[10px]', SECTOR_COLOR[s] || 'badge-gray')}>{s}</span>
                ))}
                <span className="ml-auto font-mono text-[10px] text-slate-600">{n.source}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
