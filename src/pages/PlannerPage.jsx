import { useState } from 'react'
import { Target, Building2, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { investAPI } from '@/services/api'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import LineChart from '@/components/charts/LineChart'
import clsx from 'clsx'

export default function PlannerPage() {
  const [tab, setTab] = useState('goal')
  const [goalForm, setGoalForm] = useState({ goal_name: '', target_amount: '', current_savings: '', monthly_contribution: '', years_to_goal: '', expected_annual_return: '0.08' })
  const [retForm, setRetForm] = useState({ current_age: '', retirement_age: '60', monthly_expenses_today: '', current_savings: '', monthly_contribution: '', inflation_rate: '0.04', expected_annual_return: '0.08', country: 'SG' })
  const [goalResult, setGoalResult] = useState(null)
  const [retResult, setRetResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const gset = (k, v) => setGoalForm(p => ({ ...p, [k]: v }))
  const rset = (k, v) => setRetForm(p => ({ ...p, [k]: v }))

  const handleGoal = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await investAPI.goalPlanner({
        goal_name: goalForm.goal_name, target_amount: +goalForm.target_amount,
        current_savings: +goalForm.current_savings, monthly_contribution: +goalForm.monthly_contribution,
        years_to_goal: +goalForm.years_to_goal, expected_annual_return: +goalForm.expected_annual_return,
      })
      setGoalResult(res.data)
    } catch {} finally { setLoading(false) }
  }

  const handleRetirement = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await investAPI.retirement({
        current_age: +retForm.current_age, retirement_age: +retForm.retirement_age,
        monthly_expenses_today: +retForm.monthly_expenses_today, current_savings: +retForm.current_savings,
        monthly_contribution: +retForm.monthly_contribution, inflation_rate: +retForm.inflation_rate,
        expected_annual_return: +retForm.expected_annual_return, country: retForm.country,
      })
      setRetResult(res.data)
    } catch {} finally { setLoading(false) }
  }

  const goalChartData = goalResult?.milestones?.map(m => ({ label: `Yr ${m.year}`, value: m.projected_value })) || []
  const retChartData = retResult?.milestones?.map(m => ({ label: `Age ${m.year}`, value: m.projected_corpus })) || []

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Financial Planner" subtitle="Goal projections and retirement planning tools" />

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-ink-800 rounded-xl w-fit">
        {[{ key: 'goal', icon: Target, label: 'Goal Planner' }, { key: 'retirement', icon: Building2, label: 'Retirement' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={clsx('flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-body font-medium transition-all',
              tab === t.key ? 'bg-azure-500/20 text-azure-300 border border-azure-500/30' : 'text-slate-500 hover:text-slate-300')}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* Goal Planner */}
      {tab === 'goal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-glow">
            <h3 className="section-title text-base mb-6">Define Your Goal</h3>
            <form onSubmit={handleGoal} className="space-y-4">
              <div>
                <label className="label">Goal Name</label>
                <input className="input-field" placeholder="e.g. Buy a House, Travel Fund" value={goalForm.goal_name}
                  onChange={e => gset('goal_name', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Target Amount (USD)</label>
                  <input type="number" className="input-field" placeholder="100000" value={goalForm.target_amount}
                    onChange={e => gset('target_amount', e.target.value)} required /></div>
                <div><label className="label">Current Savings (USD)</label>
                  <input type="number" className="input-field" placeholder="10000" value={goalForm.current_savings}
                    onChange={e => gset('current_savings', e.target.value)} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Monthly Contribution</label>
                  <input type="number" className="input-field" placeholder="500" value={goalForm.monthly_contribution}
                    onChange={e => gset('monthly_contribution', e.target.value)} required /></div>
                <div><label className="label">Years to Goal</label>
                  <input type="number" className="input-field" placeholder="5" min="1" max="40" value={goalForm.years_to_goal}
                    onChange={e => gset('years_to_goal', e.target.value)} required /></div>
              </div>
              <div>
                <label className="label">Expected Annual Return: {(+goalForm.expected_annual_return * 100).toFixed(0)}%</label>
                <input type="range" min="0.03" max="0.20" step="0.01" value={goalForm.expected_annual_return}
                  onChange={e => gset('expected_annual_return', e.target.value)}
                  className="w-full accent-azure-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Spinner size="sm" /> : <><Target size={15} />Project Goal</>}
              </button>
            </form>
          </div>

          <div className="space-y-5">
            {goalResult ? (
              <>
                <div className={clsx('card-glow', goalResult.on_track ? 'border-jade-500/25' : 'border-rose-500/25')}>
                  <div className="flex items-center gap-3 mb-4">
                    {goalResult.on_track
                      ? <CheckCircle size={20} className="text-jade-400" />
                      : <AlertCircle size={20} className="text-rose-400" />}
                    <h3 className="font-display font-bold text-lg text-white">{goalResult.goal_name}</h3>
                    <span className={goalResult.on_track ? 'badge-green ml-auto' : 'badge-red ml-auto'}>
                      {goalResult.on_track ? 'On Track ✓' : 'Shortfall'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-ink-700 rounded-xl p-3">
                      <div className="font-mono text-lg font-bold text-white">${goalResult.projected_amount?.toLocaleString()}</div>
                      <div className="font-body text-xs text-slate-500 mt-1">Projected</div>
                    </div>
                    <div className="bg-ink-700 rounded-xl p-3">
                      <div className="font-mono text-lg font-bold text-azure-400">${goalResult.target_amount?.toLocaleString()}</div>
                      <div className="font-body text-xs text-slate-500 mt-1">Target</div>
                    </div>
                    {!goalResult.on_track && (
                      <div className="bg-ink-700 rounded-xl p-3">
                        <div className="font-mono text-lg font-bold text-rose-400">${goalResult.shortfall?.toLocaleString()}</div>
                        <div className="font-body text-xs text-slate-500 mt-1">Shortfall</div>
                      </div>
                    )}
                    <div className="bg-ink-700 rounded-xl p-3">
                      <div className="font-mono text-lg font-bold text-jade-400">${goalResult.recommended_monthly_contribution?.toLocaleString()}/mo</div>
                      <div className="font-body text-xs text-slate-500 mt-1">Recommended Contribution</div>
                    </div>
                  </div>
                  {goalChartData.length > 0 && <LineChart data={goalChartData} dataKey="value" color="#0ea5e9" xKey="label" />}
                </div>
              </>
            ) : (
              <div className="card-glow flex flex-col items-center justify-center py-20 text-center border-dashed">
                <TrendingUp size={40} className="text-slate-700 mb-4" />
                <p className="font-body text-slate-500 text-sm">Fill in the form to project your goal</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Retirement Calculator */}
      {tab === 'retirement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-glow">
            <h3 className="section-title text-base mb-6">Retirement Inputs</h3>
            <form onSubmit={handleRetirement} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Current Age</label>
                  <input type="number" className="input-field" placeholder="30" min="18" max="70"
                    value={retForm.current_age} onChange={e => rset('current_age', e.target.value)} required /></div>
                <div><label className="label">Retirement Age</label>
                  <input type="number" className="input-field" placeholder="60" min="40" max="80"
                    value={retForm.retirement_age} onChange={e => rset('retirement_age', e.target.value)} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Monthly Expenses (Today)</label>
                  <input type="number" className="input-field" placeholder="3000" value={retForm.monthly_expenses_today}
                    onChange={e => rset('monthly_expenses_today', e.target.value)} required /></div>
                <div><label className="label">Current Savings</label>
                  <input type="number" className="input-field" placeholder="50000" value={retForm.current_savings}
                    onChange={e => rset('current_savings', e.target.value)} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Monthly Contribution</label>
                  <input type="number" className="input-field" placeholder="1000" value={retForm.monthly_contribution}
                    onChange={e => rset('monthly_contribution', e.target.value)} required /></div>
                <div><label className="label">Country</label>
                  <select className="input-field" value={retForm.country} onChange={e => rset('country', e.target.value)}>
                    {['SG','IN','JP','KR','HK','TH','MY','ID','PH','VN','CN','OTHER'].map(c => <option key={c}>{c}</option>)}
                  </select></div>
              </div>
              <div>
                <label className="label">Inflation Rate: {(+retForm.inflation_rate * 100).toFixed(0)}%</label>
                <input type="range" min="0.02" max="0.10" step="0.01" value={retForm.inflation_rate}
                  onChange={e => rset('inflation_rate', e.target.value)}
                  className="w-full accent-flame-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer" />
              </div>
              <div>
                <label className="label">Expected Return: {(+retForm.expected_annual_return * 100).toFixed(0)}%</label>
                <input type="range" min="0.03" max="0.15" step="0.01" value={retForm.expected_annual_return}
                  onChange={e => rset('expected_annual_return', e.target.value)}
                  className="w-full accent-jade-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Spinner size="sm" /> : <><Building2 size={15} />Calculate Retirement</>}
              </button>
            </form>
          </div>

          <div className="space-y-5">
            {retResult ? (
              <>
                <div className={clsx('card-glow', retResult.on_track ? 'border-jade-500/25' : 'border-rose-500/25')}>
                  <div className="flex items-center gap-2 mb-4">
                    {retResult.on_track ? <CheckCircle size={18} className="text-jade-400" /> : <AlertCircle size={18} className="text-rose-400" />}
                    <h3 className="font-display font-bold text-white">Retirement Projection</h3>
                    <span className={retResult.on_track ? 'badge-green ml-auto' : 'badge-red ml-auto'}>
                      {retResult.on_track ? 'On Track ✓' : 'At Risk'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Projected Corpus', value: `$${retResult.projected_corpus?.toLocaleString()}`, color: 'text-white' },
                      { label: 'Required Corpus',  value: `$${retResult.required_corpus?.toLocaleString()}`,  color: 'text-azure-400' },
                      { label: 'Monthly Income',   value: `$${retResult.monthly_retirement_income?.toLocaleString()}/mo`, color: 'text-jade-400' },
                      { label: 'Shortfall',        value: retResult.shortfall > 0 ? `$${retResult.shortfall?.toLocaleString()}` : 'None', color: retResult.shortfall > 0 ? 'text-rose-400' : 'text-jade-400' },
                    ].map(m => (
                      <div key={m.label} className="bg-ink-700 rounded-xl p-3">
                        <div className={`font-mono text-base font-bold ${m.color}`}>{m.value}</div>
                        <div className="font-body text-xs text-slate-500 mt-1">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <p className="font-body text-xs text-slate-400 mb-4">{retResult.summary}</p>
                  {retChartData.length > 0 && <LineChart data={retChartData} dataKey="value" color="#10b981" xKey="label" />}
                </div>
              </>
            ) : (
              <div className="card-glow flex flex-col items-center justify-center py-20 text-center border-dashed">
                <Building2 size={40} className="text-slate-700 mb-4" />
                <p className="font-body text-slate-500 text-sm">Fill in your details to project your retirement</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
