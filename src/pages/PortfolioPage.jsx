import { useEffect, useState } from 'react'
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { portfolioAPI, investAPI } from '@/services/api'
import PageHeader from '@/components/ui/PageHeader'
import PortfolioChart from '@/components/charts/PortfolioChart'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const ASSET_CLASSES = ['equity', 'bond', 'real_estate', 'crypto', 'commodity', 'cash']

const EMPTY_HOLDING = { ticker: '', name: '', asset_class: 'equity', quantity: '', avg_buy_price: '', currency: 'USD' }

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState(null)
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(EMPTY_HOLDING)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [p, r] = await Promise.all([portfolioAPI.get(), investAPI.report()])
      setPortfolio(p.data)
      setPrices(r.data?.current_prices || {})
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const addHolding = async (e) => {
    e.preventDefault()
    if (!form.ticker || !form.quantity || !form.avg_buy_price) { toast.error('Fill all required fields'); return }
    setSubmitting(true)
    try {
      await portfolioAPI.addHolding({
        ...form,
        ticker: form.ticker.toUpperCase(),
        quantity: parseFloat(form.quantity),
        avg_buy_price: parseFloat(form.avg_buy_price),
      })
      toast.success(`${form.ticker.toUpperCase()} added!`)
      setForm(EMPTY_HOLDING)
      setAdding(false)
      load()
    } catch {}
    finally { setSubmitting(false) }
  }

  const removeHolding = async (ticker) => {
    try {
      await portfolioAPI.removeHolding(ticker)
      toast.success(`${ticker} removed`)
      load()
    } catch {}
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  const holdings = portfolio?.holdings || []
  const totalValue = holdings.reduce((s, h) => {
    const price = prices[h.ticker] || h.avg_buy_price
    return s + h.quantity * price
  }, 0)

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Portfolio" subtitle="Manage your investment holdings"
        action={
          <button onClick={() => setAdding(a => !a)} className="btn-primary flex items-center gap-2 text-sm py-2.5">
            <Plus size={16} />{adding ? 'Cancel' : 'Add Holding'}
          </button>
        }
      />

      {/* Add form */}
      {adding && (
        <div className="card-glow border-azure-500/20">
          <h3 className="section-title text-base mb-5">New Holding</h3>
          <form onSubmit={addHolding} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Ticker *</label>
              <input className="input-field uppercase" placeholder="AAPL" value={form.ticker}
                onChange={e => setForm(p => ({ ...p, ticker: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Name</label>
              <input className="input-field" placeholder="Apple Inc." value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Asset Class *</label>
              <select className="input-field" value={form.asset_class}
                onChange={e => setForm(p => ({ ...p, asset_class: e.target.value }))}>
                {ASSET_CLASSES.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Quantity *</label>
              <input type="number" className="input-field" placeholder="10" min="0" step="any"
                value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Avg Buy Price *</label>
              <input type="number" className="input-field" placeholder="150.00" min="0" step="any"
                value={form.avg_buy_price} onChange={e => setForm(p => ({ ...p, avg_buy_price: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input-field" value={form.currency}
                onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                {['USD','SGD','INR','JPY','HKD','EUR','GBP'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2 md:col-span-3 flex justify-end">
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 text-sm">
                {submitting ? <Spinner size="sm" /> : <Plus size={14} />}
                Add Holding
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-glow lg:col-span-1">
          <h3 className="section-title text-base mb-1">Allocation</h3>
          <p className="font-mono text-2xl font-bold text-white mb-4">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <PortfolioChart holdings={holdings.map(h => ({ ...h, current_price: prices[h.ticker] }))} />
        </div>

        <div className="card-glow lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title text-base">Holdings</h3>
            <button onClick={load} className="text-slate-500 hover:text-slate-300 transition-colors">
              <RefreshCw size={15} />
            </button>
          </div>

          {holdings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <TrendingUp size={32} className="text-slate-700 mb-3" />
              <p className="font-body text-slate-500 text-sm">No holdings yet. Add your first position.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-6 gap-2 px-3 pb-2 border-b border-white/5">
                {['Ticker','Class','Qty','Avg Cost','Current','P&L'].map(h => (
                  <div key={h} className="font-mono text-[10px] text-slate-600 uppercase tracking-wider">{h}</div>
                ))}
              </div>
              {holdings.map((h) => {
                const currentPrice = prices[h.ticker] || h.avg_buy_price
                const currentVal = h.quantity * currentPrice
                const costVal = h.quantity * h.avg_buy_price
                const pnl = currentVal - costVal
                const pnlPct = costVal > 0 ? (pnl / costVal * 100) : 0
                return (
                  <div key={h.ticker} className="grid grid-cols-6 gap-2 items-center px-3 py-2.5 bg-ink-700 rounded-xl hover:bg-ink-600 transition-colors group">
                    <div className="font-mono text-sm font-semibold text-white">{h.ticker}</div>
                    <div className="font-body text-xs text-slate-400 capitalize">{h.asset_class}</div>
                    <div className="font-mono text-xs text-slate-300">{h.quantity}</div>
                    <div className="font-mono text-xs text-slate-400">${h.avg_buy_price.toFixed(2)}</div>
                    <div className="font-mono text-xs text-white">${currentPrice.toFixed(2)}</div>
                    <div className="flex items-center justify-between">
                      <span className={clsx('font-mono text-xs font-semibold', pnl >= 0 ? 'text-jade-400' : 'text-rose-400')}>
                        {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                      </span>
                      <button onClick={() => removeHolding(h.ticker)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
