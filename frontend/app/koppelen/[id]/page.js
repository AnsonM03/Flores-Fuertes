"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../../styles/koppelen.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5281/api";

export default function KoppelProductPage() {
  const router = useRouter();

  const [veilingen, setVeilingen] = useState([]);
  const [producten, setProducten] = useState([]);

  const [gekozenVeiling, setGekozenVeiling] = useState(null);
  const [gekozenProduct, setGekozenProduct] = useState(null);

  const [hoeveelheid, setHoeveelheid] = useState("");
  const [prijs, setPrijs] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("gebruiker");
    if (!stored) {
      router.push("/login");
      return;
    }

    const gebruiker = JSON.parse(stored);
    loadVeilingen();
    loadProducten(gebruiker.gebruiker_Id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadVeilingen() {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/Veilingen`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    setVeilingen(Array.isArray(data) ? data : []);
  }

  async function loadProducten(aanvoerderId) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/Producten`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();

    const eigen = (Array.isArray(data) ? data : []).filter(
      (p) => p.aanvoerder_Id === aanvoerderId
    );

    setProducten(eigen);
  }

  async function bevestigKoppeling() {
    const token = localStorage.getItem("token");

    if (!gekozenVeiling) return alert("Kies een veiling");
    if (!gekozenProduct) return alert("Kies een product");
    if (!hoeveelheid || Number(hoeveelheid) <= 0)
      return alert("Vul een geldige hoeveelheid in");

    const payload = {
      VeilingId: gekozenVeiling.veiling_Id,
      ProductId: gekozenProduct.product_Id,
      Hoeveelheid: Number(hoeveelheid),
      Prijs: prijs === "" ? null : Number(prijs),
    };

    const res = await fetch(`${API_BASE}/VeilingProducten/koppel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("✅ Product gekoppeld!");

      const gebruiker = JSON.parse(localStorage.getItem("gebruiker") || "{}");
      const rol = String(gebruiker?.gebruikerType || "").toLowerCase();

      if (rol === "veilingmeester") {
        router.push(`/dashboard?veiling=${gekozenVeiling.veiling_Id}`);
      } else {
        router.push(`/veilingen/${gekozenVeiling.veiling_Id}`);
      }
      return;
    }

    const text = await res.text();
    alert("❌ Fout: " + text);
  }

  return (
    <div className="koppelen-wrapper">
      <div className="koppelen-container">
        <h1 className="koppelen-title">Kies een veiling</h1>

        {veilingen.length === 0 ? (
          <p className="empty-products">Geen veilingen gevonden.</p>
        ) : (
          <ul className="producten-ul">
            {veilingen.map((v) => (
              <li key={v.veiling_Id} className="product-card">
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

        {gekozenVeiling && (
          <div className="popup-overlay">
            <div className="popup">
              <h2 className="popup-title">
                Koppel product aan “
                {gekozenVeiling.titel ||
                  gekozenVeiling.kloklocatie ||
                  "Veiling"}
                ”
              </h2>

              <label>Product</label>
              <select
                value={gekozenProduct ? String(gekozenProduct.product_Id) : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const found =
                    producten.find((p) => String(p.product_Id) === String(val)) ||
                    null;
                  setGekozenProduct(found);
                }}
              >
                <option value="">-- kies product --</option>
                {producten.map((p) => (
                  <option key={p.product_Id} value={String(p.product_Id)}>
                    {p.naam} (voorraad: {p.hoeveelheid})
                  </option>
                ))}
              </select>

              <label>Hoeveelheid *</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={hoeveelheid}
                onChange={(e) => setHoeveelheid(e.target.value)}
              />

              <label>Prijs (€) (optioneel)</label>
              <input
                type="text"
                inputMode="decimal"
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

                <button className="popup-confirm" onClick={bevestigKoppeling}>
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