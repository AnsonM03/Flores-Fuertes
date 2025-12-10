"use client";

import { useEffect, useState } from "react";
import "../styles/veilingKlok.css";

export default function VeilingKlok({ veiling, gebruikerRol, onKoop }) {
  const minimumPrijs = 5;

  const [status, setStatus] = useState("wachten");
  const [huidigePrijs, setHuidigePrijs] = useState(
    veiling?.veilingPrijs || 100
  );

  useEffect(() => {
    if (!veiling?.startTijd || !veiling?.eindTijd) return;

    const start = new Date(veiling.startTijd);
    const eind = new Date(veiling.eindTijd);

    const totaleSeconden = Math.max((eind - start) / 1000, 1);
    const startPrijs = veiling.veilingPrijs;
    const dalingPerSeconde = (startPrijs - minimumPrijs) / totaleSeconden;

    function updatePrijs() {
      const nu = new Date();

      if (nu < start) {
        setStatus("wachten");
        setHuidigePrijs(startPrijs);
      } else if (nu >= start && nu < eind) {
        setStatus("actief");
        const verstreken = (nu - start) / 1000;
        const nieuwePrijs = Math.max(
          startPrijs - verstreken * dalingPerSeconde,
          minimumPrijs
        );
        setHuidigePrijs(nieuwePrijs);
      } else {
        setStatus("afgelopen");
        setHuidigePrijs(minimumPrijs);
      }
    }

    updatePrijs();
    const interval = setInterval(updatePrijs, 1000);
    return () => clearInterval(interval);
  }, [veiling]);

  if (!veiling) {
    return <p className="no-veiling">Geen actieve veiling geselecteerd</p>;
  }

  const start = new Date(veiling.startTijd);
  const eind = new Date(veiling.eindTijd);

  const rotatie = (() => {
    if (status !== "actief") return 0;

    const totaalSec = (eind - start) / 1000;
    const verstreken = (new Date() - start) / 1000;
    const percentage = Math.min(verstreken / totaalSec, 1);

    return percentage * 360;
  })();

  const startTijd = start.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const eindTijd = eind.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="klok-wrapper">
      <h2 className="klok-title">Klokveiling</h2>

      <p className={`klok-status klok-status--${status}`}>
        {status === "wachten" && `Veiling start om ${startTijd}`}
        {status === "actief" && "Veiling is actief"}
        {status === "afgelopen" && "Veiling afgelopen"}
      </p>

      <div className="dutch-clock-container">
        <svg className="dutch-clock" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" className="clock-ring" />

          <line
            x1="100"
            y1="100"
            x2="100"
            y2="20"
            className="clock-hand"
            style={{
              transform: `rotate(${rotatie}deg)`,
              transformOrigin: "100px 100px",
            }}
          />

          <text x="100" y="115" textAnchor="middle" className="clock-price">
            €{huidigePrijs.toFixed(2)}
          </text>
        </svg>
      </div>

      <p className="clock-label">
        {status === "actief"
          ? "Prijs daalt..."
          : status === "wachten"
          ? "Wachten..."
          : "Afgelopen"}
      </p>

      <div className="klok-buttons">
        {gebruikerRol === "klant" && (
          <button
            className="klok-btn klok-btn--koop"
            disabled={status !== "actief"}
            onClick={() => onKoop && onKoop(huidigePrijs)}
          >
            {status === "actief" ? "Koop nu" : "Verkocht"}
          </button>
        )}

        {gebruikerRol === "veilingmeester" && (
          <>
            <button
              className="klok-btn klok-btn--start"
              disabled={status === "actief" || status === "afgelopen"}
            >
              Start veiling
            </button>

            <button
              className="klok-btn klok-btn--stop"
              disabled={status !== "actief"}
              onClick={() => setStatus("afgelopen")}
            >
              Stop veiling
            </button>
          </>
        )}
      </div>

      <div className="klok-info-card">
        <p className="klok-field-label">
          Starttijd: <span className="klok-field-value">{startTijd}</span>
        </p>
        <p className="klok-field-label">
          Eindtijd: <span className="klok-field-value">{eindTijd}</span>
        </p>
        <p className="klok-field-label">
          Minimale prijs:{" "}
          <span className="klok-field-value">€{minimumPrijs.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}