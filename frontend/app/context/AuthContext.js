"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [gebruiker, setGebruiker] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Logged-in wanneer beide bestaan
    const isLoggedIn = !!gebruiker && !!token;

    useEffect(() => {
        const storedUser = localStorage.getItem("gebruiker");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            try {
                const parsed = JSON.parse(storedUser);
                parsed.gebruikerType = parsed.gebruikerType?.trim().toLowerCase();

                setGebruiker(parsed);
                setToken(storedToken);
            } catch {
                console.error("Kon gebruiker niet parsen uit localStorage");
                localStorage.removeItem("gebruiker");
                localStorage.removeItem("token");
            }
        }

        setLoading(false);
    }, []);

    const login = (userData) => {
        const normalizedUser = {
            ...userData,
            gebruikerType: userData.gebruikerType?.trim().toLowerCase()
        };

        setGebruiker(normalizedUser);
        setToken(userData.token);

        localStorage.setItem("gebruiker", JSON.stringify(normalizedUser));
        localStorage.setItem("token", userData.token);
    };

    const logout = () => {
        setGebruiker(null);
        setToken(null);

        localStorage.removeItem("gebruiker");
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ gebruiker, token, isLoggedIn, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}