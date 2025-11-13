// app/components/Nav.js
"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Nav() {
  // --- Hooks ---
  const lastY = useRef(0);
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const burgerRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  // --- Auth Hooks ---
  // BELANGRIJK: We halen hier 'gebruiker' op (niet 'user')
  const { isLoggedIn, gebruiker, logout } = useAuth(); 

  // --- Auth Handler ---
  const handleLogout = () => {
    logout();
    router.push("/");
    handleLinkClick(); 
  };

  // --- Animatie & Burger Menu Effect ---
  useEffect(() => {
    const header = headerRef.current;
    const nav = navRef.current;
    const burger = burgerRef.current;

    if (!header || !nav || !burger) return;

    const handleBurgerClick = () => {
      const open = burger.classList.toggle('open');
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    };

    const onScroll = () => {
      const y = window.scrollY;
      const down = y > lastY.current;

      if (y > 10) header.classList.add('peek');
      else header.classList.remove('peek');

      if (down && y > 90) header.classList.add('hide');
      else header.classList.remove('hide');

      lastY.current = y;
    };

    burger.addEventListener('click', handleBurgerClick);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      burger.removeEventListener('click', handleBurgerClick);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // --- Styling Helper ---
  const isActive = (path) => pathname === path;

  // --- Mobiel Menu Helper ---
  const handleLinkClick = () => {
    const nav = navRef.current;
    const burger = burgerRef.current;
    
    if (nav && burger && nav.classList.contains('open')) {
      nav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  };
  
  // --- NAAM LOGICA (De Fix) ---
  // We gebruiken 'gebruiker' ipv 'user'.
  // We checken zowel op hoofdletters (C# API) als kleine letters (JS conventie).
  const naam = [
    gebruiker?.Voornaam || gebruiker?.voornaam, 
    gebruiker?.Achternaam || gebruiker?.achternaam
  ].filter(Boolean).join(" ") || "Gebruiker";

  return (
    <header className="site-header" ref={headerRef}>
      <div className="header-inner">
        
        {/* Brand/Logo */}
        <Link className="brand" href="/" onClick={handleLinkClick}>
          <img
            src="https://www.royalfloraholland.com/assets/favicons/favicon-32x32.png"
            alt="Royal Flora Holland"
            className="brand-logo"
          />
          <span className="brand-text">Royal<br />Flora<br />Holland</span>
        </Link>

        {/* Welkom bericht (Desktop) */}
        {isLoggedIn && (
          <span className="nav-welcome hidden-mobile">
            Welkom, {naam}
          </span>
        )}

        {/* Navigatie */}
        <nav className="nav" id="nav" ref={navRef}>
          
          <Link href="/" className={`nav-link ${isActive('/') ? 'is-active' : ''}`} onClick={handleLinkClick}>
            Home
          </Link>

          {isLoggedIn ? (
            <>
              {/* --- INGELOGDE LINKS --- */}
              <Link href="/veilingen" className={`nav-link ${isActive('/veilingen') ? 'is-active' : ''}`} onClick={handleLinkClick}>
                Veilingen
              </Link>
              <Link href="/account" className={`nav-link ${isActive('/account') ? 'is-active' : ''}`} onClick={handleLinkClick}>
                Account
              </Link>
              <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'is-active' : ''}`} onClick={handleLinkClick}>
                Dashboard
              </Link>
              
              <button onClick={handleLogout} className="nav-link nav-link-button">
                Uitloggen
              </button>
            </>
          ) : (
            <>
              {/* --- UITGELOGDE LINKS --- */}
              <Link href="/veilingen" className={`nav-link ${isActive('/veilingen') ? 'is-active' : ''}`} onClick={handleLinkClick}>
                Veilingen
              </Link>
              <Link href="/login" className={`nav-link ${isActive('/login') ? 'is-active' : ''}`} onClick={handleLinkClick}>
                Login
              </Link>
              <Link href="/register" className={`nav-link nav-link-button ${isActive('/register') ? 'is-active' : ''}`} onClick={handleLinkClick}>
                Registreren
              </Link>
            </>
          )}
        </nav>

        {/* Burger knop */}
        <button 
          className="hamburger" 
          aria-label="Open menu" 
          aria-controls="nav" 
          aria-expanded="false" 
          ref={burgerRef}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}