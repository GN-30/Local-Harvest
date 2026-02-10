import React, { useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react";

function AuthPage() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "buyer"; // default to buyer
  const isSeller = role === "seller";

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // If seller, default to Login mode (strict), if buyer allow toggle
  // User asked: "producer -> login/signup (unique creds)", "consumer -> log in or sign up (personal mail)"
  // I will interpret "Producer -> unique credentials" as maybe just Login for now, or Signup is gated.
  // For simplicity, I'll allow both but styled differently.
  const mode = searchParams.get("mode");
  // Default to Login (true) unless mode is explicitly 'signup'
  const [isLogin, setIsLogin] = useState(mode === "signup" ? false : true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    secretCode: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? "/api/login" : "/api/signup";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { ...formData, role: isSeller ? "producer" : "consumer" }; // map 'seller' url param to 'producer' db role

    try {
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.message || "Authentication failed");
        setLoading(false);
        return;
      }

      // Login success
      login({ token: data.token, user: data.user });
      
      // Redirect based on role
      if (data.user.role === 'producer') {
        navigate("/sellers");
      } else {
        navigate("/shop");
      }

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans flex items-center justify-center p-4 relative overflow-hidden">
        {/* Global background applies, but adding local subtle blobs for distinct auth feel */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 ${isSeller ? 'bg-emerald-300' : 'bg-teal-300'}`}></div>
            <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 ${isSeller ? 'bg-teal-300' : 'bg-cyan-300'}`}></div>
         </div>

         <div className="w-full max-w-md relative z-10">
            <button 
                onClick={() => navigate("/")} 
                className="flex items-center gap-2 text-slate-500 hover:text-emerald-700 mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Selection
            </button>

            <div className="bg-white/80 backdrop-blur-xl border border-emerald-100 p-8 rounded-3xl shadow-xl">
                <div className="text-center mb-8">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 ${isSeller ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'}`}>
                        {isSeller ? "Producer Portal" : "Consumer Access"}
                    </span>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {isLogin ? "Welcome Back" : "Get Started"}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {isLogin ? "Enter your credentials to access your account." : "Create a new account to join the community."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Secret Code for Sellers */}
                    {!isLogin && isSeller && (
                        <div>
                            <label className="block text-sm font-medium text-emerald-600 mb-1.5">Seller Access Code</label>
                            <input 
                                type="text" 
                                name="secretCode"
                                value={formData.secretCode}
                                onChange={handleChange}
                                required
                                className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-800 placeholder-emerald-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono tracking-widest"
                                placeholder="ENTER CODE"
                            />
                            <p className="text-xs text-emerald-600/80 mt-2 flex items-center gap-1">
                                <span className="inline-block w-1 h-1 bg-emerald-500 rounded-full"></span>
                                Contact support@localharvest.com for access
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                        <input 
                            type="password" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] mt-2
                            ${isSeller 
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/10' 
                                : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 shadow-teal-900/10'
                            }
                        `}
                    >
                        {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-500 text-sm">
                        {isLogin ? "Don't have an account yet?" : "Already have an account?"}
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className={`ml-1.5 font-semibold hover:underline ${isSeller ? 'text-emerald-600' : 'text-teal-600'}`}
                        >
                            {isLogin ? "Sign Up" : "Sign In"}
                        </button>
                    </p>
                </div>
            </div>
         </div>
    </div>
  );
}

export default AuthPage;
