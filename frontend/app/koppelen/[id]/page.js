"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../../styles/koppelen.css";

export default function KoppelProductPage() {
  const router = useRouter();

  const [veilingen, setVeilingen] = useState([]);
  const [producten, setProducten] = useState([]);

  const [gekozenVeiling, setGekozenVeiling] = useState(null);
  const [gekozenProduct, setGekozenProduct] = useState(null);

  const [hoeveelheid, setHoeveelheid] = useState("");
  const [prijs, setPrijs] = useState("");

  // -----------------------------
  // USER + DATA LADEN
  // -----------------------------
  useEffect(() => {
    const gebruiker = JSON.parse(localStorage.getItem("gebruiker"));
    if (!gebruiker) {
      router.push("/login");
      return;
    }

    loadVeilingen();
    loadProducten(gebruiker.gebruiker_Id);
  }, []);

  async function loadVeilingen() {
    const res = await fetch("http://localhost:5281/api/Veilingen");
    const data = await res.json();
    setVeilingen(data);
  }

  async function loadProducten(aanvoerderId) {
    const res = await fetch("http://localhost:5281/api/Producten");
    const data = await res.json();

    const eigen = data.filter(
      (p) => p.aanvoerder_Id === aanvoerderId
    );

    setProducten(eigen);
  }

  // -----------------------------
  // KOPPELEN
  // -----------------------------
  async function bevestigKoppeling() {
    const token = localStorage.getItem("token");

    if (!gekozenProduct || !gekozenVeiling) {
      alert("Kies een product en een veiling");
      return;
    }

    if (!hoeveelheid || hoeveelheid <= 0) {
      alert("Vul een geldige hoeveelheid in");
      return;
    }

    const payload = {
      veilingId: gekozenVeiling.veiling_Id,
      productId: gekozenProduct.product_Id,
      hoeveelheid: Number(hoeveelheid),
      prijs: prijs === "" ? null : Number(prijs),
    };

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
      alert("✅ Product gekoppeld!");
      router.push(`/veilingen/${gekozenVeiling.veiling_Id}`);
    } else {
      const text = await res.text();
      alert("❌ Fout: " + text);
    }
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="koppelen-wrapper">
      <div className="koppelen-container">
        <h1 className="koppelen-title">Kies een veiling</h1>

        {veilingen.length === 0 ? (
          <p className="empty-products">Geen veilingen gevonden.</p>
        ) : (
          <ul className="producten-ul">
            {veilingen.map((v) => (
              <li
                key={v.veiling_Id}
                className="product-card"
              >
                <div className="product-info">
                  <strong>{v.kloklocatie}</strong>
                  <p>{v.omschrijving}</p>
                </div>

                <button
                  className="koppel-btn"
                  onClick={() => setGekozenVeiling(v)}
                >
                  Koppel product
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* ========================== */}
        {/*           POPUP            */}
        {/* ========================== */}
        {gekozenVeiling && (
          <div className="popup-overlay">
            <div className="popup">

              <h2 className="popup-title">
                Koppel product aan “{gekozenVeiling.titel}”
              </h2>

              <label>Product</label>
              <select
                value={gekozenProduct?.product_Id || ""}
                onChange={(e) =>
                  setGekozenProduct(
                    producten.find(p => p.product_Id === e.target.value)
                  )
                }
              >
                <option value="">-- kies product --</option>
                {producten.map((p) => (
                  <option key={p.product_Id} value={p.product_Id}>
                    {p.naam} (voorraad: {p.hoeveelheid})
                  </option>
                ))}
              </select>

              <label>Hoeveelheid *</label>
              <input
                type="number"
                min="1"
                value={hoeveelheid}
                onChange={(e) => setHoeveelheid(e.target.value)}
              />

              <label>Prijs (€) (optioneel)</label>
              <input
                type="number"
                step="0.01"
                value={prijs}
                onChange={(e) => setPrijs(e.target.value)}
              />

              <div className="popup-buttons">
                <button
                  className="popup-cancel"
                  onClick={() => {
                    setGekozenVeiling(null);
                    setGekozenProduct(null);
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