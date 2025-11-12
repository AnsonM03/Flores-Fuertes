"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();

  // Je state management (ongewijzigd)
  const [formData, setFormData] = useState({
    Voornaam: "",
    Achternaam: "",
    Email: "",
    Adres: "",
    Telefoonnr: "",
    Woonplaats: "",
    Wachtwoord: "",
  });

  // Je handleChange (ongewijzigd)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Je handleSubmit (ongewijzigd)
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:5281/api/Gebruikers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Registratie gelukt!");
        router.push("/login");
      } else {
        if (response.status === 409) {
          const errorMessage = await response.text();
          alert(errorMessage);
        } else {
          alert("Registratie mislukt. Probeer opnieuw.");
        }
      }
    } catch (error) {
      console.error("Fout bij registratie:", error);
      alert("Er is een fout opgetreden. Probeer opnieuw.");
    }
  };

  // --- START VAN DE AANGEPASTE JSX ---
  return (
    // 1. Buitenste container (van login.js)
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-200">
      
      {/* 2. Formulier-kaart (van login.js) */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        
        {/* 3. Titel (gestyled zoals login.js) */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Register
        </h1>

        {/* 4. Formulier (gestyled zoals login.js) */}
        <form id="registerForm" onSubmit={handleSubmit} className="space-y-5">
          
          {/* 5. Je velden-map, nu met styling */}
          {[
            { id: "Voornaam", label: "Voornaam" },
            { id: "Achternaam", label: "Achternaam" },
            { id: "Email", label: "Email" },
            { id: "Adres", label: "Adres" },
            { id: "Telefoonnr", label: "Telefoon Nummer" },
            { id: "Woonplaats", label: "Woonplaats" },
            { id: "Wachtwoord", label: "Wachtwoord", type: "password" }
          ].map((field) => (
            <div key={field.id}>
              {/* Label (gestyled zoals login.js) */}
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-700"
              >
                {field.label}
              </label>
              
              {/* Input (gestyled zoals login.js) */}
              <input
                type={field.type || "text"}
                id={field.id}
                value={formData[field.id]}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black placeholdeer-gray-600"
              />
            </div>
          ))}

          {/* 6. Submit knop (gestyled zoals login.js) */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Register
          </button>
        </form>

        {/* 7. Link onderaan (gestyled zoals login.js) */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Al een account?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Log hier in!
          </Link>
        </p>
      </div>
    </div>
  );
}