"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../styles/veilingen.css";

export default function MijnVeilingenPage() {
  const [veilingen, setVeilingen] = useState([]);
  const [error, setError] = useState(null);
  const [gebruiker, setGebruiker] = useState(null);

  const router = useRouter();

  // ✔️ AUTH LADEN
  useEffect(() => {
    const stored = localStorage.getItem("gebruiker");
    const token = localStorage.getItem("token");

    console.log("LS gebruiker:", stored);
    console.log("LS token:", token);

    if (!stored || !token) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const rol = parsed?.gebruikerType?.toLowerCase() || "";

      if (rol !== "veilingmeester") {
        alert("Je hebt geen toegang tot dit dashboard");
        router.push("/");
        return;
      }

      setGebruiker(parsed);
    } catch (e) {
      console.error("Kon gebruiker niet parsen uit localStorage:", e);
      router.push("/login");
    }
  }, [router]);

  // ✔️ VEILINGEN LADEN
  useEffect(() => {
    if (!gebruiker) return;

    async function fetchVeilingen() {
      try {
        const res = await fetch("http://localhost:5281/api/Veilingen");

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        const mijnVeilingen = data.filter(
          (v) => v.veilingmeester_Id === gebruiker.gebruiker_Id
        );

        setVeilingen(mijnVeilingen);
      } catch (err) {
        console.error("Fout bij ophalen:", err);
        setError("Kon veilingen niet ophalen.");
      }
    }

    fetchVeilingen();
  }, [gebruiker]);

  if (error) return <p className="error-text">{error}</p>;
  if (!gebruiker) return <p className="empty-text">Laden...</p>;

  return (
    <div className="veilingen-wrapper">
      <div className="veilingen-container">
        <div className="veilingen-header-row">
          <h1>Mijn Veilingen</h1>
          <button
            className="nieuwe-veiling-btn"
            onClick={() => router.push("/dashboard/nieuwe-veiling")}
          >
            + Nieuwe veiling
          </button>
        </div>

        {veilingen.length === 0 ? (
          <p className="empty-text">Je hebt nog geen veilingen aangemaakt.</p>
        ) : (
          <div className="veilingen-grid">
            {veilingen.map((v) => (
              <Link
                key={v.veiling_Id}
                href={`/dashboard/${v.veiling_Id}`}
                className="veilingen-card"
              >
                <div
                  className={`veilingen-card-header ${
                    v.status === "actief"
                      ? "header-actief"
                      : v.status === "afgelopen"
                      ? "header-afgelopen"
                      : "header-wachten"
                  }`}
                >
                  {v.kloklocatie || "Veiling"}
                </div>

                <div className="veilingen-card-content">
                  <h2>{v.titel || "Naamloze Veiling"}</h2>
                  <p className="product">
                    {v.product?.naam || "Onbekend product"}
                  </p>

                  <p className="tijd">
                    {new Date(v.startTijd).toLocaleString()} <br />
                    {new Date(v.eindTijd).toLocaleString()}
                  </p>

                  <span
                    className={`veilingen-status ${
                      v.status === "actief"
                        ? "status-actief"
                        : v.status === "afgelopen"
                        ? "status-afgelopen"
                        : "status-wachten"
                    }`}
                  >
                    {v.status || "In voorbereiding"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}