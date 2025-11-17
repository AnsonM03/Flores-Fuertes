// app/login/page.js
"use client";

import { useState } from "react"; // useEffect is verwijderd
import { useRouter } from "next/navigation";
import Link from "next/link";
// CSS-imports zijn niet meer nodig, ze staan in layout.js
import { useAuth } from "../context/AuthContext";

export default function Login() {
  // Je login-logica blijft ongewijzigd
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

      if (response.ok) {
        const gebruiker = await response.json();
        login(gebruiker); // Dit werkt nu correct door Fix 1
        alert("Inloggen gelukt!");

        // !! FIX: Waarschijnlijk heet de eigenschap 'gebruikerType', niet 'Rol'.
        // We voegen .toLowerCase() toe voor de zekerheid.
        const rol = gebruiker.gebruikerType?.toLowerCase();

        if (rol === "klant") {
          router.push("/dashboard"); // Zie Fix 3
        } else if (rol === "aanvoerder") {
          router.push("/dashboard"); // Zie Fix 3
        } else if (rol === "veilingmeester") {
          router.push("/dashboard"); // Zie Fix 3
        } else {
          router.push("/");
        }
      } else {
        alert("Inloggen mislukt. Controleer je gegevens.");
      }
    } catch (error) {
      console.error("Fout bij inloggen:", error);
      alert("Er is een fout opgetreden. Probeer opnieuw.");
    }
  };

  // De useEffect voor header/footer is VERWIJDERD

  return (
    // De <main> tag met 'auth' class blijft over
    <main className="main auth">
      {/* Verwijderd: <Nav /> */}
      
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
                <br />Account aanmaken
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
      
      {/* Verwijderd: <Footer /> */}
    </main>
  );
}