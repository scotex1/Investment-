import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink-900 border-r border-white/5 p-12 relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid-ink bg-grid opacity-100" />
        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-azure-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-jade-500/8 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-azure-500/20 border border-azure-500/30 flex items-center justify-center">
              <Zap size={20} className="text-azure-400" />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-wide">AIAS</span>
          </div>

          <h1 className="font-display font-bold text-5xl text-white leading-tight mb-6">
            Your AI<br />
            <span className="text-azure-400">Investment</span><br />
            Co-Pilot
          </h1>
          <p className="font-body text-slate-400 text-lg leading-relaxed max-w-sm">
            Institutional-grade portfolio intelligence for Asian retail investors. Powered by AI. Protected by real-time geopolitical intelligence.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          {[
            { label: 'Portfolio AI Analysis', color: 'azure' },
            { label: 'War & Geo Impact Engine', color: 'flame' },
            { label: 'Real-time Market Intelligence', color: 'jade' },
            { label: 'Automated Rebalancing', color: 'gold' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full bg-${color}-400`} />
              <span className="font-body text-sm text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-azure-500/20 border border-azure-500/30 flex items-center justify-center">
              <Zap size={16} className="text-azure-400" />
            </div>
            <span className="font-display font-bold text-white">AIAS</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-white mb-2">Sign in</h2>
            <p className="font-body text-slate-500 text-sm">Access your investment dashboard</p>
          </div>

          <form onSubmit={handle} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign in</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="glow-line my-8" />

          <p className="font-body text-sm text-slate-500 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-azure-400 hover:text-azure-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-8 p-4 bg-white/3 border border-white/8 rounded-xl">
            <p className="font-mono text-xs text-slate-500 text-center">
              Demo: test@aias.io / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
