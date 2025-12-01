import React from 'react';
import { ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-4xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/50 relative z-10">
        
        {/* Left Side - Brand */}
        <div className="md:w-1/2 p-12 bg-indigo-600 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800 opacity-90"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                 <Activity size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Twacha AI</h1>
            </div>
            
            <h2 className="text-4xl font-light mb-6 leading-tight">
              Advanced Dermatological <span className="font-bold">Intelligence</span>
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed opacity-90">
              Instant skin condition analysis powered by Finetuned Qwen 2 VL model. High-precision classification in seconds.
            </p>
          </div>

          <div className="relative z-10 mt-12 grid grid-cols-2 gap-4">
             <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <ShieldCheck className="mb-2 text-emerald-300" />
                <p className="text-sm font-medium">High Accuracy</p>
             </div>
             <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <Zap className="mb-2 text-amber-300" />
                <p className="text-sm font-medium">Real Time</p>
             </div>
          </div>
        </div>

        {/* Right Side - Login Action */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center items-center text-center bg-white/50">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">System Access</h3>
              <p className="text-slate-500">Log in to access the advanced diagnostic suite.</p>
            </div>

            <button 
              onClick={onLogin}
              className="group w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02]"
            >
              <span>Launch Diagnostic System</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="pt-6 border-t border-slate-200">
               <p className="text-xs text-slate-400">
                 Twacha AI. All analysis data is processed securely. Use professional judgment when interpreting automated results.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;