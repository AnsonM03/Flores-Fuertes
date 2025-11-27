"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import "../../styles/koppelen.css";

export default function KoppelProductPage() {
  const router = useRouter();
  const { id: veilingId } = useParams();

  const [producten, setProducten] = useState([]);
  const [gebruiker, setGebruiker] = useState(null);

  const [popupProduct, setPopupProduct] = useState(null);
  const [hoeveelheid, setHoeveelheid] = useState("");
  const [prijs, setPrijs] = useState("");

  // -----------------------------
  // USER LADEN
  // -----------------------------
  useEffect(() => {
    const stored = localStorage.getItem("gebruiker");
    if (!stored) {
      router.push("/login");
      return;
    }
    setGebruiker(JSON.parse(stored));
  }, []);

  // -----------------------------
  // PRODUCTEN LADEN
  // -----------------------------
  useEffect(() => {
    async function load() {
      const res = await fetch("http://localhost:5281/api/Producten");
      const data = await res.json();

      const user = JSON.parse(localStorage.getItem("gebruiker"));

      const eigen = data.filter(
        (p) => p.aanvoerder_Id === user.gebruiker_Id
      );

      setProducten(eigen);
    }
    load();
  }, []);

  // -----------------------------
  // KOPPELEN — (GOEDE API ROUTE)
  // -----------------------------
  async function bevestigKoppeling() {
    const token = localStorage.getItem("token");

    if (!hoeveelheid) {
      alert("Vul hoeveelheid in!");
      return;
    }

    const payload = {
      veilingId: veilingId,
      productId: popupProduct.product_Id,
      hoeveelheid: Number(hoeveelheid),
      prijs: prijs === "" ? null : Number(prijs), // optioneel
    };

    console.log("Verstuur:", payload);

    const res = await fetch(
      "http://localhost:5281/api/VeilingProducten/koppel",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      alert("Product succesvol gekoppeld!");

      setPopupProduct(null);
      setHoeveelheid("");
      setPrijs("");

      router.push(`/veilingen/${veilingId}`);
    } else {
      const errorText = await res.text();
      console.error("❌ Error:", errorText);
      alert("❌ Er ging iets mis: " + errorText);
    }
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="koppelen-wrapper">
      <div className="koppelen-container">

        <h1 className="koppelen-title">Koppel product aan veiling</h1>

        {producten.length === 0 ? (
          <p className="empty-products">Je hebt nog geen producten.</p>
        ) : (
          <ul className="producten-ul">
            {producten.map((p) => (
              <li key={p.product_Id} className="product-card">

                <div className="product-info">
                  <strong>{p.naam}</strong>
                  <p>{p.artikelKenmerken}</p>
                </div>

                <button
                  className="koppel-btn"
                  onClick={() => setPopupProduct(p)}
                >
                  Koppel
                </button>

              </li>
            ))}
          </ul>
        )}

        {/* ========================== */}
        {/*         POPUP MODAL        */}
        {/* ========================== */}
        {popupProduct && (
          <div className="popup-overlay">
            <div className="popup">

              <h2 className="popup-title">
                {popupProduct.naam} koppelen
              </h2>

              <label>Hoeveelheid *</label>
              <input
                type="number"
                min="1"
                value={hoeveelheid}
                onChange={(e) => setHoeveelheid(e.target.value)}
              />
              <p className="beschikbaar">
                Beschikbaar: <span>{popupProduct.hoeveelheid}</span>
              </p>

              <label>Prijs (€) (optioneel)</label>
              <input
                type="number"
                step="0.01"
                value={prijs}
                onChange={(e) => setPrijs(e.target.value)}
              />
              <p className="beschikbaar">
                Huidige prijs: <span>{popupProduct.startPrijs}</span>
              </p>

              <div className="popup-buttons">
                <button
                  className="popup-cancel"
                  onClick={() => {
                    setPopupProduct(null);
                    setHoeveelheid("");
                    setPrijs("");
                  }}
                >
                  Annuleren
                </button>

                <button
                  className="popup-confirm"
                  onClick={bevestigKoppeling}
                >
                  Koppelen
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}