"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [aanvoerder, setAanvoerder] = useState(null);
  const [error, setError] = useState(null);

  const aanvoerderId = "c73127aa-4cc1-4656-be32-9740ddc9750c"; 
  // Zet hier echte GUID vanuit database

  useEffect(() => {
    fetch(`http://localhost:5281/api/Aanvoerders/${aanvoerderId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setAanvoerder(data))
      .catch((err) => setError("Gebruiker niet gevonden"));
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h1>Gebruikers Dashboard</h1>

      <div className="dashboard"></div>
      <div className="veilingklok"></div>
      <div className="ronde"></div>
      <div className="prijs"></div>
      <div className="koper"></div>
      <div className="aantal"></div>

      <div className="aankomende-veilingen">Aankomende veilingen</div>
      <label id="aanvoerders">Aanvoerders</label>
      <label id="producten">Producten</label>

      <div className="actieve-veiling"></div>

      <label id="aanvoerderNaam">
        {error
          ? error
          : aanvoerder
          ? `${aanvoerder.voornaam} ${aanvoerder.achternaam}`
          : "Laden..."}
      </label>
      <br />
      <label id="aanvoerderId">
        {aanvoerder ? aanvoerder.gebruiker_Id : "Laden..."}
      </label>

      <div className="product_naam"></div>
      <div className="menu"></div>
      <div className="kopers"></div>

      {/* Actieve veiling API wordt later uitgebreid ✅ */}
    </div>
  );
}