import { Zap } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="p-4 rounded-2xl bg-slate-800">
          <Zap size={24} className="text-blue-400" />
        </div>

        <div className="absolute -inset-2 rounded-2xl border border-blue-500/20 animate-ping"></div>
      </div>

      <div className="font-semibold text-slate-400 text-sm tracking-wider mt-4">
        Loading...
      </div>
    </div>
  );
};

export default LoadingScreen;
