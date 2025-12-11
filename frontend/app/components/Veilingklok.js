"use client";
import { useEffect, useState } from "react";
import "../styles/veilingKlok.css";

export default function VeilingKlok({ veiling, gebruikerRol, onKoop, setVeiling }) {
  const minimumPrijs = 5;
  const [status, setStatus] = useState("wachten");
  const [huidigePrijs, setHuidigePrijs] = useState(veiling?.veilingPrijs);

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [duur, setDuur] = useState(20); // seconden

  useEffect(() => {
    if (!veiling?.startTijd || !veiling?.eindTijd) return;

    const start = new Date(veiling.startTijd);
    const eind = new Date(veiling.eindTijd);
    const totaal = (eind - start) / 1000;
    const dalingPerSeconde = (veiling.veilingPrijs - minimumPrijs) / totaal;

    function update() {
      const nu = new Date();

      if (nu < start) {
        setStatus("wachten");
        setHuidigePrijs(veiling.veilingPrijs);
      } else if (nu >= start && nu < eind) {
        setStatus("actief");
        const verstreken = (nu - start) / 1000;
        setHuidigePrijs(
          Math.max(
            veiling.veilingPrijs - verstreken * dalingPerSeconde,
            minimumPrijs
          )
        );
      } else {
        setStatus("afgelopen");
        setHuidigePrijs(minimumPrijs);
      }
    }

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [veiling]);

  // ⭐ Start veiling vanuit popup
  async function startVeiling() {
    try {
      const res = await fetch("http://localhost:5281/api/Veilingen/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          veiling_Id: veiling.veiling_Id,
          duurInSeconden: duur
        })
      });

      if (!res.ok) {
        alert("Kon veiling niet starten.");
        return;
      }

      const data = await res.json();

      setVeiling(prev => ({
        ...prev,
        startTijd: data.startTijd,
        eindTijd: data.eindTijd
      }));

      alert("Veiling gestart!");
      setPopupOpen(false);
    } catch (err) {
      console.error(err);
      alert("Serverfout bij starten veiling.");
    }
  }

  return (
    <div className="klok-wrapper">
      <h2 className="klok-title">Klokveiling</h2>

      <p className={`klok-status klok-status--${status}`}>
        {status === "wachten" && "Wachten op start..."}
        {status === "actief" && "Veiling actief"}
        {status === "afgelopen" && "Afgelopen"}
      </p>

      <div className="dutch-clock-container">
        <svg className="dutch-clock" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" className="clock-ring" />
          <text x="100" y="115" textAnchor="middle" className="clock-price">
            €{huidigePrijs?.toFixed(2)}
          </text>
        </svg>
      </div>

      {/* KOPER */}
      {gebruikerRol === "klant" && (
        <button
          className="klok-btn klok-btn--koop"
          disabled={status !== "actief"}
          onClick={() => onKoop(huidigePrijs)}
        >
          Koop nu
        </button>
      )}

      {/* VEILINGMEESTER START KNOP */}
      {gebruikerRol === "veilingmeester" && status !== "actief" && (
        <button
          className="klok-btn klok-btn--start"
          onClick={() => setPopupOpen(true)}
        >
          Start veilen
        </button>
      )}

      {/* ⭐ POPUP */}
      {popupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h3 className="popup-title">Start veiling</h3>

            <label className="block mb-2 font-medium">
              Duur (seconden)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={duur}
              onChange={(e) => setDuur(Number(e.target.value))}
              className="popup-input"
            />

            <div className="popup-buttons">
              <button
                className="popup-btn cancel"
                onClick={() => setPopupOpen(false)}
              >
                Annuleren
              </button>

              <button
                className="popup-btn confirm"
                onClick={startVeiling}
              >
                Start veilen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}