// app/components/Nav.js
"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext"; // 1. Importeer de Auth hook
import { useRouter } from "next/navigation";

// Een paar simpele stijlen om de <ul> als een nav te laten werken
const navStyle = {
  background: "#252323ff",
  padding: "1rem",
};

const ulStyle = {
  display: "flex",
  gap: "1rem",
  listStyle: "none",
  margin: 0,
  padding: 0,
};

export default function Nav() {
  // 2. Haal de login-status, gebruiker, en logout-functie op
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/"); // Stuur gebruiker naar home na uitloggen
  };

  return (
    <nav style={navStyle}>
      <ul style={ulStyle}>
        {/* Deze links zijn altijd zichtbaar */}
        <li><Link href="/">Home</Link></li>
        <li><Link href="/dashboard">Dashboard</Link></li>
        <li><Link href="/about">About</Link></li>

        {/* 3. Gebruik een 'ternary operator' om de links te wisselen */}
        {isLoggedIn ? (
          // --- HIER BEN JE INGELOGD ---
          <>
            <li>
              <Link href="/account">View Account</Link> {/* Je nieuwe knop */}
            </li>
            <li>
              {/* We gebruiken een <button> voor acties zoals uitloggen */}
              <button onClick={handleLogout}>Uitloggen</button>
            </li>
            {/* Optioneel: toon wie er is ingelogd */}
            <li style={{ marginLeft: 'auto' }}>Welkom, {user?.Voornaam}</li>
          </>
        ) : (
          // --- HIER BEN JE UITGELOGD ---
          <>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}