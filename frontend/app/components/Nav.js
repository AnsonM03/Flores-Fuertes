// app/components/Nav.js
"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "../context/AuthContext"; // Importeer je Auth context
import { useRouter } from "next/navigation"; // Importeer de router voor logout

export default function Nav() {
  // --- Hooks van je custom CSS Nav (voor animatie) ---
  const lastY = useRef(0);
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const burgerRef = useRef(null);
  const pathname = usePathname();

  // --- Hooks van je Tailwind Nav (voor auth) ---
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();

  // --- Handler van je Tailwind Nav (voor auth) ---
  const handleLogout = () => {
    logout();
    router.push("/");
    // Zorg ervoor dat het mobiele menu sluit na uitloggen
    handleLinkClick(); 
  };

  // --- useEffect van je custom CSS Nav (voor animatie & burger) ---
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
  }, []); // Deze useEffect hoeft alleen bij de start te draaien

  // --- Helper van je custom CSS Nav (voor styling) ---
  const isActive = (path) => pathname === path;

  // --- Nieuwe Helper: Sluit mobiel menu bij link-klik ---
  const handleLinkClick = () => {
    const nav = navRef.current;
    const burger = burgerRef.current;
    
    // Sluit alleen als het menu daadwerkelijk open is
    if (nav && burger && nav.classList.contains('open')) {
      nav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  };

  return (
    // De structuur is van je custom CSS Nav
    <header className="site-header" ref={headerRef}>
      <div className="header-inner">
        
        {/* Brand/Logo (van custom CSS Nav) */}
        <Link className="brand" href="/" onClick={handleLinkClick}>
          <img
            src="https://www.royalfloraholland.com/assets/favicons/favicon-32x32.png"
            alt="Royal Flora Holland"
            className="brand-logo"
          />
          <span className="brand-text">Royal<br />Flora<br />Holland</span>
        </Link>

        {/* Welkom bericht (desktop) - van Tailwind Nav */}
        {/* Je kunt "nav-welcome" en "hidden-lg" stylen in je CSS */}
        {isLoggedIn && (
          <span className="nav-welcome hidden-lg">
            Welkom, {user?.voornaam || "Gebruiker"}
          </span>
        )}

        {/* Aangepaste navigatie met conditionele links */}
        <nav className="nav" id="nav" ref={navRef}>
          
          {/* Links die altijd zichtbaar zijn */}
          <Link href="/" className={`nav-link ${isActive('/') ? 'is-active' : ''}`} onClick={handleLinkClick}>
            Home
          </Link>

          {/* Conditionele links op basis van isLoggedIn */}
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
              
              {/* Geef de uitlogknop een 'nav-link' class + een extra class 
                  zodat je het als een knop kunt stylen in je CSS. */}
              <button onClick={handleLogout} className="nav-link nav-link-button">
                Uitloggen
              </button>
            </>
          ) : (
            <>
              {/* --- UITGELOGDE LINKS --- */}
              {/* Beslis of 'Veilingen' hier ook moet. In je Tailwind-versie stond hij buiten de check. */}
              <Link href="/veilingen" className={`nav-link ${isActive('/veilingen') ? 'is-active' : ''}`} onClick={handleLinkClick}>
                Veilingen
              </Link>
              <Link href="/login" className={`nav-link ${isActive('/login') ? 'is-active' : ''}`} onClick={handleLinkClick}>
                Login
              </Link>
              {/* Geef 'Registreren' ook een knop-class */}
              <Link href="/register" className={`nav-link nav-link-button ${isActive('/register') ? 'is-active' : ''}`} onClick={handleLinkClick}>
                Registreren
              </Link>
            </>
          )}
        </nav>

        {/* Burger knop (van custom CSS Nav) */}
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