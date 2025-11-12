// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Royal Flora Holland — Veilingsplatform",
  description: "Het grootste internationale bloemen veilingsplatform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl" className={`${geistSans.variable} ${geistMono.variable}`}>
      {/* Voeg Tailwind classes toe aan body */}
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-50 font-sans min-h-screen">
        <a
        href="#main-content"
        className="sr-only focus:not-sr-only absolute top-2 left-2 bg-blue-600 text-white px-3 py-2 rounded"
      >
        Sla navigatie over
      </a>
        <AuthProvider>
          <Nav />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
