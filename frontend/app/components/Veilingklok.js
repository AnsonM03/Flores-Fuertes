"use client";
import { useEffect, useMemo, useState } from "react";
import "../styles/veilingKlok.css";

export default function VeilingKlok({
  veiling,
  gebruikerRol,
  token,
  setVeiling,
  actiefProduct, // het actieve veilingproduct met startPrijs
}) {
  const [status, setStatus] = useState("wachten");
  const [huidigePrijs, setHuidigePrijs] = useState(0);

  // Popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [duur, setDuur] = useState(20);          // seconden
  const [minPrijs, setMinPrijs] = useState(1);   // veilingmeester kiest dit

  // startprijs komt van actief product
  const startPrijs = useMemo(() => {
    const p = Number(actiefProduct?.startPrijs ?? actiefProduct?.prijs ?? 0);
    return isFinite(p) ? p : 0;
  }, [actiefProduct]);

  useEffect(() => {
    if (!veiling?.startTijd || !veiling?.eindTijd) {
      setStatus("wachten");
      setHuidigePrijs(startPrijs || 0);
      return;
    }

    const start = new Date(veiling.startTijd);
    const eind = new Date(veiling.eindTijd);
    const totaal = Math.max(0.1, (eind - start) / 1000);

    // minimum prijs moet < start prijs anders lijkt de klok stil te staan
    const min = Math.max(0, Number(veiling?.minimumPrijs ?? 0)); // als je dit niet opslaat: 0
    const echteStart = Math.max(startPrijs, min);

    const dalingPerSeconde = (echteStart - min) / totaal;

    function update() {
      const nu = new Date();

      if (nu < start) {
        setStatus("wachten");
        setHuidigePrijs(echteStart);
        return;
      }

      if (nu >= start && nu < eind) {
        setStatus("actief");
        const verstreken = (nu - start) / 1000;
        const prijs = Math.max(echteStart - verstreken * dalingPerSeconde, min);
        setHuidigePrijs(prijs);
        return;
      }

      setStatus("afgelopen");
      setHuidigePrijs(min);
    }

    update();
    const t = setInterval(update, 100);
    return () => clearInterval(t);
  }, [veiling?.startTijd, veiling?.eindTijd, startPrijs, veiling?.minimumPrijs]);

  async function startVeiling() {
    if (!veiling?.veiling_Id) return;

    // simpele checks
    const duurSec = Math.min(120, Math.max(5, Number(duur) || 20));
    const min = Math.max(0, Number(minPrijs) || 0);

    if (startPrijs <= 0) {
      alert("Geen startprijs gevonden. Zorg dat er een actief product is met startprijs.");
      return;
    }

    if (min >= startPrijs) {
      alert("Minimum prijs moet lager zijn dan startprijs.");
      return;
    }

    const res = await fetch(`http://localhost:5281/api/Veilingen/${veiling.veiling_Id}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ duurInSeconden: duurSec, minimumPrijs: min }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(txt);
      alert("Kon veiling niet starten. (Check: actief product?)");
      return;
    }

    const data = await res.json();

    // zet tijden (en sla minprijs lokaal op zodat de klok weet waar hij moet stoppen)
    setVeiling?.((prev) => ({
      ...prev,
      startTijd: data.startTijd,
      eindTijd: data.eindTijd,
      status: data.status ?? "actief",
      minimumPrijs: data.minimumPrijs ?? min,
    }));

    setPopupOpen(false);
  }

  return (
    <div className="klok-wrapper">
      <h2 className="klok-title">Dutch Auction</h2>

      <p className={`klok-status klok-status--${status}`}>
        {status === "wachten" && "Wachten op start..."}
        {status === "actief" && "Veiling actief"}
        {status === "afgelopen" && "Afgelopen"}
      </p>

      <div className="dutch-clock-container">
        <svg className="dutch-clock" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" className="clock-ring" />
          <text x="100" y="115" textAnchor="middle" className="clock-price">
            €{status === "actief" ? huidigePrijs.toFixed(3) : huidigePrijs.toFixed(2)}
          </text>
        </svg>
      </div>

      {gebruikerRol === "veilingmeester" && status !== "actief" && (
        <button className="klok-btn klok-btn--start" onClick={() => setPopupOpen(true)}>
          Start veilen
        </button>
      )}

      {popupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h3 className="popup-title">Start veiling</h3>

            <label className="block mb-2 font-medium">Duur (seconden)</label>
            <input
              type="number"
              min="5"
              max="120"
              value={duur}
              onChange={(e) => setDuur(Number(e.target.value))}
              className="popup-input"
            />

            <label className="block mb-2 font-medium" style={{ marginTop: 12 }}>
              Minimum prijs (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={minPrijs}
              onChange={(e) => setMinPrijs(Number(e.target.value))}
              className="popup-input"
            />

            <div className="popup-buttons">
              <button className="popup-btn cancel" onClick={() => setPopupOpen(false)}>
                Annuleren
              </button>

              <button className="popup-btn confirm" onClick={startVeiling}>
                Start veilen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}