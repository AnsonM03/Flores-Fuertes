// app/components/Footer.js
"use client";

import { useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  
  useEffect(() => {
    // Zoek de span binnen deze component-instantie
    // Ik gebruik "footer-year" om conflicten te voorkomen
    const yearSpan = document.getElementById('footer-year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }, []); // Deze useEffect hoeft alleen bij de start te draaien

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <p>
          © <span id="footer-year"></span> Royal Flora Holland — Alle rechten voorbehouden.
        </p>
        <nav className="footer-nav" aria-label="Voettekstnavigatie">
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}