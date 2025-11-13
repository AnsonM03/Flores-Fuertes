"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [gebruiker, setGebruiker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedGebruiker = localStorage.getItem("gebruiker");
    if (storedGebruiker) {
      try {
        setGebruiker(JSON.parse(storedGebruiker));
      } catch (err) {
        console.error("Kon gebruiker niet parsen uit localStorage", err);
        localStorage.removeItem("gebruiker");
      }
    }
    setLoading(false);
  }, []);

  const login = (gebruikerData) => {
    setGebruiker(gebruikerData);
    localStorage.setItem("gebruiker", JSON.stringify(gebruikerData));
  };

  const logout = () => {
    setGebruiker(null);
    localStorage.removeItem("gebruiker");
  };

  const isLoggedIn = !!gebruiker;

  return (
    <AuthContext.Provider value={{ gebruiker, isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}