"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HamburgerMenu from "../components/Hamburger";
import "../styles/producten.css";

export default function ProductenPage() {
  const [producten, setProducten] = useState([]);
  const [formData, setFormData] = useState({
    naam: "",
    artikelKenmerken: "",
    hoeveelheid: 0,
    startPrijs: 0,
    foto: "",
  });
  const router = useRouter();
  const [editId, setEditId] = useState(null);

  // -------------------------
  // AUTH + PRODUCTEN LADEN
  // -------------------------
  useEffect(() => {
    const gebruiker = localStorage.getItem("gebruiker");
    const token = localStorage.getItem("token");

    if (!gebruiker || !token) {
      router.push("/login");
      return;
    }

    fetchProducten(token);
  }, [router]);

  async function fetchProducten(token) {
    const gebruiker = JSON.parse(localStorage.getItem("gebruiker"));
    const aanvoerderId = gebruiker?.gebruiker_Id;
    console.log("Aanvoerder ID:", aanvoerderId);

    const res = await fetch("http://localhost:5281/api/Producten", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Fout bij ophalen producten:", text);
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.warn("⚠️ Verwachtte een array, kreeg:", data);
      return;
    }

    const eigenProducten = data.filter(
      (p) => p.aanvoerder_Id === aanvoerderId
    );
    setProducten(eigenProducten);
  }

  // -------------------------
  // PRODUCT VERWIJDEREN
  // -------------------------
  async function handleProductDelete(productId) {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5281/api/Producten/${productId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Fout bij verwijderen product:", text);
      return;
    }

    // direct uit de UI halen
    setProducten((prev) => prev.filter((p) => p.product_Id !== productId));

    console.log("✅ Product verwijderd:", productId);
  }

  // -------------------------
  // PRODUCT BEWERKEN
  // -------------------------
  function handleEdit(product) {
    setEditId(product.product_Id); // 👈 belangrijk!
    setFormData({
      naam: product.naam,
      artikelKenmerken: product.artikelKenmerken,
      hoeveelheid: product.hoeveelheid,
      startPrijs: product.startPrijs,
      foto: product.foto || "",
    });
  }

  // -------------------------
  // PRODUCT AANMAKEN
  // -------------------------
  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const gebruiker = JSON.parse(localStorage.getItem("gebruiker"));

    const payload = {
      ...formData,
      aanvoerder_Id: gebruiker.gebruiker_Id,
    };

    let url = "http://localhost:5281/api/Producten";
    let method = "POST";

    // 👉 Als editId bestaat → UPDATE i.p.v. nieuw product
    if (editId) {
      url = `http://localhost:5281/api/Producten/${editId}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("❌ Fout bij opslaan.");
      return;
    }

    alert(editId ? "✏️ Product bijgewerkt!" : "✅ Product aangemaakt!");

    setFormData({
      naam: "",
      artikelKenmerken: "",
      hoeveelheid: 0,
      startPrijs: 0,
      foto: "",
    });
    setEditId(null); // reset edit state

    fetchProducten(token);
  }

  return (
    <div className="producten-container">
      <div className="producten-header">
        <h1>Mijn Producten</h1>
      </div>

      <form className="producten-form" onSubmit={handleSubmit}>
        <h2>Nieuw product toevoegen</h2>

        <label htmlFor="naam">Naam</label>
        <input
          id="naam"
          value={formData.naam}
          onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
          required
        />

        <label htmlFor="artikelKenmerken">Artikelkenmerken</label>
        <textarea
          id="artikelKenmerken"
          value={formData.artikelKenmerken}
          onChange={(e) =>
            setFormData({ ...formData, artikelKenmerken: e.target.value })
          }
        />

        <label htmlFor="hoeveelheid">Hoeveelheid</label>
        <input
          id="hoeveelheid"
          type="number"
          min="1"
          value={formData.hoeveelheid || ""}
          onChange={(e) => {
            const val = e.target.value;
            setFormData({
              ...formData,
              hoeveelheid: val === "" ? 0 : parseInt(val),
            });
          }}
        />

        <label htmlFor="startPrijs">Startprijs (€)</label>
        <input
          id="startPrijs"
          type="number"
          step="0.01"
          value={formData.startPrijs || ""}
          onChange={(e) => {
            const val = e.target.value;
            setFormData({
              ...formData,
              startPrijs: val === "" ? 0 : parseFloat(val),
            });
          }}
        />

        <label htmlFor="foto">Afbeelding (URL)</label>
        <input
          id="foto"
          value={formData.foto}
          onChange={(e) =>
            setFormData({ ...formData, foto: e.target.value })
          }
        />

        <button type="submit">Product opslaan</button>
      </form>

      {producten.length > 0 ? (
        <table className="producten-lijst">
          <thead>
            <tr>
              <th>Naam</th>
              <th>Kenmerken</th>
              <th>Hoeveelheid</th>
              <th>Startprijs</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {producten.map((p) => (
              <tr key={p.product_Id}>
                <td>{p.naam}</td>
                <td>{p.artikelKenmerken}</td>
                <td>{p.hoeveelheid}</td>
                <td>€{p.startPrijs}</td>
                <td className="menu-cell">
                  <HamburgerMenu
                    items={[
                      {
                        label: "Bewerken",
                        onClick: () => handleEdit(p),
                      },
                      {
                        label: "Verwijderen",
                        danger: true,
                        onClick: () => handleProductDelete(p.product_Id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="empty-message">Nog geen producten toegevoegd.</p>
      )}
    </div>
  );
}