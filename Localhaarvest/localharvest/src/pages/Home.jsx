import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-10 overflow-hidden font-sans">
      
      {/* Global Background from App.jsx is visible here */}

      <main className="transform -translate-y-10 relative z-10 w-full max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center pt-20 animate-fadeIn">
          <div className="inline-block mb-8 px-4 py-2 bg-emerald-100/50 backdrop-blur-sm border border-emerald-200 rounded-full text-sm font-bold tracking-wide text-emerald-800">
             ✨ Welcome to LocalHarvest
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 drop-shadow-sm">
            Fresh & Local,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Directly To You
            </span>
          </h1>

          <p
            className="text-slate-600 mb-12 max-w-3xl mx-auto text-xl leading-relaxed font-normal animate-fadeIn"
            style={{ animationDelay: "200ms" }}
          >
            Connect with neighborhood farmers and artisans. Get fresh,
            sustainable, and high-quality products delivered straight to your
            doorstep.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 items-center justify-center animate-fadeIn"
            style={{ animationDelay: "400ms" }}
          >
            <Link to="/shop" className="w-full sm:w-auto animate-float">
              <button className="w-full text-white font-semibold px-10 py-4 rounded-2xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-xl shadow-emerald-600/20 hover:shadow-2xl hover:shadow-emerald-500/30 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 cursor-pointer relative overflow-hidden group">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  🛍️ Explore Products
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 mb-12 animate-fadeIn"
          style={{ animationDelay: "600ms" }}
        >
          {/* Card 1 */}
          <div className="group bg-white/60 backdrop-blur-md rounded-3xl p-8 text-center shadow-lg shadow-emerald-900/5 border border-emerald-50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-2 hover:border-emerald-200 transition-all duration-500 ease-in-out cursor-pointer relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-transparent group-hover:from-emerald-500/5 rounded-3xl transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="inline-block mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
                <span className="text-5xl">🌱</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors duration-300">
                Fresh Produce
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Get seasonal fruits, vegetables, and grains directly from local
                farms at peak freshness.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group bg-white/60 backdrop-blur-md rounded-3xl p-8 text-center shadow-lg shadow-emerald-900/5 border border-emerald-50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-2 hover:border-emerald-200 transition-all duration-500 ease-in-out cursor-pointer relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-transparent group-hover:from-emerald-500/5 rounded-3xl transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="inline-block mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
                <span className="text-5xl">🤝</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors duration-300">
                Support Loca
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Every purchase directly supports small-scale farmers and
                artisans in your community.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group bg-white/60 backdrop-blur-md rounded-3xl p-8 text-center shadow-lg shadow-emerald-900/5 border border-emerald-50 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-2 hover:border-emerald-200 transition-all duration-500 ease-in-out cursor-pointer relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-transparent group-hover:from-emerald-500/5 rounded-3xl transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="inline-block mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
                <span className="text-5xl">🌍</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors duration-300">
                Sustainable
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Reduce your carbon footprint by choosing locally sourced and
                eco-friendly products.
              </p>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fadeIn { 
          animation: fadeIn 0.8s ease-out forwards; 
          animation-fill-mode: backwards; 
        }
      `}</style>
    </div>
  );
}

export default Home;
