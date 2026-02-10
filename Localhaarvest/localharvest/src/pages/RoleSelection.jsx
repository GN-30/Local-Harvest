import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Tractor, ShoppingBag } from "lucide-react";
import FarmBg from "../images/farm-bg.png";

function RoleSelection() {
  const navigate = useNavigate();
  const [showProducerOptions, setShowProducerOptions] = React.useState(false);

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Global Apps Background is used */}

      {/* Modal/Overlay for Producer Options */}
      {showProducerOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
             <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-emerald-100 animate-in fade-in zoom-in duration-300">
                <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">Producer Access</h3>
                <p className="text-slate-500 text-center mb-8">Are you a new or existing seller?</p>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => navigate("/auth?role=seller&mode=login")}
                        className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                    >
                        Existing User
                    </button>
                    <button 
                        onClick={() => navigate("/contact")}
                         className="w-full py-4 rounded-xl bg-white border-2 border-emerald-100 text-emerald-700 font-bold text-lg hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                    >
                        New User
                    </button>
                </div>
                
                <button 
                    onClick={() => setShowProducerOptions(false)}
                    className="mt-6 w-full text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                >
                    Cancel
                </button>
             </div>
        </div>
      )}

      <div className="relative z-10 max-w-5xl w-full text-center">
        <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 mb-6 drop-shadow-sm">
            Welcome to LocalHarvest
            </h1>
            <p className="text-xl text-slate-600 font-light tracking-wide">
            Are you here to sell your produce or shop for fresh goods?
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            {/* Producer / Seller Card */}
            <div 
                className="group relative h-96 bg-white/60 backdrop-blur-xl border border-emerald-100 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-400/50 hover:bg-white/80"
                onClick={() => setShowProducerOptions(true)}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="w-24 h-24 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 border border-emerald-200 group-hover:bg-emerald-100 transition-all duration-300 shadow-sm">
                    <Tractor size={48} className="text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                <h2 className="text-3xl font-bold text-slate-800 mb-4 group-hover:text-emerald-600 transition-colors">Producer</h2>
                <p className="text-slate-500 mb-8 max-w-xs leading-relaxed">
                    I want to list and sell my farm-fresh produce to the community.
                </p>
                
                <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Access Portal</span>
                    <ArrowRight size={20} />
                </div>
            </div>

            {/* Consumer / Buyer Card */}
            <div 
                className="group relative h-96 bg-white/60 backdrop-blur-xl border border-indigo-100 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/10 hover:border-violet-400/50 hover:bg-white/80"
                onClick={() => navigate("/home")}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="w-24 h-24 bg-violet-50 rounded-2xl flex items-center justify-center mb-8 border border-violet-200 group-hover:bg-violet-100 transition-all duration-300 shadow-sm">
                    <ShoppingBag size={48} className="text-violet-500 group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                <h2 className="text-3xl font-bold text-slate-800 mb-4 group-hover:text-violet-600 transition-colors">Consumer</h2>
                <p className="text-slate-500 mb-8 max-w-xs leading-relaxed">
                    I want to discover and purchase fresh local products.
                </p>
                
                <div className="flex items-center gap-2 text-violet-600 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Shop Now</span>
                    <ArrowRight size={20} />
                </div>
            </div>
        </div>
      </div>
      
       <style>{`
        @keyframes float { 
          0%, 100% { transform: translateY(0px) rotate(0deg); } 
          50% { transform: translateY(-20px) rotate(2deg); } 
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes slow-zoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.05); }
        }
        .animate-float { animation: float 15s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 10s ease-in-out infinite; }
        .animate-slow-zoom { animation: slow-zoom 20s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default RoleSelection;
