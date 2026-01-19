"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VeilingKlok from "../../components/VeilingKlok";
import VeilingProductenLijst from "../../components/VeilingProductenLijst";
import WachtlijstPanel from "../../components/WachtlijstPanel";
import KoperRij from "../../components/Koperrij";
import GeselecteerdProductCard from "../../components/GeselecteerdProductCard";
import "../../styles/dashboard.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5281/api";

export default function Dashboard() {
  const [veilingen, setVeilingen] = useState([]);
  const [selectedVeiling, setSelectedVeiling] = useState(null);
  const [error, setError] = useState(null);

  const [klanten, setKlanten] = useState([]);
  const [gebruiker, setGebruiker] = useState(null);
  const [token, setToken] = useState(null);

  const [geselecteerdProduct, setGeselecteerdProduct] = useState(null);

  // ✅ actief product per veilingId
  const [actiefPerVeiling, setActiefPerVeiling] = useState({});
  const actiefProduct = useMemo(() => {
    const id = selectedVeiling?.veiling_Id;
    return id ? actiefPerVeiling[id] ?? null : null;
  }, [actiefPerVeiling, selectedVeiling?.veiling_Id]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const veilingIdFromUrl = searchParams.get("veiling");

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

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setVeilingen(list);

        const match = veilingIdFromUrl
          ? list.find((v) => v.veiling_Id === veilingIdFromUrl)
          : list[0];

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
  // ✅ ACTIEF PRODUCT OPHALEN (PER VEILING)
  // ------------------------------
  async function fetchActiefProduct(veilingId) {
    if (!veilingId || !token) return;

    try {
      abortActiefRef.current?.abort();
      const ctrl = new AbortController();
      abortActiefRef.current = ctrl;

      const res = await fetch(
        `${API_BASE}/VeilingProducten/veiling/${veilingId}/actief`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctrl.signal,
        }
      );

      if (!res.ok) {
        setActiefPerVeiling((prev) => ({ ...prev, [veilingId]: null }));
        return;
      }

      const data = await res.json();
      const actief = data?.[0] ?? null;

      setActiefPerVeiling((prev) => ({ ...prev, [veilingId]: actief }));
    } catch (e) {
      if (e?.name === "AbortError") return;
      setActiefPerVeiling((prev) => ({ ...prev, [veilingId]: null }));
    }
  }

  // Bij wissel van veiling: reset selectie + haal actief op
  useEffect(() => {
    const id = selectedVeiling?.veiling_Id;
    if (!id || !token) return;

    setGeselecteerdProduct(null);
    fetchActiefProduct(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (!gebruiker || !token)
    return <div className="dashboard-loading">Laden...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">Dashboard</h1>

        {/* ================= VEILING SELECTOR ================= */}
<div className="dashboard-veiling-select">
  <label className="dashboard-label">Kies veiling</label>

  <select
    className="dashboard-select"
    value={selectedVeiling?.veiling_Id || ""}
    onChange={(e) => {
      const id = e.target.value;
      const v = veilingen.find((x) => x.veiling_Id === id) || null;
      setSelectedVeiling(v);
    }}
  >
    {veilingen.map((v) => (
      <option key={v.veiling_Id} value={v.veiling_Id}>
        {v.kloklocatie || v.titel || "Veiling"} ({v.status})
      </option>
    ))}
  </select>
</div>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <div className="dashboard-layout">
          {/* ------------------ LINKERKANT ------------------ */}
          <div className="dashboard-column-left">
            {rol === "veilingmeester" && selectedVeiling?.veiling_Id && (
              <WachtlijstPanel
                key={selectedVeiling.veiling_Id}
                veilingId={selectedVeiling.veiling_Id}
                onActivated={() => fetchActiefProduct(selectedVeiling.veiling_Id)}
              />
            )}

            {/* ✅ Producten-sectie terug zoals je bedoelde */}
            {/* <div className="section-card actieve-veiling">
              <div className="section-header">
                <h2 className="section-title">Producten</h2>
              </div> */}

              <VeilingProductenLijst
                veilingId={selectedVeiling?.veiling_Id}
                token={token}
                onSelect={(product) => setGeselecteerdProduct(product)}
              />
            {/* </div> */}

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
                      const next =
                        typeof updater === "function" ? updater(prev) : updater;

                      setVeilingen((list) =>
                        list.map((v) =>
                          v.veiling_Id === next.veiling_Id ? next : v
                        )
                      );

                      return next;
                    });
                  }}
                  onStarted={() => {
                    if (!selectedVeiling?.veiling_Id) return;
                    fetchActiefProduct(selectedVeiling.veiling_Id);
                  }}
                />
              ) : (
                <p>Geen veiling geselecteerd</p>
              )}
            </div>

            {/* ✅ hier jouw nieuwe component */}
            <GeselecteerdProductCard product={geselecteerdProduct} />
          </div>
        </div>
      </div>
    </div>
  );
}