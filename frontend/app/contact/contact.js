"use client";

import { useEffect } from "react";
import Link from "next/link";
import "../../styles/stylebp.css";
import "../../styles/contact.css";

export default function Contact() {
  useEffect(() => {
    // Zet jaar in footer
    const yearSpan = document.getElementById("y");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }

    // Hamburger menu
    const burger = document.querySelector(".hamburger");
    const nav = document.getElementById("nav");

    const toggleNav = () => {
      const open = burger.classList.toggle("open");
      nav.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
    };

    burger?.addEventListener("click", toggleNav);
    return () => burger?.removeEventListener("click", toggleNav);
  }, []);

  return (
    <div className="page">
      {/* Header */}
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand">
            <img
              src="https://www.royalfloraholland.com/assets/favicons/favicon-32x32.png"
              alt="Royal Flora Holland"
              className="brand-logo"
            />
            <span className="brand-text">
              Royal<br />Flora<br />Holland
            </span>
          </Link>

          <nav className="nav" id="nav">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/login" className="nav-link">Login</Link>
            <Link href="/register" className="nav-link">Registreren</Link>
            <Link href="/contact" className="nav-link is-active">Contact</Link>
          </nav>

          <button className="hamburger" aria-label="Open menu" aria-controls="nav" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      {/* Contactsectie */}
      <main className="main contact-page">
        <section className="contact_us">
          <div className="contact_inner">
            {/* Form */}
            <div className="contact_form_inner">
              <div className="contact_field">
                <h3>Contact ons</h3>
                <p>Voel je vrij om contact met ons te leggen. We proberen zo snel mogelijk te reageren.</p>

                <form className="contact_form" onSubmit={(e) => e.preventDefault()}>
                  <input type="text" className="form-control" placeholder="Name" required />
                  <input type="email" className="form-control" placeholder="Email" required />
                  <textarea className="form-control" placeholder="Message" rows="4" required />
                  <button className="contact_form_submit" type="submit">Versturen</button>
                </form>
              </div>
            </div>

            {/* Social icons (leeg) */}
            <div className="right_conatct_social_icon">
              <ul className="socil_item_inner">
                <li><a href="#"><i className="fab fa-facebook-square"></i></a></li>
                <li><a href="#"><i className="fab fa-instagram"></i></a></li>
                <li><a href="#"><i className="fab fa-twitter"></i></a></li>
              </ul>
            </div>

            {/* Donkere info kaart */}
            <aside className="contact_info_sec">
              <h4>Contact Informatie</h4>
              <div className="info_single">
                <i className="fas fa-headset"></i>
                <span>+31 6 44557632</span>
              </div>
              <div className="info_single">
                <i className="fas fa-envelope-open-text"></i>
                <span>info@FHveilingen.com</span>
              </div>
              <div className="info_single">
                <i className="fas fa-map-marked-alt"></i>
                <span>Haagse Hogeschool<br />Den Haag</span>
              </div>
            </aside>
          </div>
        </section>

        {/* Map */}
        <section className="map_sec">
          <div className="map_inner">
            <h4>Vind ons op de map</h4>
            <div className="map_bind">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2452.705453252983!2d4.323587758719588!3d52.066886701824416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5b6e175fe3619%3A0x9d1994a880751d7a!2sDe%20Haagse%20Hogeschool!5e0!3m2!1snl!2snl!4v1761809831961!5m2!1snl!2snl"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <p>© <span id="y"></span> Royal Flora Holland — Alle rechten voorbehouden.</p>
          <nav className="footer-nav">
            <Link href="/privacy">Privacy</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
