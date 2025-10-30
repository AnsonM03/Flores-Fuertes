// app/components/Footer.js
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 text-gray-600">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Copyright Tekst */}
          <p className="text-sm text-center md:text-left">
            {/* Gebruik van het Flores Fuertes logo i.p.v. Royal Flora Holland */}
            © {new Date().getFullYear()} Flores Fuertes — Alle rechten voorbehouden.
          </p>
          
          {/* Footer Navigatie */}
          <nav className="flex gap-6">
            <Link href="#" className="text-sm hover:text-green-800 transition-colors">Privacy</Link>
            <Link href="#" className="text-sm hover:text-green-800 transition-colors">Cookies</Link>
            <Link href="#" className="text-sm hover:text-green-800 transition-colors">Contact</Link>
          </nav>

        </div>
      </div>
    </footer>
  );
}