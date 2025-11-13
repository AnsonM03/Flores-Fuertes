"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const loginData = { Email: email, Wachtwoord: wachtwoord };

    try {
      const response = await fetch("http://localhost:5281/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const text = await response.text();
      console.log("Response text:", response.status, "body:", text); // Log de response tekst voor debugging

      if (response.ok) {
        const gebruiker = JSON.parse(text);
        login(gebruiker);
        alert("Inloggen gelukt! Je wordt nu doorgestuurd.");
        router.push("/");
      } else {
        alert(`Inloggen mislukt: ${text}`);
      }
    } catch (error) {
      console.error("Fout bij inloggen:", error);
      alert("Er is een fout opgetreden. Probeer het opnieuw.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-200">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Login Page
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* WACHTWOORD */}
          <div>
            <label htmlFor="wachtwoord" className="block text-sm font-medium text-gray-700">
              Wachtwoord
            </label>
            <input
              type="password"
              id="wachtwoord"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              required
            />
          </div>

          {/* CHECKBOX */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="aangemeldblijven"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="aangemeldblijven" className="ml-2 block text-sm text-gray-700">
              Aangemeld blijven
            </label>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold 
            hover:bg-blue-700 transition-colors"
          >
            Inloggen
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Nog geen account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Account aanmaken
          </Link>
        </p>
      </div>
    </div>
  );
}
