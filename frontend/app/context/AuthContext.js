"use client"

import {createContext, useContext, useState, useEffect} from 'react';

const  AuthContext = createContext(null);

export function AuthProvider( {children} ) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isLoggedIn = !!user;

    useEffect(() => {
        const stored = localStorage.getItem("gebruiker");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed);
            } catch {
                console.error("Kon gebruiker niet parsen uit localStorage");
                localStorage.removeItem("gebruiker");
            }
        }
        setLoading(false);
    }, []);

    const  login = (userData) => {
            setUser(userData);
            localStorage.setItem("gebruiker", JSON.stringify(userData)); // slaat op in LocalStorage
        };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("gebruiker");
    };
    return (
        <AuthContext.Provider value={{user, isLoggedIn, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}