// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize state directly (no localStorage) to ensure logout on refresh
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // We DO NOT sync with localStorage anymore, implementing "Auto Logout on Refresh"

  // helper: attach Authorization header
  const authFetch = (url, opts = {}) => {
    const headers = {
      ...(opts.headers || {}),
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, { ...opts, headers });
  };

  const login = ({ token: t, user: u }) => {
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}
