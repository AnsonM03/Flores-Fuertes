// app/page.js
'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import './styles/stylebp.css';


export default function HomePage() {
  useEffect(() => {
    // zet het jaartal in footer
    document.getElementById('y').textContent = new Date().getFullYear();

    // hamburger menu functionaliteit
    const burger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.site-header');

    const handleBurgerClick = () => {
      const open = burger.classList.toggle('open');
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    };

    const onScroll = () => {
      const y = window.scrollY;
      const down = y > window.lastY || 0;

      if (y > 10) header.classList.add('peek');
      else header.classList.remove('peek');

      if (down && y > 90) header.classList.add('hide');
      else header.classList.remove('hide');

      window.lastY = y;
    };

    burger?.addEventListener('click', handleBurgerClick);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      burger?.removeEventListener('click', handleBurgerClick);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="page">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="#">
            <img
              src="https://www.royalfloraholland.com/assets/favicons/favicon-32x32.png"
              alt="Royal Flora Holland"
              className="brand-logo"
            />
            <span className="brand-text">Royal<br />Flora<br />Holland</span>
          </Link>

          <nav className="nav" id="nav">
            <Link href="/" className="nav-link is-active">Home</Link>
            <Link href="/login" className="nav-link">Login</Link>
            <Link href="/register" className="nav-link">Registreren</Link>
            <Link href="/veilingen" className="nav-link">Veilingen</Link>
          </nav>

          <button className="hamburger" aria-label="Open menu" aria-controls="nav" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <video className="hero-video" autoPlay muted loop playsInline>
            <source src="https://video.wixstatic.com/video/11062b_0828340c55e44637bf72bd74a6c2089e/1080p/mp4/file.mp4?fileUsed=false" type="video/mp4" />
          </video>

          <div className="hero-overlay"></div>

          <div className="hero-content container">
            <h1 className="hero-title">
              Het grootste<br />
              internationale bloemen<br />
              veiling<span className="nowrap">splatform</span>
            </h1>

            <Link href="/veilingen" className="btn btn-primary">
              <span className="arrow">→</span> naar veilingen
            </Link>
          </div>
        </section>

        <section className="intro">
          <div className="container intro-content">
            <h2>Bloemen en planten maken onze wereld groener.</h2>
            <p>Ze kleuren onze huizen, tuinen en buurten en vergoenen onze steden.</p>
          </div>
        </section>

        <section className="mission">
          <div className="container mission-grid">
            <div className="mission-media">
              <img
                src="https://media-01.imu.nl/storage/ppflowers.nl/24840/gerbera-1920x1080-1.jpeg"
                alt="Bloemen in veilinghal"
              />
            </div>
            <div className="mission-text">
              <h2>Onze missie</h2>
              <p>
                Royal FloraHolland verbindt kwekers en kopers wereldwijd.
                Samen zorgen we ervoor dat bloemen en planten overal ter wereld
                mensen blij maken. We streven naar een duurzame, innovatieve en
                toekomstbestendige sierteeltsector.
              </p>
              <Link href="#" className="btn btn-primary">
                <span className="arrow">→</span> Lees meer
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <p>© <span id="y"></span> Royal Flora Holland — Alle rechten voorbehouden.</p>
          <nav className="footer-nav" aria-label="Voettekstnavigatie">
            <Link href="/privacy">Privacy</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
