"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../styles/veilingen.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5281/api";

export default function VeilingenPage() {
  const [veilingen, setVeilingen] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // filters
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("nieuwste"); // nieuwste | oudste | locatie

  const router = useRouter();

  // -----------------------------
  // helpers
  // -----------------------------
  const norm = (v) => String(v ?? "").toLowerCase().trim();

  const getNaam = (v) => v.kloklocatie || v.titel || "Veiling";

  const getStartMs = (v) => {
    const raw = v.startTijd ?? v.StartTijd;
    const d = raw ? new Date(raw) : null;
    return d && !isNaN(d) ? d.getTime() : 0;
  };

  // -----------------------------
  // veilingen ophalen (ALLEEN ACTIEF)
  // -----------------------------
  useEffect(() => {
    async function fetchVeilingen() {
      try {
        setBusy(true);
        setError(null);

        const res = await fetch(`${API_BASE}/Veilingen`, {
          credentials: "include",
        });

        if (res.status === 401) {
          localStorage.removeItem("gebruiker");
          router.push("/login");
          return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        const actieve = (Array.isArray(data) ? data : []).filter(
          (v) => norm(v.status ?? v.Status) === "actief"
        );

        setVeilingen(actieve);
      } catch (err) {
        console.error("❌ Fout bij ophalen veilingen:", err);
        setError("Kon veilingen niet ophalen.");
      } finally {
        setBusy(false);
      }
    }

    fetchVeilingen();
  }, [router]);

  // -----------------------------
  // zichtbare lijst (zoek + sorteer)
  // -----------------------------
  const zichtbareVeilingen = useMemo(() => {
    let list = [...veilingen];
    const q = norm(query);

    if (q) {
      list = list.filter((v) => norm(getNaam(v)).includes(q));
    }

    if (sortBy === "nieuwste") {
      list.sort((a, b) => getStartMs(b) - getStartMs(a));
    } else if (sortBy === "oudste") {
      list.sort((a, b) => getStartMs(a) - getStartMs(b));
    } else if (sortBy === "locatie") {
      list.sort((a, b) => norm(getNaam(a)).localeCompare(norm(getNaam(b))));
    }

    return list;
  }, [veilingen, query, sortBy]);

  // -----------------------------
  // UI
  // -----------------------------
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="veilingen-wrapper">
      <div className="veilingen-container">
        <h1>Actieve veilingen</h1>

        {/* FILTERS */}
        <div className="veilingen-filter-row">
          <div className="veilingen-filter-left">
            <span className="veilingen-filter-label">Sorteren</span>

            <select
              className="veilingen-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={busy}
            >
              <option value="nieuwste">Nieuwste eerst</option>
              <option value="oudste">Oudste eerst</option>
              <option value="locatie">Locatie A–Z</option>
            </select>
          </div>

          <div className="veilingen-filter-right">
            <input
              className="veilingen-filter-search"
              placeholder="Zoek op kloklocatie / titel…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={busy}
            />

            <button
              className="veilingen-filter-clear"
              onClick={() => {
                setQuery("");
                setSortBy("nieuwste");
              }}
              disabled={busy}
            >
              Reset
            </button>
          </div>
        </div>

        {/* RESULTAAT */}
        {busy ? (
          <p className="empty-text">Laden…</p>
        ) : zichtbareVeilingen.length === 0 ? (
          <p className="empty-text">Geen actieve veilingen gevonden.</p>
        ) : (
          <div className="veilingen-grid">
            {zichtbareVeilingen.map((v) => (
              <Link
                key={v.veiling_Id}
                href={`/veilingen/${v.veiling_Id}`}
                className="veilingen-card"
              >
                <div className="veilingen-card-header header-actief">
                  {v.kloklocatie || "Veiling"}
                </div>

                <div className="veilingen-card-content">
                  <h2>{getNaam(v)}</h2>

                  <p className="tijd">
                    {new Date(v.startTijd ?? v.StartTijd).toLocaleString()}
                    <br />
                    {new Date(v.eindTijd ?? v.EindTijd).toLocaleString()}
                  </p>

                  <span className="veilingen-status status-actief">
                    actief
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