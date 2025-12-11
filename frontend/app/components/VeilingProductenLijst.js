"use client";

import { useEffect, useState } from "react";
import "../styles/veilingProductenTabel.css";

export default function VeilingProductenLijst({ veilingId, onSelect }) {
  const [producten, setProducten] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!veilingId) return;

    async function fetchData() {
      try {
        const res = await fetch(
          `http://localhost:5281/api/VeilingProducten/veiling/${veilingId}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        console.log("🔎 Producten ontvangen:", data); // Debug

        setProducten(data);
      } catch (err) {
        console.error(err);
        setError("Kon producten niet ophalen.");
      }
    }

    fetchData();
  }, [veilingId]);

  if (error) return <p className="veiling-message">{error}</p>;
  if (producten.length === 0)
    return <p className="veiling-message">Geen producten gekoppeld...</p>;

  return (
    <div className="veiling-table-wrapper">
      <table className="veiling-table">
        <thead>
          <tr>
            <th>Naam</th>
            <th>Kenmerken</th>
            <th>Hoeveelheid</th>
            <th>Startprijs (€)</th>
          </tr>
        </thead>

        <tbody>
          {producten.map((p) => (
            <tr
              key={p.veilingProduct_Id}
              className={
                selectedProductId === p.veilingProduct_Id
                  ? "selected-row"
                  : "hover:bg-gray-100 cursor-pointer"
              }
              onClick={() => {
                setSelectedProductId(p.veilingProduct_Id);
                onSelect(p); // 👈 FOTO WORDT MEEGEGEVEN
              }}
            >
              <td>{p.naam}</td>
              <td>{p.artikelKenmerken}</td>
              <td>{p.hoeveelheid}</td>
              <td>€{p.startPrijs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}