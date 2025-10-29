// app/components/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <p>
          {/* Vervangt het 'id="y"' script */}
          © {new Date().getFullYear()} Royal Flora Holland — Alle rechten voorbehouden.
        </p>
        <nav className="footer-nav">
          <Link href="#">Privacy</Link>
          <Link href="#">Cookies</Link>
          <Link href="#">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}