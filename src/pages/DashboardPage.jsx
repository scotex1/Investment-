import { useEffect, useState } from 'react'
import { TrendingUp, DollarSign, ShieldCheck, Globe, Newspaper, ArrowUpRight, AlertTriangle, Activity } from 'lucide-react'
import { investAPI } from '@/services/api'
import useAuthStore from '@/store/authStore'
import StatCard from '@/components/ui/StatCard'
import PageHeader from '@/components/ui/PageHeader'
import PortfolioChart from '@/components/charts/PortfolioChart'
import Spinner from '@/components/ui/Spinner'
import clsx from 'clsx'
import { Link } from 'react-router-dom'

const SEVERITY_COLOR = [, 'jade', 'jade', 'gold', 'flame', 'rose']
const SENTIMENT_BADGE = { positive: 'badge-green', negative: 'badge-red', neutral: 'badge-gray' }

export default function DashboardPage() {
  const { user, plan } = useAuthStore()
  const userPlan = plan?.plan || 'free'
  const [portfolio, setPortfolio] = useState(null)
  const [news, setNews] = useState([])
  const [geo, setGeo] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const p = await investAPI.report()
        setPortfolio(p.data)
        if (userPlan !== 'free') {
          const [n, g] = await Promise.allSettled([
            investAPI.news(),
            investAPI.geoEvents(),
          ])
          if (n.status === 'fulfilled') setNews(n.value.data.news?.slice(0, 4) || [])
          if (g.status === 'fulfilled') setGeo(g.value.data.events?.slice(0, 3) || [])
        }
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  )

  const totalValue = portfolio?.total_portfolio_value || 0
  const geoRisk = portfolio?.overall_geo_risk_score || 0
  const riskScore = portfolio?.risk_profile?.score
  const holdings = portfolio?.holdings || []

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={`Good morning, ${user?.username} 👋`}
        subtitle="Here's your investment intelligence summary"
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Portfolio Value" value={`$${totalValue.toLocaleString()}`}
          icon={DollarSign} color="azure" sub="Total holdings value" />
        <StatCard label="Risk Score" value={riskScore ? `${riskScore}/10` : '—'}
          icon={ShieldCheck} color={riskScore > 7 ? 'rose' : riskScore > 4 ? 'gold' : 'jade'}
          sub={portfolio?.risk_profile?.level || 'Not assessed'} />
        <StatCard label="Geo Risk Level"
          value={geoRisk > 0.6 ? 'HIGH' : geoRisk > 0.3 ? 'MED' : 'LOW'}
          icon={Globe}
          color={geoRisk > 0.6 ? 'rose' : geoRisk > 0.3 ? 'gold' : 'jade'}
          sub={`Score: ${(geoRisk * 100).toFixed(0)}%`} />
        <StatCard label="Holdings" value={holdings.length || 0}
          icon={Activity} color="azure" sub="Active positions" />
      </div>

      {/* AI Summary banner */}
      {portfolio?.advisory_summary && (
        <div className="p-4 bg-azure-500/8 border border-azure-500/20 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-azure-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Activity size={13} className="text-azure-400" />
            </div>
            <div>
              <div className="font-display font-semibold text-azure-300 text-xs uppercase tracking-widest mb-1">AI Advisory Summary</div>
              <p className="font-body text-slate-300 text-sm leading-relaxed">{portfolio.advisory_summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Middle row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Portfolio chart */}
        <div className="card-glow xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-base">Allocation</h3>
            <Link to="/portfolio" className="text-xs text-azure-400 hover:text-azure-300 flex items-center gap-1 font-body">
              Manage <ArrowUpRight size={12} />
            </Link>
          </div>
          <PortfolioChart holdings={holdings} />
        </div>

        {/* Rebalancing suggestion */}
        <div className="card-glow xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-base">Rebalancing Intelligence</h3>
            {portfolio?.rebalancing_suggestion?.rebalancing_needed && (
              <span className="badge-amber">Action needed</span>
            )}
          </div>
          {portfolio?.rebalancing_suggestion ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-ink-700 rounded-xl p-3 text-center">
                  <div className="font-mono text-lg font-bold text-jade-400">
                    {(portfolio.rebalancing_suggestion.expected_annual_return * 100).toFixed(1)}%
                  </div>
                  <div className="font-body text-xs text-slate-500 mt-1">Expected Return</div>
                </div>
                <div className="bg-ink-700 rounded-xl p-3 text-center">
                  <div className="font-mono text-lg font-bold text-gold-400">
                    {(portfolio.rebalancing_suggestion.estimated_volatility * 100).toFixed(1)}%
                  </div>
                  <div className="font-body text-xs text-slate-500 mt-1">Volatility</div>
                </div>
                <div className="bg-ink-700 rounded-xl p-3 text-center">
                  <div className="font-mono text-lg font-bold text-azure-400">
                    {portfolio.rebalancing_suggestion.sharpe_ratio}
                  </div>
                  <div className="font-body text-xs text-slate-500 mt-1">Sharpe Ratio</div>
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(portfolio.rebalancing_suggestion.suggested_weights || {}).slice(0, 5).map(([ticker, weight]) => (
                  <div key={ticker} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-400 w-12">{ticker}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-azure-500 rounded-full transition-all duration-500"
                        style={{ width: `${(weight * 100).toFixed(0)}%` }} />
                    </div>
                    <span className="font-mono text-xs text-white w-10 text-right">{(weight * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              <p className="font-body text-xs text-slate-500 mt-2">{portfolio.rebalancing_suggestion.notes}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TrendingUp size={28} className="text-slate-600 mb-3" />
              <p className="font-body text-sm text-slate-500">Add holdings to get AI rebalancing suggestions</p>
              <Link to="/portfolio" className="mt-3 text-azure-400 text-xs hover:underline">Add holdings →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row — News + Geo Events */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* News */}
        <div className="card-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-base flex items-center gap-2">
              <Newspaper size={16} className="text-azure-400" /> News Intel
            </h3>
            <Link to="/news" className="text-xs text-azure-400 hover:text-azure-300 flex items-center gap-1 font-body">
              All news <ArrowUpRight size={12} />
            </Link>
          </div>
          {news.length > 0 ? (
            <div className="space-y-3">
              {news.map((n, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-ink-700 rounded-xl hover:bg-ink-600 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-slate-300 leading-snug line-clamp-2">{n.headline}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={clsx('badge text-[10px]', SENTIMENT_BADGE[n.sentiment] || 'badge-gray')}>
                        {n.sentiment}
                      </span>
                      <span className="font-mono text-[10px] text-slate-600">{n.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="font-body text-sm text-slate-600">Upgrade to Pro for real-time news intelligence</p>
              <Link to="/subscription" className="mt-2 text-xs text-azure-400 hover:underline block">Upgrade →</Link>
            </div>
          )}
        </div>

        {/* Geo events */}
        <div className="card-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-base flex items-center gap-2">
              <Globe size={16} className="text-flame-400" /> Geopolitical Alerts
            </h3>
            <Link to="/geo-events" className="text-xs text-azure-400 hover:text-azure-300 flex items-center gap-1 font-body">
              Full report <ArrowUpRight size={12} />
            </Link>
          </div>
          {geo.length > 0 ? (
            <div className="space-y-3">
              {geo.map((e, i) => (
                <div key={i} className="p-3 bg-ink-700 rounded-xl border border-white/5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-body text-sm text-slate-300 leading-snug flex-1">{e.event_title}</p>
                    <span className={clsx('badge text-[10px] flex-shrink-0',
                      e.severity >= 4 ? 'badge-red' : e.severity >= 3 ? 'badge-amber' : 'badge-green')}>
                      SEV {e.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={clsx('h-full rounded-full', e.portfolio_impact_score > 0.6 ? 'bg-rose-500' : e.portfolio_impact_score > 0.3 ? 'bg-gold-500' : 'bg-jade-500')}
                        style={{ width: `${(e.portfolio_impact_score * 100).toFixed(0)}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">
                      {(e.portfolio_impact_score * 100).toFixed(0)}% impact
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle size={28} className="text-slate-600 mx-auto mb-3" />
              <p className="font-body text-sm text-slate-600">Upgrade to Pro for geopolitical risk alerts</p>
              <Link to="/subscription" className="mt-2 text-xs text-azure-400 hover:underline block">Upgrade →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
