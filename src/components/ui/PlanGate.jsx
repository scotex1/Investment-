import { useNavigate } from 'react-router-dom'
import { Crown, Lock } from 'lucide-react'

export default function PlanGate({ requiredPlan = 'Pro', feature = 'this feature' }) {
  const navigate = useNavigate()
  return (
    <div className="card-glow flex flex-col items-center justify-center text-center py-16 px-8 border-dashed border-white/10">
      <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-4">
        <Lock size={22} className="text-gold-400" />
      </div>
      <h3 className="font-display font-bold text-lg text-white mb-2">
        {requiredPlan} Plan Required
      </h3>
      <p className="font-body text-slate-400 text-sm max-w-xs mb-6">
        Upgrade to <span className="text-gold-400 font-semibold">{requiredPlan}</span> to unlock {feature}.
      </p>
      <button onClick={() => navigate('/subscription')} className="btn-primary flex items-center gap-2">
        <Crown size={16} />
        Upgrade Now
      </button>
    </div>
  )
}
