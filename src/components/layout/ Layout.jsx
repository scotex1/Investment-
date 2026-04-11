import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Briefcase, ShieldCheck, TrendingUp,
  Newspaper, Globe, Target, Crown, LogOut, Menu, X,
  Zap, ChevronRight
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',       plan: 'free' },
  { to: '/portfolio',   icon: Briefcase,        label: 'Portfolio',       plan: 'free' },
  { to: '/risk',        icon: ShieldCheck,      label: 'Risk Profile',    plan: 'free' },
  { to: '/stocks',      icon: TrendingUp,       label: 'Stock Analysis',  plan: 'pro' },
  { to: '/news',        icon: Newspaper,        label: 'News Intel',      plan: 'pro' },
  { to: '/geo-events',  icon: Globe,            label: 'Geo Events',      plan: 'pro' },
  { to: '/planner',     icon: Target,           label: 'Planner',         plan: 'free' },
  { to: '/subscription',icon: Crown,            label: 'Subscription',    plan: 'free' },
]

const PLAN_RANK = { free: 0, pro: 1, premium: 2, advisor: 3 }
const PLAN_COLOR = {
  free:     'text-slate-400',
  pro:      'text-azure-400',
  premium:  'text-gold-400',
  advisor:  'text-jade-400',
}

export default function Layout() {
  const { user, plan, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const userPlan = plan?.plan || 'free'
  const userRank = PLAN_RANK[userPlan]

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-ink-950">

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed top-0 left-0 h-full z-40 w-64 bg-ink-900 border-r border-white/5',
        'flex flex-col transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-azure-500/20 border border-azure-500/30 flex items-center justify-center">
              <Zap size={18} className="text-azure-400" />
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm tracking-wide">AIAS</div>
              <div className="font-mono text-[10px] text-slate-500">AI Advisory v1.0</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, plan: reqPlan }) => {
            const locked = PLAN_RANK[reqPlan] > userRank
            return (
              <NavLink
                key={to}
                to={locked ? '/subscription' : to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => clsx(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-150',
                  locked
                    ? 'text-slate-600 cursor-pointer hover:text-slate-500'
                    : isActive
                      ? 'bg-azure-500/15 text-azure-300 border border-azure-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon size={16} className={clsx('flex-shrink-0', locked && 'opacity-40')} />
                <span className={locked ? 'opacity-50' : ''}>{label}</span>
                {locked && (
                  <span className="ml-auto text-[10px] font-display font-bold text-gold-500/70 bg-gold-500/10 px-1.5 py-0.5 rounded-md">
                    {reqPlan.toUpperCase()}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User card */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="bg-ink-800 rounded-xl p-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-azure-500/30 to-jade-500/30 flex items-center justify-center text-xs font-display font-bold text-white">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-white text-xs truncate">{user?.username}</div>
                <div className={clsx('font-mono text-[10px] font-bold uppercase', PLAN_COLOR[userPlan])}>
                  {userPlan} plan
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-600" />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-body"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-ink-900">
          <button onClick={() => setOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-white text-sm">AIAS</span>
          <div className={clsx('font-mono text-xs font-bold uppercase', PLAN_COLOR[userPlan])}>{userPlan}</div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
