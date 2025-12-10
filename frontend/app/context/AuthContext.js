"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getCookie, deleteCookie } from "../cookies/cookies";

const AuthContext = createContext();

// Initialize gebruiker from localStorage synchronously
const getInitialGebruiker = () => {
  if (typeof window === "undefined") return null; // SSR safe
  const stored = localStorage.getItem("gebruiker");
  return stored ? JSON.parse(stored) : null;
};

export function AuthProvider({ children }) {
  const [gebruiker, setGebruiker] = useState(getInitialGebruiker());
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const cookieToken = getCookie("token");

    if (!cookieToken) {
      // No valid token → logout
      setGebruiker(null);
    } else if (!gebruiker) {
      // Token exists but gebruiker not in localStorage
      setGebruiker(null);
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem("gebruiker", JSON.stringify(userData));
    setGebruiker(userData);
  };

  const logout = () => {
    deleteCookie("token");
    localStorage.removeItem("gebruiker");
    setGebruiker(null);
  };

  return (
    <AuthContext.Provider value={{ gebruiker, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
