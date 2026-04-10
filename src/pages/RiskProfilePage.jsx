import { useState } from 'react'
import { ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react'
import { investAPI } from '@/services/api'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import clsx from 'clsx'

const GOALS = [
  { value: 'wealth_growth', label: 'Wealth Growth', desc: 'Maximise long-term capital' },
  { value: 'retirement',    label: 'Retirement',    desc: 'Build retirement corpus' },
  { value: 'income',        label: 'Passive Income', desc: 'Regular dividend/rental income' },
  { value: 'preservation',  label: 'Preservation',  desc: 'Protect existing capital' },
]

const ALLOC_COLOR = { equity: 'bg-azure-500', bond: 'bg-jade-500', real_estate: 'bg-gold-500', commodity: 'bg-flame-500', cash: 'bg-slate-500' }

export default function RiskProfilePage() {
  const [form, setForm] = useState({
    age: '', monthly_income: '', monthly_expenses: '',
    investment_horizon_years: '', loss_tolerance_pct: '0.15',
    investment_goal: 'wealth_growth', existing_debt: '0', dependents: '0',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await investAPI.riskProfile({
        age: +form.age, monthly_income: +form.monthly_income,
        monthly_expenses: +form.monthly_expenses,
        investment_horizon_years: +form.investment_horizon_years,
        loss_tolerance_pct: +form.loss_tolerance_pct,
        investment_goal: form.investment_goal,
        existing_debt: +form.existing_debt,
        dependents: +form.dependents,
      })
      setResult(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  const LEVEL_COLOR = { conservative: 'jade', moderate: 'gold', aggressive: 'rose' }
  const lvlColor = result ? LEVEL_COLOR[result.level] : 'azure'

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Risk Profile" subtitle="AI-powered dynamic risk assessment based on your financial profile" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Form */}
        <div className="card-glow">
          <h3 className="section-title text-base mb-6">Your Financial Profile</h3>
          <form onSubmit={handle} className="space-y-5">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Age</label>
                <input type="number" className="input-field" placeholder="30" min="18" max="80"
                  value={form.age} onChange={e => set('age', e.target.value)} required />
              </div>
              <div>
                <label className="label">Dependents</label>
                <input type="number" className="input-field" placeholder="0" min="0"
                  value={form.dependents} onChange={e => set('dependents', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Monthly Income (USD)</label>
                <input type="number" className="input-field" placeholder="5000" min="0"
                  value={form.monthly_income} onChange={e => set('monthly_income', e.target.value)} required />
              </div>
              <div>
                <label className="label">Monthly Expenses (USD)</label>
                <input type="number" className="input-field" placeholder="3000" min="0"
                  value={form.monthly_expenses} onChange={e => set('monthly_expenses', e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Investment Horizon (years)</label>
                <input type="number" className="input-field" placeholder="10" min="1" max="40"
                  value={form.investment_horizon_years} onChange={e => set('investment_horizon_years', e.target.value)} required />
              </div>
              <div>
                <label className="label">Existing Debt (USD)</label>
                <input type="number" className="input-field" placeholder="0" min="0"
                  value={form.existing_debt} onChange={e => set('existing_debt', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Max loss tolerance: {(+form.loss_tolerance_pct * 100).toFixed(0)}%</label>
              <input type="range" min="0.05" max="0.50" step="0.05"
                value={form.loss_tolerance_pct} onChange={e => set('loss_tolerance_pct', e.target.value)}
                className="w-full accent-azure-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer" />
              <div className="flex justify-between font-mono text-[10px] text-slate-600 mt-1">
                <span>5%</span><span>Conservative</span><span>Aggressive</span><span>50%</span>
              </div>
            </div>

            <div>
              <label className="label">Investment Goal</label>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map(g => (
                  <button key={g.value} type="button"
                    onClick={() => set('investment_goal', g.value)}
                    className={clsx('p-3 rounded-xl border text-left transition-all',
                      form.investment_goal === g.value
                        ? 'bg-azure-500/15 border-azure-500/40 text-white'
                        : 'bg-ink-700 border-white/8 text-slate-400 hover:border-white/20')}>
                    <div className="font-display font-semibold text-xs mb-0.5">{g.label}</div>
                    <div className="font-body text-[11px] opacity-70">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Spinner size="sm" /> : <><ShieldCheck size={16} />Compute Risk Profile</>}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="space-y-5">
          {result ? (
            <>
              {/* Score card */}
              <div className={`card-glow border-${lvlColor}-500/30`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-title text-base">Your Risk Profile</h3>
                  <span className={clsx('badge', `badge-${lvlColor === 'jade' ? 'green' : lvlColor === 'rose' ? 'red' : 'amber'}`)}>
                    {result.level}
                  </span>
                </div>

                {/* Score gauge */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-20 h-20 rounded-2xl bg-${lvlColor}-500/15 border border-${lvlColor}-500/30 flex flex-col items-center justify-center`}>
                    <span className={`font-display font-bold text-3xl text-${lvlColor}-400`}>{result.score}</span>
                    <span className="font-mono text-[10px] text-slate-500">/10</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                      <div className={`h-full bg-${lvlColor}-500 rounded-full transition-all duration-1000`}
                        style={{ width: `${result.score * 10}%` }} />
                    </div>
                    <p className="font-body text-sm text-slate-300">{result.summary}</p>
                  </div>
                </div>
              </div>

              {/* Allocation */}
              <div className="card-glow">
                <h3 className="section-title text-base mb-4">Recommended Allocation</h3>
                <div className="space-y-3">
                  {Object.entries(result.recommended_allocation).map(([asset, weight]) => (
                    <div key={asset} className="flex items-center gap-3">
                      <div className={clsx('w-2.5 h-2.5 rounded-full flex-shrink-0', ALLOC_COLOR[asset] || 'bg-slate-500')} />
                      <span className="font-body text-sm text-slate-300 capitalize w-24">{asset}</span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={clsx('h-full rounded-full', ALLOC_COLOR[asset] || 'bg-slate-500')}
                          style={{ width: `${(weight * 100)}%`, transition: 'width 1s ease-out' }} />
                      </div>
                      <span className="font-mono text-sm font-semibold text-white w-12 text-right">
                        {(weight * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card-glow flex flex-col items-center justify-center py-20 text-center border-dashed">
              <ShieldCheck size={40} className="text-slate-700 mb-4" />
              <h3 className="font-display font-semibold text-slate-500 mb-2">No Profile Yet</h3>
              <p className="font-body text-sm text-slate-600 max-w-xs">
                Fill in your financial profile on the left to get a personalised AI risk assessment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
