"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from "../context/AuthContext";

export default function Nav() {
  const lastY = useRef(0);
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const burgerRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const { gebruiker, logout, loading } = useAuth(); 
  const isLoggedIn = !!gebruiker;
  const rol = gebruiker?.gebruikerType?.toLowerCase();

  const handleLogout = () => {
    logout();
    router.push("/");
    handleLinkClick(); 
  };

  const isActive = (path) => pathname === path;

  const handleLinkClick = () => {
    const nav = navRef.current;
    const burger = burgerRef.current;
    
    if (nav && burger && nav.classList.contains('open')) {
      nav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  };

  // !! FIX: Moved useEffect UP, before the 'if (loading)' check
  useEffect(() => {
    const header = headerRef.current;
    const nav = navRef.current;
    const burger = burgerRef.current;

    // Safety check: if loading is true, these refs might be null, so we return safely
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
  }, [loading]); // Added loading dependency to re-run when elements mount

  // !! FIX: Now it is safe to return early
  // Wait until auth loading is finished before rendering links
  if (loading) return null;

  const naam = [
    gebruiker?.Voornaam || gebruiker?.voornaam, 
    gebruiker?.Achternaam || gebruiker?.achternaam
  ].filter(Boolean).join(" ") || "Gebruiker";

  return (
    <header className="site-header" ref={headerRef}>
      <div className="header-inner">
        <Link className="brand" href="/" onClick={handleLinkClick}>
          <img
            src="https://www.royalfloraholland.com/assets/favicons/favicon-32x32.png"
            alt="Royal Flora Holland"
            className="brand-logo"
          />
          <span className="brand-text">Royal<br />Flora<br />Holland</span>
        </Link>

        {isLoggedIn && (
          <span className="nav-welcome hidden-mobile">
            Welkom, {naam}
          </span>
        )}

        <nav className="nav" id="nav" ref={navRef}>
          <Link href="/" className={`nav-link ${isActive('/') ? 'is-active' : ''}`} onClick={handleLinkClick}>
            Home
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/veilingen" className={`nav-link ${isActive('/veilingen') ? 'is-active' : ''}`} onClick={handleLinkClick}>
                Veilingen
              </Link>
              <Link href="/account" className={`nav-link ${isActive('/account') ? 'is-active' : ''}`} onClick={handleLinkClick}>
                Account
              </Link>
              {rol === "veilingmeester" && (
                <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'is-active' : ''}`} onClick={handleLinkClick}>
                  Dashboard
                </Link>
              )}
              {rol === "aanvoerder" && (
                <Link href="/producten" className={`nav-link ${isActive("/producten") ? "is-active" : ""}`} onClick={handleLinkClick}>
                  Producten
                </Link>
              )}
              <button onClick={handleLogout} className="nav-link nav-link-button">
                Uitloggen
              </button>
            </>
          ) : (
            <>
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