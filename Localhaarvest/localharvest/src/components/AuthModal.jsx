// src/components/AuthModal.jsx
import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import Image from "../images/image.jpg";

// --- SVG Google Icon ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
      s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4
      C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20
      C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12
      c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4
      C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238
      C29.211,35.091,26.715,36,24,36
      c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025
      C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303
      c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238
      C41.38,36.405,44,30.638,44,24
      C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);

// --- Animation Variants ---
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: -100 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.9, y: 100 },
};

export default function AuthModal({ isOpen, onClose }) {
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("buyer"); // buyer or seller

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Initialize Google Button
  useEffect(() => {
    if (window.google && isOpen) {
      try {
        window.google.accounts.id.initialize({
          client_id:
            import.meta.env.VITE_GOOGLE_CLIENT_ID ||
            "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("gbtn"),
          { theme: "outline", size: "large" }
        );
      } catch (err) {
        console.warn("Google Sign-in not loaded yet.");
      }
    }
  }, [isOpen]);

  // Handle Google Auth
  const handleGoogleResponse = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) return alert("Google sign-in failed");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (res.ok) {
        login({ token: data.token, user: data.user });
        onClose();
      } else {
        alert(data.message || "Google auth failed");
      }
    } catch (err) {
      console.error(err);
      alert("Google sign-in error");
    }
  };

  // Email-password login/signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/login" : "/api/signup";
    const payload = isLogin
      ? { email, password }
      : { name, email, password, role };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Authentication failed");
      login({ token: data.token, user: data.user });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl flex bg-gradient-to-br from-slate-800/50 to-indigo-900/30 backdrop-blur-xl rounded-2xl shadow-2xl border border-indigo-500/20 overflow-hidden"
            variants={modalVariants}
          >
            {/* Left image section */}
            <div className="hidden md:block w-1/2 relative">
              <img
                src={Image}
                alt="LocalHarvest"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/80 to-indigo-800/80 flex flex-col justify-center items-center text-center p-8">
                <h2 className="text-4xl font-extrabold text-white">
                  LocalHarvest
                </h2>
                <p className="text-indigo-200 text-lg mt-4 max-w-xs">
                  Connecting you to fresh, sustainable, and local products.
                </p>
              </div>
            </div>

            {/* Right form section */}
            <div className="w-full md:w-1/2 p-8 md:p-12">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-indigo-300 hover:text-cyan-300 transition"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
                  {isLogin ? "Welcome Back!" : "Create an Account"}
                </h1>
              </div>

              {/* Google Button */}
              <div id="gbtn" className="flex justify-center mb-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-800/50 rounded-lg shadow-md hover:shadow-lg border border-indigo-500/30"
                >
                  <GoogleIcon />
                  <span className="font-semibold text-indigo-200">
                    Continue with Google
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center my-6">
                <hr className="flex-grow border-indigo-800/50" />
                <span className="mx-4 text-indigo-400 text-sm">OR</span>
                <hr className="flex-grow border-indigo-800/50" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <>
                    <div>
                      <label className="block text-sm text-indigo-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-slate-900/60 border-2 border-indigo-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400"
                      />
                    </div>

                    {/* Role Dropdown */}
                    <div>
                      <label className="block text-sm text-indigo-300 mb-1">
                        Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full bg-slate-900/60 border-2 border-indigo-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400"
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm text-indigo-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-900/60 border-2 border-indigo-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-indigo-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-900/60 border-2 border-indigo-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 font-semibold text-white rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 hover:scale-105 transition-transform"
                >
                  {isLogin ? "Log In" : "Sign Up"}
                </button>
              </form>

              <div className="text-center mt-6 text-sm text-gray-400">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-cyan-400 ml-1 hover:underline"
                >
                  {isLogin ? "Sign Up" : "Log In"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
