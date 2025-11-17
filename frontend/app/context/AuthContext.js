"use client"

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // !! FIX 1: Hernoem 'user' naar 'gebruiker' en 'setUser' naar 'setGebruiker'
    const [gebruiker, setGebruiker] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // !! FIX 2: Baseer 'isLoggedIn' op 'gebruiker'
    const isLoggedIn = !!gebruiker;

    useEffect(() => {
        const stored = localStorage.getItem("gebruiker");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // !! FIX 3: Gebruik 'setGebruiker'
                setGebruiker(parsed);
            } catch {
                console.error("Kon gebruiker niet parsen uit localStorage");
                localStorage.removeItem("gebruiker");
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // !! FIX 4: Gebruik 'setGebruiker'
        setGebruiker(userData);
        localStorage.setItem("gebruiker", JSON.stringify(userData)); // slaat op in LocalStorage
    };

    const logout = () => {
        // !! FIX 5: Gebruik 'setGebruiker'
        setGebruiker(null);
        localStorage.removeItem("gebruiker");
    };

    return (
        // !! FIX 6: Geef 'gebruiker' door in de value, niet 'user'
        <AuthContext.Provider value={{ gebruiker, isLoggedIn, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}