// app/layout.js

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
//import Nav from "./components/Nav";
//import Footer from "./components/Footer";
import "./globals.css"; 
import { AuthProvider } from "./context/AuthContext"; 

export const Metadata = {
  title: "Flores Fuertes — Veilingsplatform",
  description: "Het grootste internationale bloemen veilingsplatform",
};

export default function RootLayout({ children }) {
  return (
    // 1. VOEG 'suppressHydrationWarning' TOE.
    //    De font-klassen zijn hier verwijderd.
    <html lang="en" suppressHydrationWarning>
      
      {/* 2. VOEG DE FONT-KLASSEN TOE AAN DE 'body' TAG. */}
      <body className={`flex flex-col min-h-screen ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <main className="flex-1">
            {children} 
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}