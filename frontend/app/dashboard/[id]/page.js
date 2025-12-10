"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import VeilingKlok from "../../components/VeilingKlok";
import VeilingenLijst from "../../components/VeilingenLijst";
import KoperRij from "../../components/Koperrij";
import VeilingProductenLijst from "../../components/VeilingProductenLijst";

import "../../styles/dashboard.css";

export default function Dashboard() {
  const [veilingen, setVeilingen] = useState([]);
  const [selectedVeiling, setSelectedVeiling] = useState(null);
  const [error, setError] = useState(null);
  const [klanten, setKlanten] = useState([]);
  const [gebruiker, setGebruiker] = useState(null);
  const [token, setToken] = useState(null);
  const [geselecteerdProduct, setGeselecteerdProduct] = useState(null);

  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const veilingIdFromUrl = searchParams.get("veiling");

  // ------------------------------
  // AUTH LADEN
  // ------------------------------
  useEffect(() => {
    const storedGebruiker = localStorage.getItem("gebruiker");
    const storedToken = localStorage.getItem("token");

    if (!storedGebruiker || !storedToken) {
      router.push("/login");
      return;
    }

    setGebruiker(JSON.parse(storedGebruiker));
    setToken(storedToken);
  }, [router]);

  const rol = gebruiker?.gebruikerType?.toLowerCase();

  // ------------------------------
  // VEILINGEN LADEN
  // ------------------------------
  useEffect(() => {
    if (!token) return;

    async function fetchVeilingen() {
      try {
        const res = await fetch("http://localhost:5281/api/Veilingen", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setVeilingen(data);

        const match = veilingIdFromUrl
          ? data.find(v => v.veiling_Id === veilingIdFromUrl)
          : data[0];

        setSelectedVeiling(match);
      } catch {
        setError("Kon veilingen niet ophalen");
      }
    }

    fetchVeilingen();
  }, [token, veilingIdFromUrl]);

  // ------------------------------
  // KLANTEN LADEN
  // ------------------------------
  useEffect(() => {
    if (!token || (rol !== "veilingmeester" && rol !== "aanvoerder")) return;

    async function fetchKlanten() {
      try {
        const res = await fetch("http://localhost:5281/api/Klanten", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();

        setKlanten(await res.json());
      } catch {
        console.error("Kon klanten niet ophalen");
      }
    }

    fetchKlanten();
  }, [rol, token]);

  // ------------------------------
  // ACTIES
  // ------------------------------
  async function handleKlantVerwijderen(id) {
    if (!confirm("Weet je zeker?")) return;

    await fetch(`http://localhost:5281/api/Klanten/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setKlanten(prev => prev.filter(k => k.gebruiker_Id !== id));
  }

  // ------------------------------
  // LOADING
  // ------------------------------
  if (!gebruiker || !token) return <div className="dashboard-loading">Laden...</div>;

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">Dashboard</h1>

        <div className="dashboard-layout">

          {/* ------------------ LINKERKANT ------------------ */}
          <div className="dashboard-column-left">

            {/* PRODUCTEN IN DEZE VEILING */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Producten</h2>
              </div>

              <VeilingProductenLijst
                veilingId={selectedVeiling?.veiling_Id}
                onSelect={(product) => setGeselecteerdProduct(product)}
              />
            </div>

            {/* BIDERS */}
            {(rol === "veilingmeester" || rol === "aanvoerder") && (
              <div className="section-card">
                <div className="section-header">
                  <h2 className="section-title">Biedingen</h2>
                </div>

                <table className="kopers-table">
                  <tbody>
                    {klanten.map(k => (
                      <KoperRij
                        key={k.gebruiker_Id}
                        klant={k}
                        onDelete={
                          rol === "veilingmeester"
                            ? () => handleKlantVerwijderen(k.gebruiker_Id)
                            : undefined
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ------------------ RECHTERKANT ------------------ */}
          <div className="dashboard-column-right">

            {/* VEILINGKLOK */}
            <div className="klok-wrapper">
              {selectedVeiling ? (
                <VeilingKlok veiling={selectedVeiling} gebruikerRol={rol} />
              ) : (
                <p>Geen veiling geselecteerd</p>
              )}
            </div>

            {/* ⭐ GESELECTEERD PRODUCT-KAART */}
            {geselecteerdProduct && (
              <div className="mt-6 p-5 bg-white shadow-md rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold mb-3 text-gray-800">
                  Geselecteerd product
                </h3>

                {geselecteerdProduct.foto ? (
                  <img
                    src={geselecteerdProduct.foto}
                    alt={geselecteerdProduct.naam}
                    className="w-full h-48 object-cover rounded-lg shadow-sm mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                    Geen foto beschikbaar
                  </div>
                )}

                <p className="mb-1"><strong>Naam:</strong> {geselecteerdProduct.naam}</p>
                <p className="mb-1"><strong>Kenmerken:</strong> {geselecteerdProduct.artikelKenmerken}</p>
                <p className="mb-1"><strong>Hoeveelheid:</strong> {geselecteerdProduct.hoeveelheid}</p>
                <p className="mb-1"><strong>Startprijs:</strong> €{geselecteerdProduct.startPrijs}</p>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}