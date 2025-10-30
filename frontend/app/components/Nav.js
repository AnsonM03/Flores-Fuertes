// app/components/Nav.js
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Nav() {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-green-900 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center h-20">
        
        {/* Merk (Logo en Naam) */}
        <Link className="flex items-center gap-3" href="/">
          <Image
            src="/flores-fuertes-logo.png" // Pad naar je logo in /public
            alt="Flores Fuertes Logo"
            width={50} // Aangepaste breedte
            height={50} // Aangepaste hoogte
            className="rounded-md" // Licht afgeronde hoeken
            priority // Laad dit belangrijke element als eerste
          />
          <span className="font-bold text-xl leading-tight hidden sm:block">
            Flores<br />Fuertes
          </span>
        </Link>

        {/* Desktop Navigatie */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="hover:text-green-200 transition-colors">Home</Link>
          
          {isLoggedIn ? (
            <>
              <Link href="/veilingen" className="hover:text-green-200 transition-colors">Veilingen</Link>
              <Link href="/account" className="hover:text-green-200 transition-colors">Account</Link>
              <Link href="/dashboard" className="hover:text-green-200 transition-colors">Dashboard</Link>
              <button 
                onClick={handleLogout} 
                className="bg-white text-green-900 px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors"
              >
                Uitloggen
              </button>
            </>
          ) : (
            <>
              <Link href="/veilingen" className="hover:text-green-200 transition-colors">Veilingen</Link>
              <Link href="/login" className="hover:text-green-200 transition-colors">Login</Link>
              <Link 
                href="/register" 
                className="bg-green text-green-900 px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors"
              >
                Registreren
              </Link>
            </>
          )}
        </nav>

        {/* Hamburger Knop (zichtbaar op mobiel) */}
        <button
          className="lg:hidden z-20"
          aria-label="Open menu"
          onClick={toggleMenu}
        >
          {/* Icoon (3 streepjes) */}
          <div className="space-y-1.5">
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </div>
        </button>

      </div>

      {/* Mobiel Menu (verschuift of verschijnt) */}
      <div 
        className={`
          lg:hidden absolute top-0 left-0 w-full h-screen bg-green-900 
          flex flex-col items-center justify-center gap-8 text-xl
          transition-transform duration-300 ease-in-out z-10
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Link href="/" className="hover:text-green-200" onClick={toggleMenu}>Home</Link>
        
        {isLoggedIn ? (
          <>
            <Link href="/veilingen" className="hover:text-green-200" onClick={toggleMenu}>Veilingen</Link>
            <Link href="/account" className="hover:text-green-200" onClick={toggleMenu}>Account</Link>
            <Link href="/dashboard" className="hover:text-green-200" onClick={toggleMenu}>Dashboard</Link>
            <button 
              onClick={handleLogout} 
              className="bg-white text-green-900 px-6 py-3 rounded-md font-semibold hover:bg-gray-200"
            >
              Uitloggen
            </button>
          </>
        ) : (
          <>
            <Link href="/veilingen" className="hover:text-green-200" onClick={toggleMenu}>Veilingen</Link>
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