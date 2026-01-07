"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HamburgerMenu from "../components/Hamburger";
import "../styles/producten.css";

export default function ProductenPage() {
  const router = useRouter();

  const [producten, setProducten] = useState([]);
  const [geselecteerdProduct, setGeselecteerdProduct] = useState(null);
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    naam: "",
    artikelKenmerken: "",
    hoeveelheid: 0,
    startPrijs: 0,
    foto: "",
  });

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
  }, []);

  async function fetchProducten(token) {
    const gebruiker = JSON.parse(localStorage.getItem("gebruiker"));
    const aanvoerderId = gebruiker?.gebruiker_Id;

    const res = await fetch("http://localhost:5281/api/Producten", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    const data = await res.json();
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
      console.error(await res.text());
      return;
    }

    setProducten((prev) => prev.filter((p) => p.product_Id !== productId));
    setGeselecteerdProduct(null);
  }

  // -------------------------
  // PRODUCT BEWERKEN
  // -------------------------
  function handleEdit(product) {
    setEditId(product.product_Id);
    setFormData({
      naam: product.naam,
      artikelKenmerken: product.artikelKenmerken,
      hoeveelheid: product.hoeveelheid,
      startPrijs: product.startPrijs,
      foto: product.foto || "",
    });
  }

  // -------------------------
  // PRODUCT OPSLAAN
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
      alert("❌ Fout bij opslaan");
      return;
    }

    setFormData({
      naam: "",
      artikelKenmerken: "",
      hoeveelheid: 0,
      startPrijs: 0,
      foto: "",
    });

    setEditId(null);
    fetchProducten(token);
  }

  // -------------------------
  // FOTO UPLOAD
  // -------------------------
  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("http://localhost:5281/api/Producten/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setFormData((prev) => ({ ...prev, foto: data.url }));

    setUploading(false);
  }

  return (
    <div className="producten-container">
      <div className="producten-header">
        <h1>Mijn Producten</h1>
      </div>

      <div className="producten-layout">
        {/* LINKS – PRODUCTEN */}
        <div className="producten-links">
          {producten.length > 0 ? (
            <>
              <table className="producten-lijst">
                <thead>
                  <tr>
                    <th>Naam</th>
                    <th>Kenmerken</th>
                    <th>Hoeveelheid</th>
                    <th>Startprijs</th>
                    {/* <th></th> */}
                  </tr>
                </thead>
                <tbody>
                  {producten.map((p) => (
                    <tr
                      key={p.product_Id}
                      className={
                        "product-row " +
                        (geselecteerdProduct?.product_Id === p.product_Id ? "selected" : "")
                      }
                      onClick={() => {
                        setGeselecteerdProduct(p);
                        setEditId(p.product_Id);
                        setFormData({
                          naam: p.naam,
                          artikelKenmerken: p.artikelKenmerken,
                          hoeveelheid: p.hoeveelheid,
                          startPrijs: p.startPrijs,
                          foto: p.foto || "",
                        });
                      }}
                    >
                      <td>{p.naam}</td>
                      <td>{p.artikelKenmerken}</td>
                      <td>{p.hoeveelheid}</td>
                      <td>€{p.startPrijs}</td>
                      {/* <td
                        className="menu-cell"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HamburgerMenu
                          items={[
                            {
                              label: "Bewerken",
                              onClick: () => handleEdit(p),
                            },
                            {
                              label: "Verwijderen",
                              danger: true,
                              onClick: () =>
                                handleProductDelete(p.product_Id),
                            },
                          ]}
                        />
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="empty-message">Nog geen producten toegevoegd.</p>
          )}
        </div>

        {/* RECHTS – FORMULIER */}
        <div className="producten-rechts">
          <form className="producten-form" onSubmit={handleSubmit}>
            <h2>{geselecteerdProduct ? "Product bewerken" : "Nieuw product toevoegen"}</h2>

            <label>Naam</label>
            <input
              value={formData.naam}
              onChange={(e) =>
                setFormData({ ...formData, naam: e.target.value })
              }
              required
            />

            <label>Artikelkenmerken</label>
            <textarea
              value={formData.artikelKenmerken}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  artikelKenmerken: e.target.value,
                })
              }
            />

            <label>Hoeveelheid</label>
            <input
              type="number"
              min="1"
              value={formData.hoeveelheid || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hoeveelheid: Number(e.target.value),
                })
              }
            />

            <label>Startprijs (€)</label>
            <input
              type="number"
              step="0.01"
              value={formData.startPrijs || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  startPrijs: Number(e.target.value),
                })
              }
            />

            <label>Afbeelding uploaden</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} />

            {uploading && <p>⏳ Uploaden...</p>}

            {formData.foto && (
              <img
                src={formData.foto}
                alt="preview"
                className="foto-preview"
              />
            )}

            {/* <button type="submit">
              {editId ? "Opslaan" : "Product toevoegen"}
            </button> */}

            {geselecteerdProduct && (
              <button
                type="button"
                className="koppel-knop formulier-koppel"
                onClick={() => 
                  router.push(`/koppelen/${geselecteerdProduct.product_Id}`)
                }
              >
                Koppel “{geselecteerdProduct.naam}” aan veiling
              </button>
            )}

            <div className="formulier-acties">
              {geselecteerdProduct ? (
                <>
                  <button type="submit" className="btn-blauw">
                    Opslaan
                  </button>

                  <button
                    type="button"
                    className="btn-rood"
                    onClick={() => handleProductDelete(geselecteerdProduct.product_Id)}
                  >
                    Verwijderen
                  </button>

                  <button
                    type="button"
                    className="btn-grijs"
                    onClick={() => {
                      setGeselecteerdProduct(null);
                      setEditId(null);
                      setFormData({
                        naam: "",
                        artikelKenmerken: "",
                        hoeveelheid: 0,
                        startPrijs: 0,
                        foto: "",
                      });
                    }}
                  >
                    Annuleren
                  </button>
                </>
              ) : (
                <button type="submit" className="btn-groen">
                  Product toevoegen
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}