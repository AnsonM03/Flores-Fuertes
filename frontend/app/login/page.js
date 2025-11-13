"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../styles/stylebp.css";
import "../styles/auth.css";
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
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const gebruiker = await response.json();
        localStorage.setItem("gebruiker", JSON.stringify(gebruiker));
        login(gebruiker);
        alert("Inloggen gelukt!");

        if (gebruiker.Rol === "Klant") {
          router.push("/klant/dashboard");
        } else if (gebruiker.Rol === "Aanvoerder") {
          router.push("/aanvoerder/dashboard");
        } else if (gebruiker.Rol === "Veilingmeester") {
          router.push("/veilingmeester/dashboard");
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

  useEffect(() => {
    // Zet het jaartal in footer
    const yearSpan = document.getElementById("y");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }

    // Hamburger menu
    const burger = document.querySelector(".hamburger");
    const nav = document.getElementById("nav");
    const header = document.querySelector(".site-header");
    let lastY = window.scrollY;

    const toggleNav = () => {
      const open = burger.classList.toggle("open");
      nav.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
    };

    const handleScroll = () => {
      const y = window.scrollY;
      const down = y > lastY;
      if (y > 10) header.classList.add("peek");
      else header.classList.remove("peek");
      if (down && y > 90) header.classList.add("hide");
      else header.classList.remove("hide");
      lastY = y;
    };

    burger?.addEventListener("click", toggleNav);
    window.addEventListener("scroll", handleScroll);

    return () => {
      burger?.removeEventListener("click", toggleNav);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="page">
      {/* HEADER */}
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand">
            <img
              src="https://www.royalfloraholland.com/assets/favicons/favicon-32x32.png"
              alt="Royal Flora Holland"
              className="brand-logo"
            />
            <span className="brand-text">
              Royal<br />Flora<br />Holland
            </span>
          </Link>

          <nav className="nav" id="nav">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/login" className="nav-link is-active">
              Login
            </Link>
            <Link href="/register" className="nav-link">
              Registreren
            </Link>
            <Link href="/veilingen" className="nav-link">
              Veilingen
            </Link>
          </nav>

          <button
            className="hamburger"
            aria-label="Open menu"
            aria-controls="nav"
            aria-expanded="false"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* MAIN LOGIN FORM */}
      <main className="main auth">
        <section className="auth-wrap">
          <div className="auth-card">
            <div className="auth-media">
              <img src="/images/loginFH.png" alt="Login visual" />
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
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <p>
            © <span id="y"></span> Royal Flora Holland — Alle rechten
            voorbehouden.
          </p>
          <nav className="footer-nav">
            <Link href="/privacy">Privacy</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
