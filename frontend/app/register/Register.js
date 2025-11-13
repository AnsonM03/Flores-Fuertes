"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../styles/stylebp.css";
import "../styles/auth.css";

// 1. Importeer je nieuwe componenten
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function Register() {
  const router = useRouter();

  // 2. Je state en handlers blijven ongewijzigd
  const [formData, setFormData] = useState({
    Voornaam: "",
    Achternaam: "",
    Email: "",
    Adres: "",
    Telefoonnr: "",
    Woonplaats: "",
    Wachtwoord: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        alert(msg);
      } else {
        alert("Registratie mislukt.");
      }
    } catch (err) {
      console.error("Fout:", err);
      alert("Er is iets misgegaan.");
    }
  };

  // 3. De useEffect voor de header/footer is VERWIJDERD.
  //    Die logica zit nu in de Nav.js en Footer.js componenten.

  return (
    <div className="page">
      
      {/* 4. Gebruik het Nav component */}
      <Nav />

      {/* 5. Je formulier-inhoud blijft hetzelfde (met jouw CSS classes) */}
      <main className="main auth">
        <section className="auth-wrap">
          <div className="auth-card">
            <div className="auth-media">
              <img src="/loginFH.png" alt="Registratie visual" />
            </div>

            <div className="auth-form">
              <h2>Registreren</h2>

              <form onSubmit={handleSubmit} className="space-y-3">
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
                      required={field.label.includes("*")}
                    />
                  </div>
                ))}

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

      {/* 6. Gebruik het Footer component */}
      <Footer />
      
    </div>
  );
}