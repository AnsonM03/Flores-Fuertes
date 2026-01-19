"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/veilingKlok.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:5281/api";

export default function VeilingKlok({
  veiling,
  gebruikerRol,
  token,
  setVeiling,
  actiefProduct,
  onStarted,
}) {
  const veilingId = veiling?.veiling_Id;

  const [status, setStatus] = useState("wachten");
  const [huidigePrijs, setHuidigePrijs] = useState(0);

  const [popupOpen, setPopupOpen] = useState(false);
  const [duur, setDuur] = useState(20);
  const [minPrijs, setMinPrijs] = useState(1);
  const [busy, setBusy] = useState(false);

  // ✅ voorkomt dat oude async responses state updaten na veiling switch
  const runIdRef = useRef(0);

  // Startprijs komt van actief product (als die er is)
  const startPrijs = useMemo(() => {
    const p = Number(actiefProduct?.startPrijs ?? actiefProduct?.prijs ?? 0);
    return Number.isFinite(p) ? p : 0;
  }, [actiefProduct]);

  // Reset UI basics bij veiling wissel
  useEffect(() => {
    setPopupOpen(false);
    setBusy(false);
  }, [veilingId]);

  // ---------------------------
  // KLOK LOGICA (robust)
  // ---------------------------
  useEffect(() => {
    const rawStart = veiling?.startTijd ?? veiling?.StartTijd;
    const rawEind = veiling?.eindTijd ?? veiling?.EindTijd;

    if (!rawStart || !rawEind) {
      setStatus("wachten");
      setHuidigePrijs(startPrijs || 0);
      return;
    }

    const start = new Date(rawStart);
    const eind = new Date(rawEind);

    if (Number.isNaN(start.getTime()) || Number.isNaN(eind.getTime())) {
      setStatus("wachten");
      setHuidigePrijs(startPrijs || 0);
      return;
    }

    const totaal = Math.max(0.1, (eind.getTime() - start.getTime()) / 1000);
    const min = Math.max(0, Number(veiling?.minimumPrijs ?? veiling?.MinimumPrijs ?? 0));
    const echteStart = Math.max(startPrijs, min);

    const dalingPerSeconde = (echteStart - min) / totaal;

    function update() {
      const nu = Date.now();
      const startMs = start.getTime();
      const eindMs = eind.getTime();

      if (nu < startMs) {
        setStatus("wachten");
        setHuidigePrijs(echteStart);
        return;
      }

      if (nu >= startMs && nu < eindMs) {
        setStatus("actief");
        const verstreken = (nu - startMs) / 1000;
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
  }, [
    veilingId,
    veiling?.startTijd,
    veiling?.eindTijd,
    veiling?.StartTijd,
    veiling?.EindTijd,
    veiling?.minimumPrijs,
    veiling?.MinimumPrijs,
    startPrijs,
  ]);

  // ---------------------------
  // HELPERS
  // ---------------------------
  async function apiFetch(url, opts = {}) {
    const res = await fetch(url, {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return res;
  }

  async function fetchWachtlijst(currentVeilingId) {
    const res = await apiFetch(`${API_BASE}/Veilingen/veiling/${currentVeilingId}/wachtlijst`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async function fetchActiefLijst(currentVeilingId) {
    const res = await apiFetch(`${API_BASE}/Veilingen/veiling/${currentVeilingId}/actief`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  async function activeerVeilingProduct(vpId) {
    const res = await apiFetch(`${API_BASE}/Veilingen/${vpId}/activeer`, { method: "PUT" });
    return res.ok;
  }

  // ---------------------------
  // START VEILING (auto-activate binnen dezelfde veiling)
  // ---------------------------
  async function startVeiling() {
    if (!veilingId) return;

    const thisRun = ++runIdRef.current;
    const duurSec = Math.min(120, Math.max(5, Number(duur) || 20));
    const min = Math.max(0, Number(minPrijs) || 0);

    setBusy(true);
    try {
      const currentVeilingId = veilingId;

      let actief = actiefProduct;

      if (!actief) {
        const actiefLijst = await fetchActiefLijst(currentVeilingId);
        actief = actiefLijst?.[0] ?? null;
      }

      if (!actief) {
        const wachtlijst = await fetchWachtlijst(currentVeilingId);
        const first = wachtlijst?.[0];

        const vpId = first?.veilingProduct_Id ?? first?.VeilingProduct_Id;
        if (!vpId) {
          alert("Geen product in wachtlijst. Koppel eerst een product aan deze veiling.");
          return;
        }

        const ok = await activeerVeilingProduct(vpId);
        if (!ok) {
          alert("Activeren mislukt (autorisatie/backend).");
          return;
        }

        const actiefLijst2 = await fetchActiefLijst(currentVeilingId);
        actief = actiefLijst2?.[0] ?? null;
      }

      if (!actief) {
        alert("Kon geen actief product bepalen.");
        return;
      }

      // 2) Startprijs check
      const sp = Number(actief?.startPrijs ?? actief?.prijs ?? 0);
      const startPrijsLocal = Number.isFinite(sp) ? sp : 0;

      if (startPrijsLocal <= 0) {
        alert("Actief product heeft geen startprijs.");
        return;
      }

      if (min >= startPrijsLocal) {
        alert("Minimum prijs moet lager zijn dan startprijs.");
        return;
      }

      // 3) Start veiling
      const res = await apiFetch(`${API_BASE}/Veilingen/${currentVeilingId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duurInSeconden: duurSec, minimumPrijs: min }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("❌ startVeiling failed:", txt);
        alert("Kon veiling niet starten. Check backend logs.");
        return;
      }

      const data = await res.json();

      // als je intussen van veiling bent gewisseld: negeer
      if (thisRun !== runIdRef.current) return;

      const startRaw = data.startTijd ?? data.StartTijd;
      const eindRaw = data.eindTijd ?? data.EindTijd;

      if (!startRaw || !eindRaw) {
        alert("Backend geeft geen start/eind tijd terug.");
        return;
      }

      // force ISO in state
      const startIso = new Date(startRaw).toISOString();
      const eindIso = new Date(eindRaw).toISOString();

      setVeiling?.((prev) => ({
        ...prev,
        startTijd: startIso,
        eindTijd: eindIso,
        status: data.status ?? data.Status ?? "actief",
        minimumPrijs: data.minimumPrijs ?? data.MinimumPrijs ?? min,
      }));

      setPopupOpen(false);
      onStarted?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="klok-wrapper">
      <h2 className="klok-title">{actiefProduct?.naam}</h2>

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
        <button
          className="klok-btn klok-btn--start"
          onClick={() => setPopupOpen(true)}
          disabled={busy}
          style={{ opacity: busy ? 0.7 : 1 }}
        >
          {busy ? "Bezig..." : "Start veilen"}
        </button>
      )}

      {popupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h3 className="popup-title">Start veiling</h3>

            <label className="popup-label">Duur (seconden)</label>
            <input
              type="number"
              min="5"
              max="120"
              value={duur}
              onChange={(e) => setDuur(Number(e.target.value))}
              className="popup-input"
              disabled={busy}
            />

            <label className="popup-label" style={{ marginTop: 12 }}>
              Minimum prijs (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={minPrijs}
              onChange={(e) => setMinPrijs(Number(e.target.value))}
              className="popup-input"
              disabled={busy}
            />

            <div className="popup-buttons">
              <button
                className="popup-btn cancel"
                onClick={() => setPopupOpen(false)}
                disabled={busy}
              >
                Annuleren
              </button>

              <button className="popup-btn confirm" onClick={startVeiling} disabled={busy}>
                {busy ? "Starten..." : "Start veilen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}