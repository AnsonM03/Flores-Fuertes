"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VeilingKlok from "../../components/VeilingKlok";
import VeilingProductenLijst from "../../components/VeilingProductenLijst";
import WachtlijstPanel from "../../components/WachtlijstPanel";
import KoperRij from "../../components/Koperrij";

import "../../styles/dashboard.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:5281/api";

export default function Dashboard() {
  const [veilingen, setVeilingen] = useState([]);
  const [selectedVeiling, setSelectedVeiling] = useState(null);
  const [error, setError] = useState(null);

  const [klanten, setKlanten] = useState([]);
  const [gebruiker, setGebruiker] = useState(null);
  const [token, setToken] = useState(null);

  const [geselecteerdProduct, setGeselecteerdProduct] = useState(null);

  // ✅ KEY FIX: actiefProduct per veilingId
  const [actiefPerVeiling, setActiefPerVeiling] = useState({}); // { [veilingId]: actiefVp }
  const actiefProduct = useMemo(() => {
    const id = selectedVeiling?.veiling_Id;
    return id ? actiefPerVeiling[id] ?? null : null;
  }, [actiefPerVeiling, selectedVeiling?.veiling_Id]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const veilingIdFromUrl = searchParams.get("veiling");

  // Abort controllers om “oude” responses te negeren
  const abortVeilingenRef = useRef(null);
  const abortActiefRef = useRef(null);

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
        abortVeilingenRef.current?.abort();
        const ctrl = new AbortController();
        abortVeilingenRef.current = ctrl;

        const res = await fetch(`${API_BASE}/Veilingen`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctrl.signal,
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setVeilingen(data);

        const match = veilingIdFromUrl
          ? data.find((v) => v.veiling_Id === veilingIdFromUrl)
          : data[0];

        setSelectedVeiling(match || null);
        setError(null);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError("Kon veilingen niet ophalen");
      }
    }

    fetchVeilingen();
  }, [token, veilingIdFromUrl]);

  // ------------------------------
  // ACTIEF PRODUCT OPHALEN (PER VEILING)
  // ------------------------------
  async function fetchActiefProduct(veilingId) {
    if (!veilingId || !token) return;

    try {
      abortActiefRef.current?.abort();
      const ctrl = new AbortController();
      abortActiefRef.current = ctrl;

      const res = await fetch(`${API_BASE}/Veilingen/veiling/${veilingId}/actief`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: ctrl.signal,
      });

      if (!res.ok) {
        setActiefPerVeiling((prev) => ({ ...prev, [veilingId]: null }));
        return;
      }

      const data = await res.json();
      const actief = data?.[0] ?? null;

      // ✅ opslaan per veilingId
      setActiefPerVeiling((prev) => ({ ...prev, [veilingId]: actief }));
    } catch (e) {
      if (e?.name === "AbortError") return;
      setActiefPerVeiling((prev) => ({ ...prev, [veilingId]: null }));
    }
  }

  // Bij wissel van selectedVeiling: reset geselecteerd product en haal actief opnieuw op
  useEffect(() => {
    const id = selectedVeiling?.veiling_Id;
    if (!id || !token) return;

    setGeselecteerdProduct(null);

    // ✅ belangrijk: direct “actiefProduct” voor die veiling laden
    fetchActiefProduct(id);
  }, [selectedVeiling?.veiling_Id, token]);

  // ------------------------------
  // (OPTIONEEL) BIEDERS VERWIJDEREN
  // ------------------------------
  async function handleKlantVerwijderen(id) {
    if (!confirm("Weet je zeker?")) return;

    await fetch(`${API_BASE}/Klanten/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setKlanten((prev) => prev.filter((k) => k.gebruiker_Id !== id));
  }

  if (!gebruiker || !token) return <div className="dashboard-loading">Laden...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">Dashboard</h1>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <div className="dashboard-layout">
          {/* ------------------ LINKERKANT ------------------ */}
          <div className="dashboard-column-left">
            {rol === "veilingmeester" && (
              <WachtlijstPanel
                veilingId={selectedVeiling?.veiling_Id}
                token={token}
                // ✅ jouw WachtlijstPanel gebruikt momenteel "onActivated" i.p.v. "onChanged"
                onActivated={() => {
                  if (!selectedVeiling?.veiling_Id) return;
                  fetchActiefProduct(selectedVeiling.veiling_Id);
                }}
              />
            )}

            <div className="section-card actieve-veiling">
              <div className="section-header">
                <h2 className="section-title">Producten</h2>
              </div>

              <VeilingProductenLijst
                veilingId={selectedVeiling?.veiling_Id}
                onSelect={(product) => setGeselecteerdProduct(product)}
              />
            </div>

            {(rol === "veilingmeester" || rol === "aanvoerder") && (
              <div className="section-card bieders-panel">
                <div className="section-header">
                  <h2 className="section-title">Bieders</h2>
                </div>

                <table className="kopers-table">
                  <tbody>
                    {klanten.map((k) => (
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
            <div className="klok-wrapper">
              {selectedVeiling ? (
                <VeilingKlok
                  veiling={selectedVeiling}
                  gebruikerRol={rol}
                  token={token}
                  actiefProduct={actiefProduct}
                  setVeiling={(updater) => {
                    setSelectedVeiling((prev) => {
                      const next = typeof updater === "function" ? updater(prev) : updater;

                      // update ook in lijst
                      setVeilingen((list) =>
                        list.map((v) => (v.veiling_Id === next.veiling_Id ? next : v))
                      );

                      return next;
                    });
                  }}
                  onStarted={() => {
                    // na start: opnieuw actief product ophalen voor deze veiling
                    if (!selectedVeiling?.veiling_Id) return;
                    fetchActiefProduct(selectedVeiling.veiling_Id);
                  }}
                />
              ) : (
                <p>Geen veiling geselecteerd</p>
              )}
            </div>

            {geselecteerdProduct && (
              <div className="mt-6 p-5 bg-white shadow-md rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold mb-3 text-gray-800">Geselecteerd product</h3>

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

                <p className="mb-1">
                  <strong>Naam:</strong> {geselecteerdProduct.naam}
                </p>
                <p className="mb-1">
                  <strong>Kenmerken:</strong> {geselecteerdProduct.artikelKenmerken}
                </p>
                <p className="mb-1">
                  <strong>Hoeveelheid:</strong> {geselecteerdProduct.hoeveelheid}
                </p>
                <p className="mb-1">
                  <strong>Startprijs:</strong> €{geselecteerdProduct.startPrijs}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}