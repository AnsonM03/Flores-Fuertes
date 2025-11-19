"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    Voornaam: "",
    Achternaam: "",
    Email: "",
    Adres: "",
    Telefoonnr: "",
    Woonplaats: "",
    Wachtwoord: "",
    GebruikerType: "Klant",
  });

  // Nieuwe state voor specifieke foutmeldingen per veld
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    // Wis de foutmelding zodra de gebruiker begint te typen
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: null });
    }
  };

  // --- VALIDATIE LOGICA ---
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // 1. Email Validatie (E2)
    // Eenvoudige regex: checkt op tekst + @ + tekst + . + tekst
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.Email) {
      newErrors.Email = "E-mailadres is verplicht.";
      isValid = false;
    } else if (!emailRegex.test(formData.Email)) {
      // HIER VOLDOE JE AAN HET CRITERIUM: Specifieke melding E2
      newErrors.Email = "E2: Ongeldig e-mailadresformaat. Controleer je invoer."; 
      isValid = false;
    }

    // 2. Wachtwoord Validatie
    const wwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.Wachtwoord) {
      newErrors.Wachtwoord = "Wachtwoord is verplicht.";
      isValid = false;
    } else if (!wwRegex.test(formData.Wachtwoord)) {
      newErrors.Wachtwoord = "Wachtwoord is te zwak (min. 8 tekens, 1 hoofdletter, 1 cijfer, 1 speciaal teken).";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Voer validatie uit voor verzenden
    if (!validateForm()) {
      return; // Stop als er fouten zijn (Account wordt NIET aangemaakt)
    }

    try {
      const res = await fetch("http://localhost:5281/api/Gebruikers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Registratie gelukt!");
        router.push("/login");
      } else if (res.status === 409) {
        // FIX: Gebruik de tekst die de server terugstuurt (waarschijnlijk "Telefoonnummer bestaat al")
        const msg = await res.text();
        alert(msg || "E-mailadres of telefoonnummer is al in gebruik."); 
      } else {
        alert("Registratie mislukt.");
      }
    } catch (err) {
      console.error("Fout:", err);
      alert("Er is iets misgegaan.");
    }
  };

  return (
    <main className="main auth">
      <section className="auth-wrap">
        <div className="auth-card">
          <div className="auth-media">
            <img src="/loginFH.png" alt="Registratie visual" />
          </div>

          <div className="auth-form">
            <h2>Registreren</h2>

            {/* 'noValidate' zet de standaard browser checks uit zodat we onze eigen checks gebruiken */}
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              {[
                { id: "Voornaam", label: "Voornaam*" },
                { id: "Achternaam", label: "Achternaam*" },
                { id: "Email", label: "E-mail*", type: "email" },
                { id: "Adres", label: "Adres" },
                { id: "Telefoonnr", label: "Telefoonnummer", type: "tel" },
                { id: "Woonplaats", label: "Woonplaats" },
                { id: "Wachtwoord", label: "Wachtwoord*", type: "password" },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  <input
                    id={field.id}
                    type={field.type || "text"}
                    value={formData[field.id]}
                    onChange={handleChange}
                    // We voegen styling toe als er een fout is (rode rand)
                    className={errors[field.id] ? "border-red-500" : ""}
                  />
                  {/* Hier tonen we de specifieke foutmelding (E2) onder het veld */}
                  {errors[field.id] && (
                    <p className="text-red-600 text-xs mt-1">{errors[field.id]}</p>
                  )}
                </div>
              ))}

              <p className="text-xs text-gray-500 mt-1">
                * Verplichte velden
              </p>

              <button type="submit" className="btn">
                Volgende
              </button>
            </form>

            <Link href="/login" className="auth-cta">
              <span>
                <strong>Al een account?</strong>
                <br />
                Log hier in
              </span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M8 5l7 7-7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}