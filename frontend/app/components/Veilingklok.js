"use client";

import { useEffect, useState } from "react";

export default function VeilingKlok({ veiling, gebruikerRol }) {
  const [status, setStatus] = useState("wachten");
  const [huidigePrijs, setHuidigePrijs] = useState(veiling?.veilingPrijs || 100);
  const minimumPrijs = 5;

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

  const start = new Date(veiling.startTijd).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const eind = new Date(veiling.eindTijd).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let statusClass = "klok-status-text";
  if (status === "wachten") statusClass += " klok-status-text--wachten";
  if (status === "actief") statusClass += " klok-status-text--actief";
  if (status === "afgelopen") statusClass += " klok-status-text--afgelopen";

  return (
    <div>
      <h2 className="klok-title">Klokveiling</h2>

      <p className={statusClass}>
        {status === "wachten" && `Veiling start om ${start}`}
        {status === "actief" && "Veiling is actief"}
        {status === "afgelopen" && "Veiling afgelopen"}
      </p>

      {status === "actief" && (
        <div className="klok-price-large">€{huidigePrijs.toFixed(2)}</div>
      )}

      <div className="klok-info-card">
        <p className="klok-product-name">
          {veiling.product?.naam ?? "Onbekend product"}
        </p>

        <p className="klok-field-label">
          Aanvoerder:{" "}
          <span className="klok-field-value">
            {veiling.aanvoerder
              ? `${veiling.aanvoerder.voornaam} ${veiling.aanvoerder.achternaam}`
              : "Onbekend"}
          </span>
        </p>

        <p className="klok-field-label">
          Starttijd:{" "}
          <span className="klok-field-value">{start}</span>
        </p>
        <p className="klok-field-label">
          Eindtijd:{" "}
          <span className="klok-field-value">{eind}</span>
        </p>
        <p className="klok-field-label">
          Minimale prijs:{" "}
          <span className="klok-field-value">€{minimumPrijs}</span>
        </p>
      </div>

      <div className="klok-buttons">
        {gebruikerRol === "klant" && (
          <button
            className="klok-btn klok-btn--koop"
            onClick={() => {
              if (status !== "actief") return;
              setStatus("afgelopen");
              alert(`🛒 Product verkocht voor €${huidigePrijs.toFixed(2)}!`);
            }}
            disabled={status !== "actief"}
          >
            {status === "actief" ? "Koop nu" : "Verkocht"}
          </button>
        )}

        {gebruikerRol === "veilingmeester" && (
          <>
            <button
              className="klok-btn klok-btn--start"
              onClick={() => {
                setStatus("actief");
                alert("🚀 De veiling is gestart!");
              }}
              disabled={status === "actief"}
            >
              Veiling starten
            </button>

            <button
              className="klok-btn klok-btn--stop"
              onClick={() => {
                setStatus("afgelopen");
                alert("🛑 De veiling is gestopt door de veilingmeester.");
              }}
              disabled={status !== "actief"}
            >
              Stop veiling
            </button>
          </>
        )}
      </div>
    </div>
  );
}