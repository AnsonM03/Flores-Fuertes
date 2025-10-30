"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
// 1. IMPORTEER DE AUTH HOOK
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  
  const router = useRouter();
  // 2. HAAL DE GLOBALE LOGIN FUNCTIE OP
  const { login } = useAuth();

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
        
        // 3. VERTEL DE HELE APP DAT JE BENT INGELOGD!
        login(gebruiker);

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

  // ... de rest van je JSX-formulier blijft hetzelfde ...
  return (
    <div style={{ padding: "40px" }}>
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label><br />
        <input
          type="text"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <label htmlFor="wachtwoord">Wachtwoord:</label><br />
        <input
          type="password"
          id="wachtwoord"
          name="wachtwoord"
          value={wachtwoord}
          onChange={(e) => setWachtwoord(e.target.value)}
          required
        /><br /><br />
        <input type="checkbox" id="aangemeldblijven" name="aangemeldenblijven" />
        <label htmlFor="aangemeldblijven"> Aangemeld blijven</label><br /><br />
        <button type="submit">Inloggen</button>
      </form>
      <p>Nog geen account?</p>
      <Link href="/register">
        <button>Account aanmaken</button>
      </Link>
    </div>
  );
}