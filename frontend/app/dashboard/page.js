"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import VeilingenLijst from "../components/VeilingenLijst";
import VeilingKlok from "../components/VeilingKlok";
import KoperRij from "../components/Koperrij";

import "../styles/dashboard.css";

export default function Dashboard() {
  const [veilingen, setVeilingen] = useState([]);
  const [selectedVeiling, setSelectedVeiling] = useState(null);
  const [error, setError] = useState(null);
  const [klanten, setKlanten] = useState([]);
  const [gebruiker, setGebruiker] = useState(null);

  const router = useRouter();

  // ---------- AUTH LOAD ----------
  useEffect(() => {
    const storedGebruiker = localStorage.getItem("gebruiker");

    if (!storedGebruiker) {
      router.push("/login");
      return;
    }

    setGebruiker(JSON.parse(storedGebruiker));
  }, [router]);

  const rol = gebruiker?.gebruikerType?.toLowerCase();

  // ---------- VEILINGEN OPHALEN ----------
  useEffect(() => {
    if (!gebruiker) return;

    async function fetchVeilingen() {
      try {
        const res = await fetch("http://localhost:5281/api/Veilingen", {
          method: "GET",
          credentials: "include", // cookie meesturen
        });

        if (res.status === 401) {
          localStorage.removeItem("gebruiker");
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error();

        const data = await res.json();
        setVeilingen(data);
        if (data.length > 0) setSelectedVeiling(data[0]);
      } catch {
        setError("Kon veilingen niet ophalen");
      }
    }

    fetchVeilingen();
  }, [gebruiker, router]);

  // ---------- KLANTEN OPHALEN ----------
  useEffect(() => {
    if (!gebruiker) return;
    if (rol !== "veilingmeester" && rol !== "aanvoerder") return;

    async function fetchKlanten() {
      try {
        const res = await fetch("http://localhost:5281/api/Klanten", {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          localStorage.removeItem("gebruiker");
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error();

        setKlanten(await res.json());
      } catch (err) {
        console.error("Kon klanten niet ophalen", err);
      }
    }

    fetchKlanten();
  }, [rol, gebruiker, router]);

  // ---------- ACTIES ----------
  async function handleKlantVerwijderen(id) {
    if (!confirm("Weet je zeker dat je deze koper wilt verwijderen?")) return;

    const res = await fetch(`http://localhost:5281/api/Klanten/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.status === 401) {
      localStorage.removeItem("gebruiker");
      router.push("/login");
      return;
    }

    if (!res.ok) {
      alert("Fout bij verwijderen koper");
      return;
    }

    setKlanten(prev => prev.filter(k => k.gebruiker_Id !== id));
  }

  async function handleVeilingVerwijderen(id) {
    if (!confirm("Weet je zeker dat je deze veiling wilt verwijderen?")) return;

    const res = await fetch(`http://localhost:5281/api/Veilingen/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.status === 401) {
      localStorage.removeItem("gebruiker");
      router.push("/login");
      return;
    }

    if (!res.ok) {
      alert("Fout bij verwijderen veiling");
      return;
    }

    setVeilingen(prev =>
      prev.filter(v => v.veiling_Id !== id && v.Veiling_Id !== id)
    );
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
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nieuwe),
    });

    if (res.status === 401) {
      localStorage.removeItem("gebruiker");
      router.push("/login");
      return;
    }

    if (!res.ok) {
      alert("Veiling aanmaken mislukt");
      return;
    }

    const created = await res.json();
    setVeilingen(prev => [created, ...prev]);
    setSelectedVeiling(created);
  }

  // ---------- LOADING ----------
  if (!gebruiker) {
    return <div className="dashboard-loading">Laden...</div>;
  }

  // ---------- UI ----------
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1 className="dashboard-title">Dashboard</h1>

        <div className="dashboard-layout">
          {/* LINKERKANT */}
          <div className="dashboard-column-left">
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
                onDelete={
                  rol === "veilingmeester"
                    ? handleVeilingVerwijderen
                    : undefined
                }
                rol={rol}
              />
            </div>

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

          {/* RECHTERKANT */}
          <div className="dashboard-column-right">
            <div className="klok-wrapper">
              {selectedVeiling ? (
                <VeilingKlok veiling={selectedVeiling} gebruikerRol={rol} />
              ) : (
                <p className="no-veiling">Geen actieve veiling geselecteerd</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}