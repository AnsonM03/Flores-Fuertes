"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../styles/veilingen.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5281/api";

export default function MijnVeilingenPage() {
  const [veilingen, setVeilingen] = useState([]);
  const [error, setError] = useState(null);
  const [gebruiker, setGebruiker] = useState(null);

  // delete mode
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState([]); // array of veiling_Id
  const [busy, setBusy] = useState(false);

  // filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("alle"); // alle | wachtend | actief | afgelopen
  const [sortBy, setSortBy] = useState("nieuwste"); // nieuwste | oudste | locatie

  const router = useRouter();

  // -----------------------------
  // AUTH LADEN
  // -----------------------------
  useEffect(() => {
    const stored = localStorage.getItem("gebruiker");
    const token = localStorage.getItem("token");

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

  // -----------------------------
  // VEILINGEN LADEN
  // -----------------------------
  async function fetchVeilingen() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/Veilingen`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // Alleen veilingen van deze veilingmeester
      const mijnVeilingen = data.filter(
        (v) => v.veilingmeester_Id === gebruiker?.gebruiker_Id
      );

      setVeilingen(mijnVeilingen);
      setError(null);
    } catch (err) {
      console.error("Fout bij ophalen:", err);
      setError("Kon veilingen niet ophalen.");
    }
  }

  useEffect(() => {
    if (!gebruiker) return;
    fetchVeilingen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gebruiker]);

  // -----------------------------
  // HELPERS
  // -----------------------------
  function norm(s) {
    return String(s ?? "").toLowerCase().trim();
  }

  function getStatus(v) {
    return norm(v.status ?? v.Status ?? "wachtend");
  }

  function getNaam(v) {
    return v.kloklocatie || v.titel || "Veiling";
  }

  function getStartMs(v) {
    const raw = v.startTijd ?? v.StartTijd;
    if (!raw) return 0;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  }

  const zichtbareVeilingen = useMemo(() => {
    const q = norm(query);

    let list = [...veilingen];

    // filter status
    if (statusFilter !== "alle") {
      list = list.filter((v) => getStatus(v) === statusFilter);
    }

    // search
    if (q) {
      list = list.filter((v) => norm(getNaam(v)).includes(q));
    }

    // sort
    if (sortBy === "nieuwste") {
      list.sort((a, b) => getStartMs(b) - getStartMs(a));
    } else if (sortBy === "oudste") {
      list.sort((a, b) => getStartMs(a) - getStartMs(b));
    } else if (sortBy === "locatie") {
      list.sort((a, b) => norm(getNaam(a)).localeCompare(norm(getNaam(b))));
    }

    return list;
  }, [veilingen, query, statusFilter, sortBy]);

  function toggleSelect(id) {
    setSelectedToDelete((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function selectAllVisible() {
    const ids = zichtbareVeilingen.map((v) => v.veiling_Id);
    setSelectedToDelete((prev) => {
      const allSelected = ids.every((id) => prev.includes(id));
      if (allSelected) {
        // deselect all visible
        return prev.filter((id) => !ids.includes(id));
      }
      // select all visible (plus keep any already selected outside visible)
      const merged = new Set([...prev, ...ids]);
      return Array.from(merged);
    });
  }

  function exitDeleteMode() {
    setDeleteMode(false);
    setSelectedToDelete([]);
  }

  // -----------------------------
  // DELETE (MEERDERE)
  // -----------------------------
  async function deleteSelected() {
    if (selectedToDelete.length === 0) {
      alert("Selecteer eerst veilingen om te verwijderen.");
      return;
    }

    const ok = confirm(
      `Weet je zeker dat je ${selectedToDelete.length} veiling(en) wilt verwijderen?`
    );
    if (!ok) return;

    setBusy(true);
    try {
      const token = localStorage.getItem("token");

      for (const id of selectedToDelete) {
        const res = await fetch(`${API_BASE}/Veilingen/${id}`, {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });

        if (!res.ok) {
          const txt = await res.text();
          console.error("Delete failed:", id, txt);
          alert(`Verwijderen mislukt voor veiling ${id}`);
          // ga verder met de rest (of return; als je liever stopt)
        }
      }

      // refresh
      await fetchVeilingen();
      exitDeleteMode();
    } finally {
      setBusy(false);
    }
  }

  // -----------------------------
  // UI
  // -----------------------------
  if (error) return <p className="error-text">{error}</p>;
  if (!gebruiker) return <p className="empty-text">Laden...</p>;

  return (
    <div className="veilingen-wrapper">
      <div className="veilingen-container">
        {/* HEADER ROW */}
        <div className="veilingen-header-row">
          <h1>Mijn Veilingen</h1>

          <div className="veilingen-header-actions">
            {!deleteMode ? (
              <>
                <button
                  className="delete-mode-btn"
                  onClick={() => setDeleteMode(true)}
                >
                  Verwijderen
                </button>

                <button
                  className="nieuwe-veiling-btn"
                  onClick={() => router.push("/dashboard/nieuwe-veiling")}
                >
                  + Nieuwe veiling
                </button>
              </>
            ) : (
              <>
                <button
                  className="delete-confirm-btn"
                  onClick={deleteSelected}
                  disabled={busy || selectedToDelete.length === 0}
                  style={{ opacity: busy ? 0.7 : 1 }}
                >
                  {busy
                    ? "Bezig..."
                    : `Verwijder (${selectedToDelete.length})`}
                </button>

                <button
                  className="delete-cancel-btn"
                  onClick={exitDeleteMode}
                  disabled={busy}
                  style={{ opacity: busy ? 0.7 : 1 }}
                >
                  Annuleren
                </button>
              </>
            )}
          </div>
        </div>

       {/* FILTERS */}
        <div className="veilingen-filter-row">
          <div className="veilingen-filter-left">
            <span className="veilingen-filter-label">Filter</span>

            <select
              className="veilingen-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={busy}
            >
              <option value="alle">Alle</option>
              <option value="wachten">Wachtend</option>
              <option value="actief">Actief</option>
              <option value="afgelopen">Afgelopen</option>
            </select>

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
                setStatusFilter("alle");
                setSortBy("nieuwste");
              }}
              disabled={busy}
              style={{ opacity: busy ? 0.7 : 1 }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* DELETE MODE BAR */}
        {deleteMode && (
          <div className="delete-bar">
           <button
            className="select-all-btn"
            onClick={selectAllVisible}
            disabled={busy || zichtbareVeilingen.length === 0}
          >
            {zichtbareVeilingen.every((v) =>
              selectedToDelete.includes(v.veiling_Id)
            )
              ? "Deselecteer alles (filter)"
              : "Selecteer alles (filter)"}
          </button>

            <div className="delete-hint">
              Klik op kaarten om te selecteren.
            </div>
          </div>
        )}

        {/* CONTENT */}
        {zichtbareVeilingen.length === 0 ? (
          <p className="empty-text">Geen veilingen gevonden.</p>
        ) : (
          <div className="veilingen-grid">
            {zichtbareVeilingen.map((v) => {
              const status = getStatus(v);
              const selected = selectedToDelete.includes(v.veiling_Id);

              const cardHeaderClass =
                status === "actief"
                  ? "header-actief"
                  : status === "afgelopen"
                  ? "header-afgelopen"
                  : "header-wachten";

              return deleteMode ? (
                <div
                  key={v.veiling_Id}
                  className={`veilingen-card veilingen-card--selectable ${
                    selected ? "is-selected" : ""
                  }`}
                  onClick={() => toggleSelect(v.veiling_Id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleSelect(v.veiling_Id);
                    }
                  }}
                >
                  <div className={`veilingen-card-header ${cardHeaderClass}`}>
                    {v.kloklocatie || "Veiling"}
                    <span className="select-indicator">
                      {selected ? "✓" : ""}
                    </span>
                  </div>

                  <div className="veilingen-card-content">
                    <h2>{v.kloklocatie || "Naamloze Veiling"}</h2>

                    <p className="tijd">
                      {v.startTijd ? new Date(v.startTijd).toLocaleString() : "-"}
                      <br />
                      {v.eindTijd ? new Date(v.eindTijd).toLocaleString() : "-"}
                    </p>

                    <span
                      className={`veilingen-status ${
                        status === "actief"
                          ? "status-actief"
                          : status === "afgelopen"
                          ? "status-afgelopen"
                          : "status-wachten"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              ) : (
                <Link
                  key={v.veiling_Id}
                  href={`/dashboard/${v.veiling_Id}`}
                  className="veilingen-card"
                >
                  <div className={`veilingen-card-header ${cardHeaderClass}`}>
                    {v.kloklocatie || "Veiling"}
                  </div>

                  <div className="veilingen-card-content">
                    <h2>{v.kloklocatie || "Naamloze Veiling"}</h2>

                    <p className="tijd">
                      {v.startTijd ? new Date(v.startTijd).toLocaleString() : "-"}
                      <br />
                      {v.eindTijd ? new Date(v.eindTijd).toLocaleString() : "-"}
                    </p>

                    <span
                      className={`veilingen-status ${
                        status === "actief"
                          ? "status-actief"
                          : status === "afgelopen"
                          ? "status-afgelopen"
                          : "status-wachten"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}