import { Zap } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-azure-500/20 border border-azure-500/30 flex items-center justify-center animate-pulse-slow">
          <Zap size={24} className="text-azure-400" />
        </div>
        <div className="absolute -inset-2 rounded-2xl border border-azure-500/20 animate-ping" />
      </div>
      <div className="font-display font-semibold text-slate-400 text-sm tracking-wider">
        Initialising AIAS...
      </div>
    </div>
  )
}
