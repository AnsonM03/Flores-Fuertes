"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [gebruiker, setGebruiker] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!gebruiker;

  useEffect(() => {
    const storedGebruiker = localStorage.getItem("gebruiker");
    if (storedGebruiker) {
      setGebruiker(JSON.parse(storedGebruiker));
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

  return (
    <AuthContext.Provider value={{ gebruiker, isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
