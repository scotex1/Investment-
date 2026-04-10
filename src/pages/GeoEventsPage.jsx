import { useEffect, useState } from 'react'
import { Globe, AlertTriangle, RefreshCw, Shield, Zap } from 'lucide-react'
import { investAPI } from '@/services/api'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import PlanGate from '@/components/ui/PlanGate'
import useAuthStore from '@/store/authStore'
import clsx from 'clsx'

const EVENT_TYPE_STYLE = {
  conflict:         { color: 'rose',  icon: '⚔️' },
  sanction:         { color: 'flame', icon: '🚫' },
  election:         { color: 'azure', icon: '🗳️' },
  natural_disaster: { color: 'gold',  icon: '🌊' },
  policy:           { color: 'jade',  icon: '📋' },
}

export default function GeoEventsPage() {
  const { plan } = useAuthStore()
  const userPlan = plan?.plan || 'free'
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [tickers, setTickers] = useState('')

  if (userPlan === 'free') return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Geopolitical Events" subtitle="War & conflict impact engine — real-time global risk monitoring" />
      <PlanGate requiredPlan="Pro" feature="the Geopolitical Risk Engine" />
    </div>
  )

  const load = async () => {
    setLoading(true)
    try {
      const tickerList = tickers.split(',').map(t => t.trim()).filter(Boolean)
      const res = await investAPI.geoEvents(tickerList.length ? tickerList : undefined)
      setEvents(res.data.events || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const highImpact = events.filter(e => e.portfolio_impact_score > 0.5)
  const avgSeverity = events.length ? (events.reduce((s, e) => s + (e.severity || 0), 0) / events.length).toFixed(1) : 0

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Geopolitical Events"
        subtitle="War & conflict impact engine — real-time global risk monitoring"
        action={
          <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm py-2.5">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-glow text-center">
          <div className="font-mono text-2xl font-bold text-white">{events.length}</div>
          <div className="font-body text-xs text-slate-500 mt-1">Active Events</div>
        </div>
        <div className="card-glow text-center">
          <div className={clsx('font-mono text-2xl font-bold', highImpact.length > 0 ? 'text-rose-400' : 'text-jade-400')}>
            {highImpact.length}
          </div>
          <div className="font-body text-xs text-slate-500 mt-1">High Impact</div>
        </div>
        <div className="card-glow text-center">
          <div className={clsx('font-mono text-2xl font-bold', +avgSeverity > 3 ? 'text-flame-400' : 'text-jade-400')}>
            {avgSeverity}/5
          </div>
          <div className="font-body text-xs text-slate-500 mt-1">Avg Severity</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <input className="input-field max-w-xs" placeholder="Filter by portfolio tickers (e.g. XOM, LMT)"
          value={tickers} onChange={e => setTickers(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()} />
        <button onClick={load} className="btn-primary text-sm">Scan Portfolio</button>
      </div>

      {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

      {!loading && events.length === 0 && (
        <div className="card-glow text-center py-16">
          <Shield size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="font-body text-slate-500">No active geopolitical events detected.</p>
        </div>
      )}

      <div className="space-y-4">
        {events.map((e, i) => {
          const style = EVENT_TYPE_STYLE[e.event_type] || EVENT_TYPE_STYLE.policy
          const impact = e.portfolio_impact_score || 0
          return (
            <div key={i} className={clsx(
              'card-glow transition-all duration-200',
              impact > 0.6 ? 'border-rose-500/20' : impact > 0.3 ? 'border-gold-500/20' : ''
            )}>
              <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0">{style.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-body font-medium text-slate-200 leading-snug flex-1">{e.event_title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={clsx('badge text-[10px]',
                        e.severity >= 4 ? 'badge-red' : e.severity >= 3 ? 'badge-amber' : 'badge-green')}>
                        SEV {e.severity}/5
                      </span>
                      <span className="badge-gray text-[10px] badge capitalize">{e.event_type?.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Countries */}
                  {e.countries_involved?.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-3">
                      <Globe size={11} className="text-slate-600" />
                      <span className="font-mono text-[11px] text-slate-500">{e.countries_involved.join(', ')}</span>
                    </div>
                  )}

                  {/* Sectors */}
                  {e.affected_sectors?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {e.affected_sectors.map(s => (
                        <span key={s} className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/8 capitalize">{s}</span>
                      ))}
                    </div>
                  )}

                  {/* Impact bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-slate-600 uppercase">Portfolio Impact</span>
                      <span className={clsx('font-mono text-[10px] font-bold',
                        impact > 0.6 ? 'text-rose-400' : impact > 0.3 ? 'text-gold-400' : 'text-jade-400')}>
                        {(impact * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={clsx('h-full rounded-full',
                        impact > 0.6 ? 'bg-rose-500' : impact > 0.3 ? 'bg-gold-500' : 'bg-jade-500')}
                        style={{ width: `${impact * 100}%`, transition: 'width 1s ease-out' }} />
                    </div>
                  </div>

                  {/* Recommendation */}
                  {e.recommendation && (
                    <div className="flex items-start gap-2 p-3 bg-ink-700 rounded-xl">
                      <Zap size={12} className="text-azure-400 mt-0.5 flex-shrink-0" />
                      <p className="font-body text-xs text-slate-300 leading-relaxed">{e.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
