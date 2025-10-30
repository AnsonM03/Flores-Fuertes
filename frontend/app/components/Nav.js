// app/components/Nav.js
"use client";

import { useState } from "react"; // Importeer useState voor de toggle
import Link from "next/link";
import Image from "next/image"; // Gebruik next/image voor logo's
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Nav() {
  const { isLoggedIn, user, logout } = useAuth(); // Je bestaande auth logica
  const router = useRouter();
  
  // 1. Vervangt de 'addEventListener'
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Zet de state op het tegenovergestelde
  };

  return (
    // 'className' vervangt 'class'
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/">
          {/* Gebruik <Image> voor performance. Pas 'width' en 'height' aan. */}
          <Image 
            src="/logo.svg" // Zorg dat logo.svg in de 'public' map staat
            alt="Royal Flora Holland" 
            className="brand-logo"
            width={40} // Vervang door de werkelijke breedte
            height={40} // Vervang door de werkelijke hoogte
          />
          <span className="brand-text">Royal Flora<br />Holland</span>
        </Link>
        
        {/* 2. Dynamische className voor de 'open' state */}
        <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
          <Link href="/" className="nav-link">Home</Link>
          
          {/* 3. Je 'useAuth' logica vervangt de statische links */}
          {isLoggedIn ? (
            <>
              <Link href="/veilingen" className="nav-link">Veilingen</Link>
              <Link href="/account" className="nav-link">Account</Link>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <li>
                <button onClick={handleLogout} className="nav-link-button">Uitloggen</button>
              </li>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">Login</Link>
              <Link href="/register" className="nav-link">Registreren</Link>
            </>
          )}
        </nav>

        {/* 4. 'onClick' vervangt 'addEventListener' */}
        <button 
          className={`hamburger ${isMenuOpen ? 'open' : ''}`} 
          aria-label="Open menu"
          onClick={toggleMenu}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}