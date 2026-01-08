"use client";

import { useEffect, useState } from "react";

export default function WachtlijstPanel({ veilingId, onActivated }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!veilingId) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5281/api/Veilingen/veiling/${veilingId}/wachtlijst`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [veilingId]);

  async function activeer(veilingProductId) {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5281/api/Veilingen/${veilingProductId}/activeer`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      alert("Activeren mislukt");
      return;
    }

    // refresh wachtlijst
    await load();

    // optioneel: laat parent opnieuw actief lijst ophalen / klok syncen
    onActivated?.();
  }

  async function weiger(veilingProductId) {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5281/api/Veilingen/${veilingProductId}/weiger`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      alert("Weigeren mislukt");
      return;
    }

    await load();
  }

  return (
    <div className="section-card">
      <div className="section-header">
        <h2 className="section-title">Wachtlijst</h2>
      </div>

      {loading && <p>Laden...</p>}
      {error && <p className="text-red-600">Fout: {error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-gray-500">Geen producten in wachtrij.</p>
      )}

      <ul className="space-y-3">
        {items.map((vp) => (
          <li
            key={vp.veilingProduct_Id || vp.veilingProduct_Id}
            className="p-3 bg-white border rounded-lg flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{vp.naam}</div>
              <div className="text-sm text-gray-600">
                {vp.artikelKenmerken}
              </div>
              <div className="text-sm">
                Aantal: <b>{vp.hoeveelheid}</b> — Startprijs:{" "}
                <b>€{vp.startPrijs}</b>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => activeer(vp.veilingProduct_Id)}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Activeer
              </button>
              <button
                onClick={() => weiger(vp.veilingProduct_Id)}
                className="px-3 py-2 bg-red-600 text-white rounded"
              >
                Weiger
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}