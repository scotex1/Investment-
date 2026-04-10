import { useEffect, useState } from 'react'
import { Check, Crown, Zap, Star, Building2, ArrowRight, Receipt } from 'lucide-react'
import { subAPI, investAPI } from '@/services/api'
import api from '@/services/api'
import useAuthStore from '@/store/authStore'
import PageHeader from '@/components/ui/PageHeader'
import Spinner from '@/components/ui/Spinner'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PLANS = [
  {
    id: 'free', name: 'Free', price_usd: 0, price_inr: 0, icon: Zap, color: 'slate',
    tagline: 'Get started for free',
    features: [
      'Portfolio basics (up to 3 stocks)',
      'Static risk assessment quiz',
      'Goal planner tool',
      'Retirement calculator',
    ],
  },
  {
    id: 'pro', name: 'Pro', price_usd: 9.99, price_inr: 829, icon: Star, color: 'azure', popular: true,
    tagline: 'For serious retail investors',
    features: [
      'Unlimited portfolio holdings',
      'Dynamic AI risk scoring',
      'Real-time news & sentiment',
      'Basic geopolitical signals',
      'Stock & real estate analysis',
      'Portfolio optimizer (MPT)',
      'Rebalancing suggestions',
      'Monthly PDF reports',
    ],
  },
  {
    id: 'premium', name: 'Premium', price_usd: 24.99, price_inr: 2079, icon: Crown, color: 'gold',
    tagline: 'Full AI intelligence suite',
    features: [
      'Everything in Pro',
      'Full War & Geo Impact Engine',
      'Automated portfolio rebalancing',
      'Real-time adaptive risk profiling',
      'Custom alert rules',
      'Weekly reports',
    ],
  },
  {
    id: 'advisor', name: 'Advisor', price_usd: 79, price_inr: 6557, icon: Building2, color: 'jade',
    tagline: 'For financial advisors & RIAs',
    features: [
      'Everything in Premium',
      'Priority geopolitical alerts',
      'Custom rebalancing rules',
      'Full API access',
      'Multi-client management',
      'Dedicated support',
    ],
  },
]

const PLAN_RANK = { free: 0, pro: 1, premium: 2, advisor: 3 }

const COLOR_MAP = {
  slate: { border: 'border-white/10',     badge: 'badge-gray',  icon: 'text-slate-400 bg-white/5 border-white/10' },
  azure: { border: 'border-azure-500/30', badge: 'badge-blue',  icon: 'text-azure-400 bg-azure-500/15 border-azure-500/20' },
  gold:  { border: 'border-gold-500/30',  badge: 'badge-amber', icon: 'text-gold-400 bg-gold-500/15 border-gold-500/20' },
  jade:  { border: 'border-jade-500/30',  badge: 'badge-green', icon: 'text-jade-400 bg-jade-500/15 border-jade-500/20' },
}

// Razorpay script loader
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function SubscriptionPage() {
  const { user, plan, refreshPlan } = useAuthStore()
  const userPlan = plan?.plan || 'free'
  const [sub, setSub] = useState(null)
  const [payments, setPayments] = useState([])
  const [paying, setPaying] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    subAPI.current().then(r => setSub(r.data)).catch(() => {})
    api.get('/payments/history').then(r => setPayments(r.data.payments || [])).catch(() => {})
  }, [])

  const handleUpgrade = async (planId) => {
    if (planId === userPlan || planId === 'free') return

    const loaded = await loadRazorpay()
    if (!loaded) { toast.error('Payment gateway load failed. Check internet.'); return }

    setPaying(planId)
    try {
      // Step 1: Backend se order create karo
      const orderRes = await api.post('/payments/create-order', { plan: planId })
      const { order_id, amount, currency, key_id, plan_name } = orderRes.data

      // Step 2: Razorpay checkout open karo
      const options = {
        key: key_id,
        amount,
        currency,
        name: 'AIAS',
        description: plan_name,
        order_id,
        prefill: {
          name: user?.full_name || user?.username,
          email: user?.email,
        },
        theme: { color: '#0ea5e9' },
        handler: async (response) => {
          // Step 3: Payment verify karo
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
            })
            await refreshPlan()
            toast.success(`🎉 ${verifyRes.data.message}`)
            const r = await subAPI.current()
            setSub(r.data)
            const h = await api.get('/payments/history')
            setPayments(h.data.payments || [])
          } catch {
            toast.error('Payment verify failed. Contact support.')
          }
        },
        modal: {
          ondismiss: () => { setPaying(null); toast('Payment cancelled') }
        }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      toast.error('Could not initiate payment. Try again.')
    } finally {
      setPaying(null)
    }
  }

  const cancel = async () => {
    if (!confirm('Cancel subscription? You will be downgraded to Free plan.')) return
    setCancelling(true)
    try {
      await subAPI.cancel()
      await refreshPlan()
      toast.success('Subscription cancelled.')
      const r = await subAPI.current()
      setSub(r.data)
    } catch {}
    finally { setCancelling(false) }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <PageHeader title="Subscription" subtitle="Upgrade your plan — pay securely via UPI, Card, or NetBanking" />

      {/* Current plan banner */}
      {userPlan !== 'free' && sub && (
        <div className="p-4 bg-jade-500/8 border border-jade-500/20 rounded-2xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Crown size={18} className="text-jade-400" />
            <div>
              <span className="font-display font-semibold text-jade-300 capitalize">{userPlan} Plan — Active</span>
              {sub.expires_at && (
                <span className="font-body text-xs text-slate-500 ml-2">
                  Renews {new Date(sub.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(h => !h)}
              className="text-xs text-azure-400 hover:text-azure-300 flex items-center gap-1 font-body">
              <Receipt size={13} /> Payment History
            </button>
            <button onClick={cancel} disabled={cancelling}
              className="text-xs text-slate-500 hover:text-rose-400 transition-colors font-body">
              {cancelling ? <Spinner size="sm" /> : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Payment history */}
      {showHistory && payments.length > 0 && (
        <div className="card-glow">
          <h3 className="section-title text-base mb-4">Payment History</h3>
          <div className="space-y-2">
            {payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div>
                  <span className="font-display font-semibold text-white text-sm capitalize">{p.plan_purchased} Plan</span>
                  <span className="font-mono text-xs text-slate-500 ml-3">{new Date(p.created_at).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-jade-400">₹{p.amount_inr}</span>
                  <span className={clsx('badge text-[10px]', p.status === 'captured' ? 'badge-green' : 'badge-red')}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {PLANS.map((p) => {
          const c = COLOR_MAP[p.color]
          const Icon = p.icon
          const isCurrent = userPlan === p.id
          const isDowngrade = PLAN_RANK[p.id] < PLAN_RANK[userPlan]

          return (
            <div key={p.id} className={clsx(
              'relative card border rounded-2xl flex flex-col transition-all duration-300',
              c.border,
              p.popular ? 'ring-1 ring-azure-500/40 shadow-[0_0_40px_rgba(14,165,233,0.1)]' : '',
              isCurrent ? 'opacity-90' : 'hover:scale-[1.01]',
            )}>
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge-blue text-[10px] px-3 py-1 whitespace-nowrap">Most Popular</span>
                </div>
              )}

              <div className="mb-5">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-4 border', c.icon)}>
                  <Icon size={18} />
                </div>
                <h3 className="font-display font-bold text-xl text-white">{p.name}</h3>
                <p className="font-body text-xs text-slate-500 mt-1">{p.tagline}</p>
              </div>

              <div className="mb-5">
                {p.price_inr === 0 ? (
                  <div className="font-display font-bold text-4xl text-white">Free</div>
                ) : (
                  <>
                    <div className="flex items-end gap-1">
                      <span className="font-display font-bold text-4xl text-white">₹{p.price_inr}</span>
                      <span className="font-body text-slate-500 text-sm mb-1">/mo</span>
                    </div>
                    <p className="font-mono text-xs text-slate-600 mt-1">${p.price_usd} USD · ₹{p.price_inr * 12}/yr</p>
                  </>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={13} className={clsx('flex-shrink-0 mt-0.5',
                      p.color === 'slate' ? 'text-slate-500' :
                      p.color === 'azure' ? 'text-azure-400' :
                      p.color === 'gold'  ? 'text-gold-400' : 'text-jade-400')} />
                    <span className="font-body text-xs text-slate-400">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full text-center py-3 rounded-xl border border-white/10 font-display font-semibold text-sm text-slate-400 bg-white/3">
                  Current Plan ✓
                </div>
              ) : isDowngrade || p.id === 'free' ? (
                <div className="w-full text-center py-3 rounded-xl font-display text-sm text-slate-600 bg-white/3">
                  {p.id === 'free' ? 'Basic plan' : 'Lower plan'}
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(p.id)}
                  disabled={paying === p.id}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold text-sm transition-all active:scale-95',
                    p.color === 'azure' ? 'btn-primary' :
                    p.color === 'gold'  ? 'bg-gold-500/20 border border-gold-500/30 text-gold-300 hover:bg-gold-500/30' :
                    'bg-jade-500/20 border border-jade-500/30 text-jade-300 hover:bg-jade-500/30'
                  )}
                >
                  {paying === p.id
                    ? <Spinner size="sm" />
                    : <><span>Pay ₹{p.price_inr}/mo</span><ArrowRight size={14} /></>
                  }
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Trust badges */}
      <div className="card text-center py-6 border-dashed border-white/8">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {['🔒 256-bit Encryption', '🏦 Razorpay Secured', '📜 GST Invoice', '↩️ Cancel Anytime', '🇮🇳 UPI / Cards / NetBanking'].map(b => (
            <span key={b} className="font-body text-xs text-slate-500">{b}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
