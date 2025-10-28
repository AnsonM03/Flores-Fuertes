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
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

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
        router.push("/login"); // Navigate to Next.js login page ✅
      } else {
        alert("Registratie mislukt. Probeer opnieuw.");
      }
    } catch (error) {
      console.error("Fout bij registratie:", error);
      alert("Er is een fout opgetreden. Probeer opnieuw.");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Register</h1>

      <form id="registerForm" onSubmit={handleSubmit}>
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
            <label htmlFor={field.id}>{field.label}:</label><br />
            <input
              type={field.type || "text"}
              id={field.id}
              value={formData[field.id]}
              onChange={handleChange}
              required
            /><br /><br />
          </div>
        ))}

        <button type="submit">Register</button>
      </form>

      <br />
      <Link href="/login">Al een account? Log hier in!</Link>
    </div>
  );
}