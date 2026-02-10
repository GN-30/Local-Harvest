import React from "react";

// Updated SVG Icons with modern colors
const VisionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-emerald-500 mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

const MissionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-emerald-500 mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const ImpactIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-emerald-500 mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 16.95l.247.494A2 2 0 0010 19h4a2 2 0 001.716-1.556l.247-.494M12 10a2 2 0 110-4 2 2 0 010 4z"
    />
  </svg>
);

function About() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-20 font-sans -mt-24">
      {/* Background provided by App.jsx */}
      
      {/* Content Wrapper */}
      <div className="relative z-10 max-w-6xl w-full">
        {/* Hero Section */}
        <section className="mb-20 animate-fadeIn">
          <div className="inline-block mb-8 px-4 py-2 bg-emerald-100/50 backdrop-blur-sm border border-emerald-200 rounded-full">
            <span className="text-emerald-800 text-sm font-medium">
              🌱 About LocalHarvest
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black tracking-tight text-slate-900 drop-shadow-sm mb-8">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500">LocalHarvest</span>
          </h1>

          <p className="text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed text-lg px-4 font-normal">
            LocalHarvest is a platform dedicated to connecting conscious buyers
            with local farmers, artisans, and small-scale producers. Our mission
            is to create a transparent and sustainable marketplace where every
            purchase supports the people behind real, homegrown products.
          </p>
        </section>

        {/* Feature Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn"
          style={{ animationDelay: "200ms" }}
        >
          {/* Card 1: Vision */}
          <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl border border-emerald-100 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 hover:border-emerald-200 transition-all duration-500 ease-in-out cursor-pointer relative overflow-hidden">
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-transparent group-hover:from-emerald-500/5 rounded-3xl transition-all duration-500 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="inline-block p-4 bg-emerald-100 rounded-2xl border border-emerald-200 group-hover:scale-110 transition-transform duration-300 mb-6">
                <VisionIcon />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors duration-300">
                Our Vision
              </h3>
              <p className="text-slate-500 font-normal leading-relaxed">
                Empower communities through sustainable trade and transparent
                sourcing.
              </p>
            </div>
          </div>

          {/* Card 2: Mission */}
          <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl border border-emerald-100 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 hover:border-emerald-200 transition-all duration-500 ease-in-out cursor-pointer relative overflow-hidden">
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-transparent group-hover:from-emerald-500/5 rounded-3xl transition-all duration-500 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="inline-block p-4 bg-emerald-100 rounded-2xl border border-emerald-200 group-hover:scale-110 transition-transform duration-300 mb-6">
                <MissionIcon />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors duration-300">
                Our Mission
              </h3>
              <p className="text-slate-500 font-normal leading-relaxed">
                Build trust between local sellers and customers with ethical
                business practices.
              </p>
            </div>
          </div>

          {/* Card 3: Impact */}
          <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl border border-emerald-100 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 hover:border-emerald-200 transition-all duration-500 ease-in-out cursor-pointer relative overflow-hidden">
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-transparent group-hover:from-emerald-500/5 rounded-3xl transition-all duration-500 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="inline-block p-4 bg-emerald-100 rounded-2xl border border-emerald-200 group-hover:scale-110 transition-transform duration-300 mb-6">
                <ImpactIcon />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors duration-300">
                Our Impact
              </h3>
              <p className="text-slate-500 font-normal leading-relaxed">
                Encouraging eco-friendly, locally sourced products to reduce
                carbon footprints.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes float { 
          0%, 100% { transform: translateY(0px) translateX(0px); } 
          50% { transform: translateY(-20px) translateX(20px); } 
        }
        @keyframes float-delayed { 
          0%, 100% { transform: translateY(0px) translateX(0px); } 
          50% { transform: translateY(20px) translateX(-20px); } 
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .animate-fadeIn { 
          animation: fadeIn 0.8s ease-out forwards; 
          animation-fill-mode: backwards; 
        }
        .animate-float { 
          animation: float 8s ease-in-out infinite; 
        }
        .animate-float-delayed { 
          animation: float-delayed 10s ease-in-out infinite; 
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}

export default About;
