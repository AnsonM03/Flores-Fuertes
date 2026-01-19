"use client";

import { useEffect, useRef, useState } from "react";
import "../styles/wachtlijstPanel.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5281/api";

export default function WachtlijstPanel({ veilingId, onActivated }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fix 2: abort controller ref (zodat oude requests worden afgebroken)
  const abortRef = useRef(null);

  async function load(signal) {
    if (!veilingId) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    console.log("✅ Wachtlijst laden voor veiling:", veilingId);

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/VeilingProducten/veiling/${veilingId}/wachtlijst`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal, // ✅ Fix 2: abortable
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      // ✅ Fix 2: abort errors negeren
      if (e?.name === "AbortError") return;

      console.error("❌ Wachtlijst error:", e);
      setError("Kon wachtlijst niet laden.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Fix 1 + Fix 2: bij veilingId wissel -> reset + abort vorige request + load nieuwe
  useEffect(() => {
    // reset UI direct bij wisselen (voorkomt “oude items blijven staan”)
    setItems([]);
    setError(null);

    // abort vorige request (race-condition fix)
    abortRef.current?.abort();

    if (!veilingId) return;

    const controller = new AbortController();
    abortRef.current = controller;

    load(controller.signal);

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [veilingId]);

  async function activeer(veilingProductId) {
    if (!veilingProductId) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/VeilingProducten/${veilingProductId}/activeer`,
        {
          method: "PUT",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error();

      // refresh wachtlijst (ook abort-safe)
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      await load(controller.signal);

      onActivated?.();
    } catch {
      alert("Activeren mislukt.");
    }
  }

  async function weiger(veilingProductId) {
    if (!veilingProductId) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/VeilingProducten/${veilingProductId}/weiger`,
        {
          method: "PUT",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error();

      // refresh wachtlijst (ook abort-safe)
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      await load(controller.signal);

      onActivated?.();
    } catch {
      alert("Weigeren mislukt.");
    }
  }

  return (
    <div className="wachtlijst-card">
      <div className="wachtlijst-header">
        <h2 className="wachtlijst-title">Wachtlijst</h2>

        <button
          className="wachtlijst-refresh"
          onClick={() => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            load(controller.signal);
          }}
          disabled={loading || !veilingId}
        >
          Refresh
        </button>
      </div>

      {loading && <p className="wachtlijst-loading">Laden...</p>}
      {error && <p className="wachtlijst-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="wachtlijst-empty">Geen producten in wachtrij.</p>
      )}

      <ul className="wachtlijst-list">
        {items.map((vp) => {
          const id = vp.veilingProduct_Id ?? vp.VeilingProduct_Id;

          return (
            <li key={id} className="wachtlijst-item">
              <div className="wachtlijst-info">
                <div className="wachtlijst-naam">
                  {vp.naam || vp.Naam || "Onbekend product"}
                </div>

                <div className="wachtlijst-kenmerken">
                  {vp.artikelKenmerken || vp.ArtikelKenmerken || "-"}
                </div>

                <div className="wachtlijst-meta">
                  Aantal: <b>{vp.hoeveelheid ?? vp.Hoeveelheid ?? 0}</b> — Startprijs:{" "}
                  <b>€{vp.startPrijs ?? vp.StartPrijs ?? 0}</b>
                </div>
              </div>

              <div className="wachtlijst-actions">
                <button
                  className="wachtlijst-btn wachtlijst-btn--activeer"
                  onClick={() => activeer(id)}
                >
                  Activeer
                </button>

                <button
                  className="wachtlijst-btn wachtlijst-btn--weiger"
                  onClick={() => weiger(id)}
                >
                  Weiger
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}