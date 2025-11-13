"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "../context/AuthContext"; // Importeer je Auth context
import { useRouter } from "next/navigation"; // Importeer de router voor logout

export default function Nav() {
  const { isLoggedIn, gebruiker, logout } = useAuth();
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

  const naam = [gebruiker?.voornaam, gebruiker?.achternaam].filter(Boolean).join(" ") || "Gebruiker";

  return (
    <header className="bg-green-900 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center h-20">
        {/* Logo + Naam + Gebruiker */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/flores-fuertes-logo.png"
              alt="Flores Fuertes Logo"
              width={50}
              height={50}
              className="rounded-md"
              priority
            />
            <span className="font-bold text-xl leading-tight hidden sm:block">
              Flores<br />Fuertes
            </span>
          </Link>

          {isLoggedIn && (
            <span className="hidden sm:inline-block text-white font-medium">
              Welkom, {naam}
            </span>
          )}
        </div>

        {/* Desktop Navigatie */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="hover:text-green-200 transition-colors" aria-current={router.pathname === "/" ? "page" : undefined}>Home</Link>
          <Link href="/veilingen" className="hover:text-green-200 transition-colors" aria-current={router.pathname === "/veilingen" ? "page" : undefined}>Veilingen</Link>

        {/* Aangepaste navigatie met conditionele links */}
        <nav className="nav" id="nav" ref={navRef}>
          
          {/* Links die altijd zichtbaar zijn */}
          <Link href="/" className={`nav-link ${isActive('/') ? 'is-active' : ''}`} onClick={handleLinkClick}>
            Home
          </Link>

          {/* Conditionele links op basis van isLoggedIn */}
          {isLoggedIn ? (
            <>
              <Link href="/account" className="hover:text-green-200 transition-colors" aria-current={router.pathname === "/account" ? "page" : undefined}>Account</Link>
              <Link href="/dashboard" className="hover:text-green-200 transition-colors" aria-current={router.pathname === "/dashboard" ? "page" : undefined}>Dashboard</Link>
              <button 
                onClick={handleLogout} 
                className="bg-white text-green-900 px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors"
                aria-label="Uitloggen"
              >
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

        {/* Hamburger Knop Mobiel */}
        <button
          className="lg:hidden z-20"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          <span></span><span></span><span></span>
        </button>
      </div>

      {/* Mobiel Menu */}
      <div 
        className={`
          lg:hidden absolute top-0 left-0 w-full h-screen bg-green-900 
          flex flex-col items-center justify-center gap-8 text-xl
          transition-transform duration-300 ease-in-out z-10
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Link href="/" className="hover:text-green-200" onClick={toggleMenu}>Home</Link>
        <Link href="/veilingen" className="hover:text-green-200" onClick={toggleMenu}>Veilingen</Link>

        {isLoggedIn ? (
          <>
            <Link href="/account" className="hover:text-green-200" onClick={toggleMenu}>
              Account ({gebruiker?.voornaam || "Gebruiker"})
            </Link>
            <Link href="/dashboard" className="hover:text-green-200" onClick={toggleMenu}>Dashboard</Link>
            <button 
              onClick={handleLogout} 
              className="bg-white text-green-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-200"
              aria-label="Uitloggen"
            >
              Uitloggen
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-green-200" onClick={toggleMenu}>Login</Link>
            <Link 
              href="/register" 
              className="bg-white text-green-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-200"
              onClick={toggleMenu}
            >
              Registreren
            </Link>
          </>
        )}
      </div>
    </header>
  );
}