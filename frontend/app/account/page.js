"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
    const { user, loading } = useAuth();
    const [accountInfo, setAccountInfo] = useState(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        async function fetchAccountInfo() {
            try {
                if (!user?.gebruiker_Id) return;

                const response = await fetch(`http://localhost:5281/api/Gebruikers/${user.gebruiker_Id}`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAccountInfo(data);
                } else {
                    console.error("Fout bij het ophalen van accountinformatie:", response.status);
                }
            } catch (error) {
                console.error("Fout bij het ophalen van accountinformatie:", error);
            } finally {
                setFetching(false);
            }
        }

        if (user?.gebruiker_Id) {
            fetchAccountInfo();
        } else {
            setFetching(false);
        }
    }, [user]);

    if (loading || fetching) return <p className="text-center mt-10">Laden...</p>;
    if (!user) return <p className="text-center mt-10">Je moet eerst inloggen.</p>;
    if (!accountInfo) return <p className="text-center mt-10">Geen accountinformatie beschikbaar.</p>;

    return (
        <main className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">
                    Mijn Account
                </h1>

                <div className="space-y-4">
                    <InputField label="Voornaam" value={accountInfo.voornaam} />
                    <InputField label="Achternaam" value={accountInfo.achternaam} />
                    <InputField label="Email" value={accountInfo.email} />
                    <InputField label="Adres" value={accountInfo.adres} />
                    <InputField label="Telefoonnummer" value={accountInfo.telefoonnr} />
                    <InputField label="Woonplaats" value={accountInfo.woonplaats} />
                </div>
            </div>
        </main>
    );
}

function InputField({ label, value }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type="text"
                value={value || ""}
                disabled
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900"
            />
        </div>
    );
}
