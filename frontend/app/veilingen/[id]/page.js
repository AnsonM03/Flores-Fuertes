"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VeilingKlok from "../../components/VeilingKlok";
import VeilingProductenLijst from "../../components/VeilingProductenLijst";
import * as signalR from "@microsoft/signalr";
import "../../styles/veiling-detail.css";

export default function VeilingDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [veiling, setVeiling] = useState(null);
  const [error, setError] = useState(null);

  const [gebruiker, setGebruiker] = useState(null);
  const rol = gebruiker?.gebruikerType?.toLowerCase();

  const [geselecteerdProduct, setGeselecteerdProduct] = useState(null);

  const [popupOpen, setPopupOpen] = useState(false);
  const [aantal, setAantal] = useState(1);
  const [koopPrijs, setKoopPrijs] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("gebruiker");
    if (stored) setGebruiker(JSON.parse(stored));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchVeiling() {
      try {
        const res = await fetch(`http://localhost:5281/api/Veilingen/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setVeiling(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Kon deze veiling niet ophalen.");
      }
    }

    fetchVeiling();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!veiling?.veiling_Id) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5281/hubs/auction")
      .withAutomaticReconnect()
      .build();

    conn.on("VeilingGestart", (veilingId, startTijd, eindTijd) => {
      if (veilingId !== veiling.veiling_Id) return;
      setVeiling((prev) => (prev ? { ...prev, startTijd, eindTijd } : prev));
    });

    conn.on("ProductGekocht", (veilingId, productId, nieuweHoeveelheid) => {
      if (veilingId !== veiling.veiling_Id) return;

      setVeiling((prev) => ({
        ...prev,
        veilingProducten: (prev?.veilingProducten || []).map((vp) => {
          const vpProductId =
            vp.product_Id ||
            vp.Product_Id ||
            vp.product?.product_Id ||
            vp.product?.Product_Id;

          return vpProductId === productId
            ? { ...vp, hoeveelheid: nieuweHoeveelheid }
            : vp;
        }),
      }));

      setGeselecteerdProduct((prevVp) => {
        if (!prevVp) return prevVp;
        const prevId =
          prevVp.product_Id ||
          prevVp.Product_Id ||
          prevVp.product?.product_Id ||
          prevVp.product?.Product_Id;

        return prevId === productId
          ? { ...prevVp, hoeveelheid: nieuweHoeveelheid }
          : prevVp;
      });
    });

    conn
      .start()
      .then(() => console.log("✅ SignalR verbonden"))
      .catch((err) => console.error("SignalR error:", err));

    return () => {
      conn.stop();
    };
  }, [veiling?.veiling_Id]);

  const productInfo = useMemo(() => {
    const voorraad =
      geselecteerdProduct?.hoeveelheid ?? geselecteerdProduct?.Hoeveelheid ?? 0;

    const productId =
      geselecteerdProduct?.product_Id ||
      geselecteerdProduct?.Product_Id ||
      geselecteerdProduct?.product?.product_Id ||
      geselecteerdProduct?.product?.Product_Id;

    const naam =
      geselecteerdProduct?.product?.naam ||
      geselecteerdProduct?.naam ||
      "Product";

    const kenmerken =
      geselecteerdProduct?.product?.artikelKenmerken ||
      geselecteerdProduct?.artikelKenmerken ||
      "-";

    const foto =
      geselecteerdProduct?.product?.foto || geselecteerdProduct?.foto || null;

    const startPrijs =
      geselecteerdProduct?.prijs ??
      geselecteerdProduct?.Prijs ??
      geselecteerdProduct?.product?.startPrijs ??
      geselecteerdProduct?.product?.StartPrijs ??
      0;

    return { voorraad, productId, naam, kenmerken, foto, startPrijs };
  }, [geselecteerdProduct]);

  function handleKoopStart(huidigePrijsUitKlok) {
    if (!geselecteerdProduct) {
      alert("Selecteer eerst een product in de lijst.");
      return;
    }
    setKoopPrijs(huidigePrijsUitKlok);
    setPopupOpen(true);
  }

  async function handleKoopSubmit(e) {
    e.preventDefault();

    if (!geselecteerdProduct) return alert("Geen product geselecteerd.");
    if (!gebruiker) return alert("Je moet ingelogd zijn.");

    if (aantal <= 0) return alert("Aantal moet minstens 1 zijn.");
    if (aantal > productInfo.voorraad) {
      return alert("Je kunt niet meer kopen dan de voorraad.");
    }

    const totaalPrijs = (koopPrijs || 0) * aantal;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5281/api/Biedingen/koop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prijsPerStuk: koopPrijs,
          aantal,
          totaal: totaalPrijs,
          klant_Id: gebruiker.gebruiker_Id,
          product_Id: productInfo.productId,
          veiling_Id: veiling.veiling_Id,
        }),
      });

      if (!res.ok) {
        console.error(await res.text());
        return alert("❌ Aankoop mislukt.");
      }

      alert(`🎉 Je hebt gekocht voor €${totaalPrijs.toFixed(2)}!`);

      setPopupOpen(false);
      setAantal(1);
      setKoopPrijs(null);

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("❌ Serverfout.");
    }
  }

  if (error) {
    return (
      <main className="vd-page">
        <div className="vd-container vd-max-5xl">
          <button onClick={() => router.back()} className="vd-back-btn">
            ← Terug
          </button>

          <div className="vd-error-box">{error}</div>
        </div>
      </main>
    );
  }

  if (!veiling) {
    return (
      <main className="vd-page">
        <div className="vd-container vd-max-5xl">
          <div className="vd-loading-card">Veiling laden…</div>
        </div>
      </main>
    );
  }

  const status = String(veiling.status || "wachtend").toLowerCase();
  const statusClass =
    status === "actief"
      ? "vd-badge vd-badge--actief"
      : status === "afgelopen"
      ? "vd-badge vd-badge--afgelopen"
      : "vd-badge vd-badge--wachtend";

  return (
    <main className="vd-page">
      <div className="vd-container">
        <div className="vd-header">
          <div>
            <button onClick={() => router.back()} className="vd-back-btn">
              ← Terug
            </button>

            <h1 className="vd-title">{veiling.titel || "Veiling"}</h1>

            <div className="vd-badges">
              <span className={statusClass}>{status}</span>
              {rol && <span className="vd-badge vd-badge--role">Rol: {rol}</span>}
            </div>
          </div>
        </div>

        {/* ✅ Layout: LINKS = lijst + details | RECHTS = klok */}
        <div className="vd-grid">
          {/* LINKS */}
          <section className="vd-left">
            <div className="vd-card">
              <div className="vd-card-title-row">
                <h2 className="vd-card-title">Producten in deze veiling</h2>
                <span className="vd-card-hint">Selecteer een product</span>
              </div>

              <div className="vd-panel">
                <VeilingProductenLijst
                  veilingId={id}
                  onSelect={(vp) => setGeselecteerdProduct(vp)}
                />
              </div>
            </div>

            {/* ✅ detail card nu links */}
            <div className="vd-card">
              <h3 className="vd-card-title">Geselecteerd product</h3>
              <p className="vd-muted">Klik hierboven een product om details te zien.</p>

              {!geselecteerdProduct ? (
                <div className="vd-empty">Nog geen product geselecteerd.</div>
              ) : (
                <div className="vd-selected">
                  {productInfo.foto ? (
                    <img src={productInfo.foto} alt={productInfo.naam} className="vd-image" />
                  ) : (
                    <div className="vd-image-placeholder">Geen foto beschikbaar</div>
                  )}

                  <div className="vd-info-grid">
                    <div className="vd-info-item">
                      <div className="vd-info-label">Naam</div>
                      <div className="vd-info-value">{productInfo.naam}</div>
                    </div>

                    <div className="vd-info-item">
                      <div className="vd-info-label">Voorraad</div>
                      <div className="vd-info-value">{productInfo.voorraad}</div>
                    </div>

                    <div className="vd-info-item vd-info-item--full">
                      <div className="vd-info-label">Kenmerken</div>
                      <div className="vd-info-value">{productInfo.kenmerken}</div>
                    </div>

                    <div className="vd-info-item">
                      <div className="vd-info-label">Startprijs</div>
                      <div className="vd-info-value">
                        €{Number(productInfo.startPrijs || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="vd-info-item">
                      <div className="vd-info-label">ProductId</div>
                      <div className="vd-info-value vd-mono">{productInfo.productId || "-"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* RECHTS */}
          <section className="vd-right">
            <div className="vd-card">
              <VeilingKlok
                veiling={veiling}
                gebruikerRol={rol}
                onKoop={handleKoopStart}
              />
            </div>
          </section>
        </div>
      </div>

      {popupOpen && (
        <div className="vd-modal-overlay">
          <div className="vd-modal">
            <div className="vd-modal-top">
              <div>
                <h2 className="vd-modal-title">Koop {productInfo.naam}</h2>
                <p className="vd-modal-desc">Kies je aantal en bevestig je aankoop.</p>
              </div>

              <button
                onClick={() => {
                  setPopupOpen(false);
                  setAantal(1);
                  setKoopPrijs(null);
                }}
                className="vd-icon-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleKoopSubmit} className="vd-form">
              <div className="vd-form-block">
                <label className="vd-label">Aantal</label>
                <input
                  type="number"
                  min="1"
                  max={productInfo.voorraad}
                  value={aantal}
                  onChange={(e) => setAantal(Number(e.target.value))}
                  className="vd-input"
                />
                <div className="vd-help">
                  Voorraad: <b>{productInfo.voorraad}</b>
                </div>
              </div>

              <div className="vd-price-box">
                <div className="vd-row">
                  <span>Prijs per stuk</span>
                  <b>€{koopPrijs ? koopPrijs.toFixed(2) : "0.00"}</b>
                </div>

                <div className="vd-total">
                  Totaal: €{((koopPrijs || 0) * (aantal || 0)).toFixed(2)}
                </div>
              </div>

              <div className="vd-modal-actions">
                <button
                  type="button"
                  className="vd-btn"
                  onClick={() => {
                    setPopupOpen(false);
                    setAantal(1);
                    setKoopPrijs(null);
                  }}
                >
                  Annuleren
                </button>

                <button type="submit" className="vd-btn vd-btn--success">
                  Bevestig aankoop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}