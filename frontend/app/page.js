// app/page.js
import Link from 'next/link';

export default function HomePage() {
  return (
    // Je <main> HTML, vertaald naar JSX
    <main className="main">
      <section className="hero">
        {/* 'autoPlay', 'muted', 'loop' en 'playsInline' moeten in camelCase */}
        <video className="hero-video" autoPlay muted loop playsInline>
          <source 
            src="https://video.wixstatic.com/video/11062b_0828340c55e44637bf72bd74a6c2089e/1080p/mp4/file.mp4?fileUsed=false" 
            type="video/mp4" 
          />
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
    </main>
  );
}