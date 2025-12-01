"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../styles/veilingen.css";
// import { useRouter } from "next/navigation";

export default function VeilingenPage() {
  const [veilingen, setVeilingen] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  // ✅ Ophalen van veilingen
  useEffect(() => {
    async function fetchVeilingen() {
      try {
        const res = await fetch("http://localhost:5281/api/Veilingen", {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          localStorage.removeItem("gebruiker");
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setVeilingen(data);
      } catch (err) {
        console.error("❌ Fout bij ophalen veilingen:", err);
        setError("Kon veilingen niet ophalen.");
      }
    }

    fetchVeilingen();
  }, [router]);

  // ✅ Foutmelding of lege lijst
  if (error)
    return (
      <p className="error-text">
        {error}
      </p>
    );

  if (veilingen.length === 0)
    return (
      <p className="empty-text">
        Geen veilingen beschikbaar.
      </p>
    );

  return (
  <div className="veilingen-wrapper">
    <div className="veilingen-container">
      <h1>Beschikbare Veilingen</h1>

      <div className="veilingen-grid">
        {veilingen.map((v) => (
          <Link
            key={v.veiling_Id}
            href={`/veilingen/${v.veiling_Id}`}
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
              <h2>{v.kloklocatie || "Naamloze Veiling"}</h2>
              <p className="product">{v.product?.naam || "Onbekend product"}</p>
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
    </div>
  </div>
);
}