// app/layout.js

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";

// Importeer je custom styles hier zodat ze overal gelden
import "./styles/stylebp.css";
import "./styles/auth.css";

import { AuthProvider } from "./context/AuthContext";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

export const Metadata = {
  title: "Flores Fuertes — Veilingsplatform",
  description: "Het grootste internationale bloemen veilingsplatform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Verwijder Tailwind classes zoals 'flex', 'flex-col', 'min-h-screen'.
        Je 'stylebp.css' beheert nu de layout, beginnend met de 'page' class.
      */}
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          {/* De 'page' div wikkelt alles in, net als in je originele bestanden */}
          <div className="page">
            <Nav /> 
            
            {/* 'children' is de content van je specifieke pagina 
                (page.js, login/page.js, etc.) */}
            {children}
            
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}