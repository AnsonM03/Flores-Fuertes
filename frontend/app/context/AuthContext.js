"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getCookie, deleteCookie } from "../cookies/cookies";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [gebruiker, setGebruiker] = useState(null);
  const [loading, setLoading] = useState(true);

  // Probeer gebruiker automatisch te laden via cookie
  useEffect(() => {
    const cookieToken = getCookie("token");

    if (!cookieToken) {
      setLoading(false);
      return;
    }

    // Gebruiker staat nog in localStorage (alle overige data behalve token)
    const stored = localStorage.getItem("gebruiker");
    if (stored) {
      setGebruiker(JSON.parse(stored));
    }

    setLoading(false);
  }, []);

  // Login functie
  const login = (userData) => {
    localStorage.setItem("gebruiker", JSON.stringify(userData));
    setGebruiker(userData);
  };

  // Loguit functie
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