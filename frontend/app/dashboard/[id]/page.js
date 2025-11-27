"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import VeilingenLijst from "../../components/VeilingenLijst";
import VeilingKlok from "../../components/VeilingKlok";
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

        // 🔥 Als er een veiling-ID in de URL staat → die selecteren
        if (veilingIdFromUrl) {
          const match = data.find(
            v =>
              v.veiling_Id === veilingIdFromUrl ||
              v.Veiling_Id === veilingIdFromUrl
          );
          setSelectedVeiling(match || data[0]);
        } else {
          setSelectedVeiling(data[0]);
        }
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

  async function handleVeilingVerwijderen(id) {
    if (!confirm("Weet je zeker?")) return;

    await fetch(`http://localhost:5281/api/Veilingen/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setVeilingen(prev => prev.filter(v => v.veiling_Id !== id));
  }

  // ------------------------------
  // LOADING STATE
  // ------------------------------
  if (!gebruiker || !token) {
    return <div className="dashboard-loading">Laden...</div>;
  }

  // ------------------------------
  // UI
  // ------------------------------
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">Dashboard</h1>

        <div className="dashboard-layout">

          {/* LINKERKANT */}
          <div className="dashboard-column-left">

            {/* Veilingen lijst */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Producten</h2>
              </div>

              {/* <h2 className="text-xl font-semibold mb-4">Producten in deze veiling</h2> */}
                      <VeilingProductenLijst
                      Veiling_Id={veilingIdFromUrl || selectedVeiling?.Veiling_Id}
                      />

              {/* <VeilingenLijst
                veilingen={veilingen}
                error={error}
                selectedVeiling={selectedVeiling}
                onSelect={setSelectedVeiling}
                onDelete={rol === "veilingmeester" ? handleVeilingVerwijderen : undefined}
                rol={rol}
              /> */}
            </div>

            {/* Kopers */}
            {(rol === "veilingmeester" || rol === "aanvoerder") && (
              <div className="section-card">
                <div className="section-header">
                  <h2 className="section-title">Kopers</h2>
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

          {/* RECHTERKANT — KLOK */}
          <div className="dashboard-column-right">
            <div className="klok-wrapper">
              {selectedVeiling ? (
                <VeilingKlok veiling={selectedVeiling} gebruikerRol={rol} />
              ) : (
                <p>Geen veiling geselecteerd</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}