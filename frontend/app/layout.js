// app/layout.js

import { Geist, Geist_Mono } from "next/font/google";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import "./globals.css"; // Je globals.css (met @tailwind directives)

// 1. IMPORTEER DE AUTH PROVIDER (dit was al correct)
import { AuthProvider } from "./context/AuthContext"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. METADATA BIJGEWERKT
export const Metadata = {
  title: "Flores Fuertes — Veilingsplatform",
  description: "Het grootste internationale bloemen veilingsplatform",
};

export default function RootLayout({ children }) {
  return (
    // 3. FONT VARIABELEN TOEGEVOEGD AAN <html>
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      
      {/* 4. TAILWIND KLASSEN VOOR EEN "STICKY FOOTER" LAYOUT */}
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <Nav /> {/* Je Header/Nav component */}
          
          {/* 5. <main> TAG MET "flex-1" LAAT DE INHOUD GROEIEN */}
          <main className="flex-1">
            {children} 
          </main>

          <Footer /> {/* Je Footer component */}
        </AuthProvider>
      </body>
    </html>
  );
}
