// app/page.js
// 'use client'; // Deze is niet langer nodig, de logica zit in Nav en Footer!
import Link from 'next/link';
import './styles/stylebp.css';

// Importeer je nieuwe componenten
import Nav from './components/Nav';
import Footer from './components/Footer';

export default function HomePage() {
  // De useEffect is verwijderd, want die logica zit nu in de
  // Nav.js en Footer.js componenten.

  return (
    <div className="page">
      
      {/* 1. Voeg je Nav-component toe */}
      <Nav />

      {/* 2. De hoofdinhoud blijft hetzelfde */}
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
                src="httpsDe media-01.imu.nl/storage/ppflowers.nl/24840/gerbera-1920x1080-1.jpeg"
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

      {/* 3. Voeg je Footer-component toe */}
      <Footer />
      
    </div>
  );
}