"use client";
import { useEffect, useState } from "react";
import VeilingenLijst from "../components/VeilingenLijst";
import VeilingKlok from "../components/VeilingKlok";
import KoperRij from "../components/Koperrij";
import { useRouter } from "next/navigation";

import "../styles/dashboard.css";

export default function Dashboard() {
  const [veilingen, setVeilingen] = useState([]);
  const [selectedVeiling, setSelectedVeiling] = useState(null);
  const [error, setError] = useState(null);
  const [klanten, setKlanten] = useState([]);
  const [gebruiker, setGebruiker] = useState(null);
  const [token, setToken] = useState(null);

  const router = useRouter();

  // AUTH LOAD
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

  // VEILINGEN
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
        if (data.length > 0) setSelectedVeiling(data[0]);
      } catch {
        setError("Kon veilingen niet ophalen");
      }
    }

    fetchVeilingen();
  }, [token]);

  // KLANTEN
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

  // ACTIES
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

    setVeilingen(prev => prev.filter(v => v.veiling_Id !== id && v.Veiling_Id !== id));
  }

  async function maakRandomVeiling() {
    if (rol !== "veilingmeester") return;

    const nieuwe = {
      veilingPrijs: 50,
      veilingDatum: new Date().toISOString().split("T")[0],
      startTijd: new Date().toISOString(),
      eindTijd: new Date(Date.now() + 600000).toISOString(),
      status: "open",
      product_Id: "ce01670c-bc94-4dc3-8864-ddb756996006",
      veilingmeester_Id: gebruiker.gebruiker_Id,
    };

    const res = await fetch("http://localhost:5281/api/Veilingen", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nieuwe),
    });

    const created = await res.json();
    setVeilingen(prev => [created, ...prev]);
  }

  // LOADING
  if (!gebruiker || !token) {
    return <div className="dashboard-loading">Laden...</div>;
  }

  // UI
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">Dashboard</h1>

        <div className="dashboard-layout">
          {/* LINKERKANT */}
          <div className="dashboard-column-left">
            {/* Aankomende veilingen */}
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">Aankomende veilingen</h2>

                {rol === "veilingmeester" && (
                  <button className="new-veiling-btn" onClick={maakRandomVeiling}>
                    + Nieuwe veiling
                  </button>
                )}
              </div>

              <VeilingenLijst
                veilingen={veilingen}
                error={error}
                selectedVeiling={selectedVeiling}
                onSelect={setSelectedVeiling}
                onDelete={rol === "veilingmeester" ? handleVeilingVerwijderen : undefined}
                rol={rol}
              />
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

          {/* RECHTERKANT – KLOKVEILING */}
          <div className="dashboard-column-right">
            <div className="klok-wrapper">
              <VeilingKlok veiling={selectedVeiling} gebruikerRol={rol} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}