import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

const COUNTRIES = [
  { code: 'SG', name: 'Singapore' }, { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },     { code: 'KR', name: 'South Korea' },
  { code: 'HK', name: 'Hong Kong' }, { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines'},{ code: 'VN', name: 'Vietnam' },
  { code: 'CN', name: 'China' },     { code: 'OTHER', name: 'Other' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', country: 'SG' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const register = useAuthStore(s => s.register)
  const login    = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handle = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await register(form)
      await login(form.email, form.password)
      toast.success('Account created! Welcome to AIAS 🚀')
      navigate('/dashboard')
    } catch {}
    finally { setLoading(false) }
  }

  const strength = form.password.length >= 12 ? 'strong' : form.password.length >= 8 ? 'medium' : form.password.length > 0 ? 'weak' : null
  const strengthColor = { strong: 'bg-jade-500', medium: 'bg-gold-500', weak: 'bg-rose-500' }
  const strengthWidth = { strong: 'w-full', medium: 'w-2/3', weak: 'w-1/3' }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-azure-500/20 border border-azure-500/30 flex items-center justify-center">
            <Zap size={18} className="text-azure-400" />
          </div>
          <span className="font-display font-bold text-white text-lg">AIAS</span>
        </div>

        <div className="mb-8">
          <h2 className="font-display font-bold text-3xl text-white mb-2">Create account</h2>
          <p className="font-body text-slate-500 text-sm">Start free. Upgrade anytime.</p>
        </div>

        {/* Free plan badge */}
        <div className="flex items-center gap-2 mb-6 p-3 bg-jade-500/8 border border-jade-500/20 rounded-xl">
          <div className="w-5 h-5 rounded-full bg-jade-500/20 flex items-center justify-center flex-shrink-0">
            <Check size={11} className="text-jade-400" />
          </div>
          <span className="font-body text-sm text-jade-300">Free plan includes: Portfolio basics, Risk quiz, Goal planner & Retirement calculator</span>
        </div>

        <form onSubmit={handle} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Username</label>
              <input className="input-field" placeholder="johndoe" value={form.username}
                onChange={e => set('username', e.target.value)} required minLength={3} />
            </div>
            <div>
              <label className="label">Full name</label>
              <input className="input-field" placeholder="John Doe" value={form.full_name}
                onChange={e => set('full_name', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Email address</label>
            <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
              onChange={e => set('email', e.target.value)} required />
          </div>

          <div>
            <label className="label">Country</label>
            <select className="input-field" value={form.country} onChange={e => set('country', e.target.value)}>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} className="input-field pr-12"
                placeholder="Minimum 8 characters" value={form.password}
                onChange={e => set('password', e.target.value)} required minLength={8} />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {strength && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strengthColor[strength]} ${strengthWidth[strength]}`} />
                </div>
                <span className={`font-mono text-xs capitalize ${strength === 'strong' ? 'text-jade-400' : strength === 'medium' ? 'text-gold-400' : 'text-rose-400'}`}>
                  {strength}
                </span>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Create free account</span><ArrowRight size={16} /></>
            }
          </button>
        </form>

        <div className="glow-line my-8" />

        <p className="font-body text-sm text-slate-500 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-azure-400 hover:text-azure-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
