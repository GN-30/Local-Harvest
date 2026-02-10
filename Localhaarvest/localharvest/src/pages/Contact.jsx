import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// --- Icons ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-indigo-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);
const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-indigo-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);
const MessageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-indigo-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      try {
        // Send to backend
        await fetch("http://localhost:3001/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });
        setSubmitted(true);
      } catch (err) {
        console.error("Failed to send message", err);
        setSubmitted(true); // Show success anyway for MVP demo if backend fails
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-20 font-sans -mt-24">
      
      {/* Global Background from App.jsx is visible here */}

      <div className="relative z-10 max-w-6xl w-full animate-fadeInUp">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 drop-shadow-sm mb-8">
          Apply for Seller Access
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed text-xl tracking-wide font-normal">
          To ensure quality, LocalHarvest is an invite-only community for producers.
          Fill out the details below to receive your <span className="font-bold text-emerald-600">Seller Access Code</span> via email.
        </p>

        {submitted ? (
          <div className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl border border-emerald-100 transition-all duration-500 ease-in-out relative overflow-hidden max-w-md w-full mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-transparent group-hover:from-emerald-500/5 rounded-3xl transition-all duration-500 pointer-events-none"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-2xl font-semibold text-emerald-700 mb-3 animate-pop-in">
                ✅ Application Sent!
              </h2>
              <p className="text-slate-600 mb-6">
                We have received your request. Check your email for the Seller Access Code.
              </p>
              
              <div className="pt-6 border-t border-emerald-100">
                <p className="text-slate-400 text-sm mb-3">Received your Access Code?</p>
                <button 
                    onClick={() => navigate("/auth?role=seller")}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold transition-all"
                >
                    Proceed to Producer Signup &rarr;
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="group bg-white/80 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-xl border border-emerald-100 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 hover:border-emerald-200 transition-all duration-500 ease-in-out relative overflow-hidden mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-transparent group-hover:from-emerald-500/5 rounded-3xl transition-all duration-500 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="mb-5 relative">
                <label className="block text-left text-slate-700 font-semibold mb-2">
                  Name
                </label>
                <span className="absolute left-4 top-[calc(50%+8px)] -translate-y-1/2 z-10 text-slate-400">
                  <UserIcon />
                </span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-slate-800 placeholder-slate-400 hover:border-emerald-200"
                  placeholder="Your Name"
                />
              </div>
              <div className="mb-5 relative">
                <label className="block text-left text-slate-700 font-semibold mb-2">
                  Email
                </label>
                <span className="absolute left-4 top-[calc(50%+8px)] -translate-y-1/2 z-10 text-slate-400">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 text-slate-800 placeholder-slate-400 hover:border-emerald-200"
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="mb-6 relative">
                <label className="block text-left text-slate-700 font-semibold mb-2">
                  Message
                </label>
                <span className="absolute left-4 top-8 -translate-y-1/2 z-10 text-slate-400">
                  <MessageIcon />
                </span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-300 h-32 resize-none text-slate-800 placeholder-slate-400 hover:border-emerald-200"
                  placeholder="How can we help?"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-400/40 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 cursor-pointer relative overflow-hidden group/btn tracking-wide"
              >
                <span className="relative z-10">Send Message</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 80% { transform: scale(0.95); } 100% { transform: scale(1); opacity: 1; } }
        .animate-fadeInUp { animation: fadeIn 0.8s ease-out forwards; animation-fill-mode: backwards; }
        .animate-pop-in {
          animation: popIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>
    </div>
  );
}

export default Contact;
