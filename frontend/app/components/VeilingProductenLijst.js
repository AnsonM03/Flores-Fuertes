"use client";

import { useEffect, useState } from "react";
import "../styles/veilingProductenTabel.css"; // aparte CSS

export default function VeilingProductenLijst({ veilingId }) {
  const [producten, setProducten] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!veilingId) return;

    async function fetchData() {
      try {
        const res = await fetch(
          `http://localhost:5281/api/VeilingProducten/veiling/${veilingId}`, {
          credentials: "include",
        }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
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
    return (
      <p className="veiling-message">Geen producten gekoppeld aan deze veiling...</p>
    );

  return (
    <div
      className="veiling-table-wrapper"
      role="region"
      aria-label="Producten in deze veiling"
    >
      <table className="veiling-table">
        <thead>
          <tr>
            {/* <th scope="col">Foto</th> */}
            <th scope="col">Naam</th>
            <th scope="col">Kenmerken</th>
            <th scope="col">Hoeveelheid</th>
            <th scope="col">Startprijs (€)</th>
          </tr>
        </thead>

        <tbody>
          {producten.map((p) => (
            <tr key={p.veilingProduct_Id}>
              <td>{p.naam}</td>
              <td>{p.artikelKenmerken}</td>
              <td>{p.hoeveelheid}</td>
              <td>{p.prijs ?? p.product?.startPrijs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}