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
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
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
        const msg = await res.text();
        setErrorMessage(msg);
      } else {
        setErrorMessage("Registratie mislukt.");
      }
    } catch (err) {
      console.error("Fout:", err);
      setErrorMessage("Er is iets misgegaan.");
    }
  };

  return (
    <main className="main auth">
      <section className="auth-wrap">
        <div className="auth-card">
          <div className="auth-media">
            <img src="/loginFH.png" alt="Illustratie registratieformulier" />
          </div>

          <div className="auth-form">
            <h2>Registreren</h2>

            {errorMessage && (
              <p role="alert" aria-live="polite" style={{ color: "red", marginBottom: "12px" }}>
                {errorMessage}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { id: "Voornaam", label: "Voornaam*", type: "text" },
                { id: "Achternaam", label: "Achternaam*", type: "text" },
                { id: "Email", label: "E-mail*", type: "email" },
                { id: "Adres", label: "Adres", type: "text" },
                { id: "Telefoonnr", label: "Telefoonnummer", type: "tel" },
                { id: "Woonplaats", label: "Woonplaats", type: "text" },
                { id: "Wachtwoord", label: "Wachtwoord*", type: "password" },
              ].map((field) => (
                <div key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  <input
                    id={field.id}
                    type={field.type || "text"}
                    value={formData[field.id]}
                    onChange={handleChange}
                    required={field.label.includes("*")}
                    aria-required={field.label.includes("*")}
                  />
                </div>
              ))}

              <button type="submit" className="btn" aria-label="Registratie verzenden">
                Volgende
              </button>
            </form>

            <Link href="/login" className="auth-cta" tabIndex="0">
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