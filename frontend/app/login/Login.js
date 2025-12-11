// app/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const loginData = {
      Email: email,
      Wachtwoord: wachtwoord,
    };

    try {
      const response = await fetch("http://localhost:5281/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ★ cookies meesturen én ontvangen
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        alert("Inloggen mislukt!");
        return;
      }

      const gebruiker = await response.json();

      // ★ JWT zit nu in een HttpOnly cookie (gezet door de backend)
      // We slaan alleen de gebruiker op in localStorage
      localStorage.setItem("token", gebruiker.token);
      localStorage.setItem("gebruiker", JSON.stringify(gebruiker));

      // Update AuthContext
      login(gebruiker);

      const rol = (gebruiker.gebruikerType || "").toLowerCase();

      if (rol === "klant") {
        router.push("/");
      } else if (rol === "aanvoerder" || rol === "veilingmeester") {
        router.push("/producten");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login fout:", error);
      alert("Er ging iets mis. Probeer opnieuw.");
    }
  };

  return (
    <main className="main auth">
      <section className="auth-wrap">
        <div className="auth-card">
          <div className="auth-media">
            <img src="/loginFH.png" alt="Login visual" />
          </div>

          <div className="auth-form">
            <h2>Inloggen</h2>

            <form onSubmit={handleSubmit}>
              <label htmlFor="email">E-mail*</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label htmlFor="wachtwoord">Wachtwoord*</label>
              <input
                type="password"
                id="wachtwoord"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                required
              />

              <div className="checkbox-row">
                <input type="checkbox" id="aangemeldblijven" />
                <label htmlFor="aangemeldblijven">Aangemeld blijven</label>
              </div>

              <button type="submit" className="btn">
                Inloggen
              </button>
            </form>

            <Link href="/register" className="auth-cta">
              <span>
                <strong>Nog geen account?</strong>
                <br />
                Account aanmaken
              </span>
              <svg viewBox="0 0 24 24">
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