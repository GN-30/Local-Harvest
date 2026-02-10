import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, ChevronDown, LogOut } from "lucide-react";

import Logo from "../images/logo.jpg";

import { AuthContext } from "../context/AuthContext";

const Navbar = ({ cartCount, onLoginClick }) => {
  const { user, logout } = useContext(AuthContext); // Get user role and logout function
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    if (cartCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { to: "/", text: "Home" },
    { to: "/shop", text: "Shop" },
    // Only show Sellers link if user is a producer
    ...(user && user.role === 'producer' ? [{ to: "/sellers", text: "Sellers" }] : []),
    { to: "/about", text: "About" },
    { to: "/contact", text: "Contact" },
  ];

  return (
    <nav
      ref={navRef}
      className="fixed w-full top-0 left-0 z-50 bg-white/80 backdrop-blur-lg border-b border-emerald-100 shadow-sm transition-all duration-300"
    >
      <div className="px-6 md:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="relative flex items-center">
          {/* Mobile: Logo Only (acts as menu toggle) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center gap-2 cursor-pointer outline-none"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            <img 
              src={Logo} 
              alt="LocalHarvest" 
              className="h-12 w-12 rounded-xl shadow-sm object-cover"
            />
            <ChevronDown
              size={20}
              className={`text-slate-400 transition-transform duration-300 ${
                isMenuOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {/* Desktop: Logo + Text */}
          <Link
            to="/"
            className="hidden md:flex items-center gap-3 group"
          >
            <img 
              src={Logo} 
              alt="LocalHarvest" 
              className="h-12 w-12 rounded-xl shadow-md object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600">
              LocalHarvest
            </span>
          </Link>
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 text-lg">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative transition-colors duration-300 ${
                    isActive
                      ? "text-emerald-600 font-medium"
                      : "text-slate-600 hover:text-emerald-600"
                  } after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-emerald-500 after:transition-all after:duration-300 ${
                    isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
                  }`
                }
              >
                {link.text}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right side Actions */}
        <div className="flex items-center gap-4 md:gap-6">
            {/* Cart Icon */}
          <Link to="/orders" className="relative group">
            <ShoppingCart
              size={28}
              className="text-slate-600 group-hover:text-emerald-600 transition-colors duration-300 cursor-pointer"
            />
            {cartCount > 0 && (
              <span
                className={`absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-transform duration-300 ${
                  animate ? "animate-ping-once" : ""
                }`}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Login / Logout Button (Desktop) */}
          {user && (
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 cursor-pointer"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-xl shadow-inner ${
          isMenuOpen ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col items-start gap-2 p-4">
          {navLinks.map((link) => (
            <li key={link.to} className="w-full">
              <NavLink
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block w-full p-3 rounded-lg transition-colors text-lg ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                {link.text}
              </NavLink>
            </li>
          ))}
           
           {/* Mobile Logout Button */}
           {user && (
             <li className="w-full mt-2 border-t border-slate-100 pt-2">
                 <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 p-3 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-semibold"
                 >
                    <LogOut size={20} />
                    Logout
                 </button>
             </li>
           )}
        </ul>
      </div>

      <style>{`
        @keyframes ping-once { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
        .animate-ping-once { animation: ping-once 0.6s ease-in-out; }
      `}</style>
    </nav>
  );
};

export default Navbar;
