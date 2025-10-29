"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const loginData = {
      Email: email,
      Wachtwoord: wachtwoord
    };

    try {
      const response = await fetch('http://localhost:5281/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      if (response.ok) {
        const gebruiker = await response.json();
        alert('Inloggen gelukt! Je wordt nu doorgestuurd.');
        router.push('/'); // Ga naar de hoofdpagina
      } else {
        alert('Inloggen mislukt. Controleer je gegevens.');
      }
    } catch (error) {
      console.error('Fout bij inloggen:', error);
      alert('Er is een fout opgetreden. Probeer het opnieuw.');
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Login Page</h1>

      {/* Koppel het formulier aan de handleSubmit-functie */}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label><br />
        {/* Koppel de input aan de state (value en onChange) */}
        <input
          type="text"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />

        <label htmlFor="wachtwoord">Wachtwoord:</label><br />
        {/* Koppel de input aan de state (value en onChange) */}
        <input
          type="password"
          id="wachtwoord"
          name="wachtwoord"
          value={wachtwoord}
          onChange={(e) => setWachtwoord(e.target.value)}
          required
        /><br /><br />

        <input type="checkbox" id="aangemeldblijven" name="aangemeldblijven" />
        <label htmlFor="aangemeldblijven"> Aangemeld blijven</label><br /><br />

        <button type="submit">Inloggen</button>
      </form>

      <p>Nog geen account?</p>

      {/* Dit was al correct in je page.js */}
      <Link href="/register">
        <button>Account aanmaken</button>
      </Link>
    </div>
  );
}