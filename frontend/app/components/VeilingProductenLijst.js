"use client";

import { useEffect, useState } from "react";

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
        `http://localhost:5281/api/Veilingen/veiling/${veilingId}/actief`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      setItems(await res.json());
    } catch (e) {
      console.error(e);
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

  // helper: pakt velden ongeacht casing
  const get = (obj, ...keys) => keys.find(k => obj?.[k] !== undefined) ? obj[keys.find(k => obj?.[k] !== undefined)] : undefined;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <button className="koppel-btn" onClick={load} disabled={loading || !veilingId}>
          Refresh
        </button>
        {loading && <span>laden…</span>}
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

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
                style={{ cursor: "pointer" }}
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

                {foto ? (
                  <img
                    src={foto}
                    alt={naam}
                    style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10 }}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}