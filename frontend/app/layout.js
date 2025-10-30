// app/layout.js

import { Geist, Geist_Mono } from "next/font/google";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import "./globals.css";

// 1. IMPORTEER DE AUTH PROVIDER
import { AuthProvider } from "./context/AuthContext"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const Metadata = {
  title: "Royal Flora Holland — Veilingsplatform",
  description: "Het grootste internationale bloemen veilingsplatform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Nav /> {/* Je Header/Nav component */}
          
          {/* children is de content van je pagina (bv. app/page.js) */}
          {children} 

          <Footer /> {/* 2. Voeg de Footer toe */}
        </AuthProvider>
      </body>
    </html>
  );
}