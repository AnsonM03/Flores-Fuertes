"use client";

import { useEffect, useState } from "react";
import "../styles/veilingProductenLijst.css";

export default function VeilingProductenLijst({ veilingId, token, onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!veilingId) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `http://localhost:5281/api/VeilingProducten/veiling/${veilingId}/actief`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      setError("Kon actieve producten niet ophalen.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [veilingId]);

  const get = (obj, ...keys) =>
    keys.find((k) => obj?.[k] !== undefined)
      ? obj[keys.find((k) => obj?.[k] !== undefined)]
      : undefined;

  return (
    <div className="vpl-card-wrapper">
      {/* ✅ HEADER ZOALS WACHTLIJST */}
      <div className="vpl-header">
        <h3 className="vpl-title">Actieve producten</h3>

        <button
          className="refresh"
          onClick={load}
          disabled={loading || !veilingId}
        >
          Refresh
        </button>
      </div>

      {loading && <p className="vpl-loading">Laden…</p>}
      {error && <p className="vpl-error">{error}</p>}

      {!loading && items.length === 0 ? (
        <p>Geen actieve producten.</p>
      ) : (
        <ul className="producten-ul">
          {items.map((vp) => {
            const id = get(vp, "veilingProduct_Id", "VeilingProduct_Id");
            const naam = get(vp, "naam", "Naam") ?? "";
            const kenmerken = get(vp, "artikelKenmerken", "ArtikelKenmerken") ?? "";
            const hoeveelheid = get(vp, "hoeveelheid", "Hoeveelheid") ?? 0;
            const startPrijs = get(vp, "startPrijs", "StartPrijs") ?? 0;
            const foto = get(vp, "foto", "Foto");

            return (
              <li
                key={id}
                className="product-card"
                onClick={() => onSelect?.(vp)}
              >
                <div className="product-info">
                  <strong>{naam}</strong>
                  <p>{kenmerken}</p>
                  <p>
                    Hoeveelheid: <strong>{hoeveelheid}</strong> · Startprijs:{" "}
                    <strong>€{Number(startPrijs).toFixed(2)}</strong>
                  </p>
                </div>

                {foto && <img src={foto} alt={naam} className="vpl-foto" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}