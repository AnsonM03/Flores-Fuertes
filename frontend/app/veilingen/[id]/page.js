"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VeilingKlok from "../../components/VeilingKlok";
import VeilingProductenLijst from "../../components/VeilingProductenLijst";
import * as signalR from "@microsoft/signalr";
import "../../styles/veiling-detail.css";

export default function VeilingDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [veiling, setVeiling] = useState(null);
  const [error, setError] = useState(null);

  const [gebruiker, setGebruiker] = useState(null);
  const rol = gebruiker?.gebruikerType?.toLowerCase();

  // Geselecteerd = VeilingProduct (koppeling)
  const [geselecteerdProduct, setGeselecteerdProduct] = useState(null);

  // Koop popup
  const [popupOpen, setPopupOpen] = useState(false);
  const [aantal, setAantal] = useState(1);
  const [koopPrijs, setKoopPrijs] = useState(null);

  // -------------------------
  // Gebruiker laden
  // -------------------------
  useEffect(() => {
    const stored = localStorage.getItem("gebruiker");
    if (stored) setGebruiker(JSON.parse(stored));
  }, []);

  // -------------------------
  // Veiling laden
  // -------------------------
  useEffect(() => {
    let cancelled = false;

    async function fetchVeiling() {
      try {
        const res = await fetch(`http://localhost:5281/api/Veilingen/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setVeiling(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Kon deze veiling niet ophalen.");
      }
    }

    fetchVeiling();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // -------------------------
  // SignalR (updates)
  // -------------------------
  useEffect(() => {
    if (!veiling?.veiling_Id) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5281/hubs/auction")
      .withAutomaticReconnect()
      .build();

    conn.on("VeilingGestart", (veilingId, startTijd, eindTijd) => {
      if (veilingId !== veiling.veiling_Id) return;
      setVeiling((prev) => (prev ? { ...prev, startTijd, eindTijd } : prev));
    });

    conn.on("ProductGekocht", (veilingId, productId, nieuweHoeveelheid) => {
      if (veilingId !== veiling.veiling_Id) return;

      // update lijst in veiling (als die aanwezig is)
      setVeiling((prev) => ({
        ...prev,
        veilingProducten: (prev?.veilingProducten || []).map((vp) => {
          const vpProductId =
            vp.product_Id || vp.Product_Id || vp.product?.product_Id || vp.product?.Product_Id;
          return vpProductId === productId
            ? { ...vp, hoeveelheid: nieuweHoeveelheid }
            : vp;
        }),
      }));

      // update geselecteerd product
      setGeselecteerdProduct((prevVp) => {
        if (!prevVp) return prevVp;
        const prevId =
          prevVp.product_Id || prevVp.Product_Id || prevVp.product?.product_Id || prevVp.product?.Product_Id;
        return prevId === productId
          ? { ...prevVp, hoeveelheid: nieuweHoeveelheid }
          : prevVp;
      });
    });

    conn
      .start()
      .then(() => console.log("✅ SignalR verbonden"))
      .catch((err) => console.error("SignalR error:", err));

    return () => {
      conn.stop();
    };
  }, [veiling?.veiling_Id]);

  // -------------------------
  // Helpers (VeilingProduct-safe)
  // -------------------------
  const productInfo = useMemo(() => {
    const voorraad =
      geselecteerdProduct?.hoeveelheid ??
      geselecteerdProduct?.Hoeveelheid ??
      0;

    const productId =
      geselecteerdProduct?.product_Id ||
      geselecteerdProduct?.Product_Id ||
      geselecteerdProduct?.product?.product_Id ||
      geselecteerdProduct?.product?.Product_Id;

    const naam =
      geselecteerdProduct?.product?.naam ||
      geselecteerdProduct?.naam ||
      "Product";

    const kenmerken =
      geselecteerdProduct?.product?.artikelKenmerken ||
      geselecteerdProduct?.artikelKenmerken ||
      "-";

    const foto =
      geselecteerdProduct?.product?.foto ||
      geselecteerdProduct?.foto ||
      null;

    const startPrijs =
      geselecteerdProduct?.prijs ??
      geselecteerdProduct?.Prijs ??
      geselecteerdProduct?.product?.startPrijs ??
      geselecteerdProduct?.product?.StartPrijs ??
      0;

    return { voorraad, productId, naam, kenmerken, foto, startPrijs };
  }, [geselecteerdProduct]);

  // -------------------------
  // Koop flow
  // -------------------------
  function handleKoopStart(huidigePrijsUitKlok) {
    if (!geselecteerdProduct) {
      alert("Selecteer eerst een product in de lijst.");
      return;
    }
    setKoopPrijs(huidigePrijsUitKlok);
    setPopupOpen(true);
  }

  async function handleKoopSubmit(e) {
    e.preventDefault();

    if (!geselecteerdProduct) return alert("Geen product geselecteerd.");
    if (!gebruiker) return alert("Je moet ingelogd zijn.");

    if (aantal <= 0) return alert("Aantal moet minstens 1 zijn.");
    if (aantal > productInfo.voorraad) {
      return alert("Je kunt niet meer kopen dan de voorraad.");
    }

    const totaalPrijs = (koopPrijs || 0) * aantal;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5281/api/Biedingen/koop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          prijsPerStuk: koopPrijs,
          aantal,
          totaal: totaalPrijs,
          klant_Id: gebruiker.gebruiker_Id,
          product_Id: productInfo.productId,
          veiling_Id: veiling.veiling_Id,
        }),
      });

      if (!res.ok) {
        console.error(await res.text());
        return alert("❌ Aankoop mislukt.");
      }

      alert(`🎉 Je hebt gekocht voor €${totaalPrijs.toFixed(2)}!`);

      setPopupOpen(false);
      setAantal(1);
      setKoopPrijs(null);

      // simpele refresh
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("❌ Serverfout.");
    }
  }

  // -------------------------
  // UI guards
  // -------------------------
  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            ← Terug
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!veiling) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            Veiling laden…
          </div>
        </div>
      </main>
    );
  }

  const status = (veiling.status || "wachtend").toLowerCase();
  const statusBadge =
    status === "actief"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "afgelopen"
      ? "bg-slate-100 text-slate-700 border-slate-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              ← Terug
            </button>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {veiling.titel || "Veiling"}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${statusBadge}`}
              >
                {status}
              </span>

              {rol && (
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700">
                  Rol: {rol}
                </span>
              )}
            </div>
          </div>

          {/* Right header actions */}
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {/* LINKS: Productenlijst */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                Producten in deze veiling
              </h2>
              <span className="text-sm text-slate-500">Selecteer een product</span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <VeilingProductenLijst
                veilingId={id}
                onSelect={(vp) => setGeselecteerdProduct(vp)}
              />
            </div>
          </section>

          {/* RECHTS: Klok + details */}
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <VeilingKlok
                veiling={veiling}
                gebruikerRol={rol}
                onKoop={handleKoopStart}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                Geselecteerd product
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Klik links een product om details te zien.
              </p>

              {!geselecteerdProduct ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-600">
                  Nog geen product geselecteerd.
                </div>
              ) : (
                <div className="mt-4">
                  {productInfo.foto ? (
                    <img
                      src={productInfo.foto}
                      alt={productInfo.naam}
                      className="h-56 w-full rounded-xl object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      Geen foto beschikbaar
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-slate-500">Naam</div>
                      <div className="font-semibold text-slate-900">
                        {productInfo.naam}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-slate-500">Voorraad</div>
                      <div className="font-semibold text-slate-900">
                        {productInfo.voorraad}
                      </div>
                    </div>

                    <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                      <div className="text-slate-500">Kenmerken</div>
                      <div className="font-semibold text-slate-900">
                        {productInfo.kenmerken}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-slate-500">Startprijs</div>
                      <div className="font-semibold text-slate-900">
                        €{Number(productInfo.startPrijs || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-slate-500">ProductId</div>
                      <div className="truncate font-mono text-xs text-slate-700">
                        {productInfo.productId || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* POPUP */}
      {popupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Koop {productInfo.naam}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Kies je aantal en bevestig je aankoop.
                </p>
              </div>

              <button
                onClick={() => {
                  setPopupOpen(false);
                  setAantal(1);
                  setKoopPrijs(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-slate-700 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleKoopSubmit} className="mt-5 space-y-5">
              <div className="rounded-xl bg-slate-50 p-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Aantal
                </label>
                <input
                  type="number"
                  min="1"
                  max={productInfo.voorraad}
                  value={aantal}
                  onChange={(e) => setAantal(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="mt-2 text-xs text-slate-500">
                  Voorraad: <span className="font-semibold">{productInfo.voorraad}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>Prijs per stuk</span>
                  <span className="font-bold text-slate-900">
                    €{koopPrijs ? koopPrijs.toFixed(2) : "0.00"}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-lg font-extrabold">
                  <span>Totaal</span>
                  <span className="text-slate-900">
                    €{((koopPrijs || 0) * (aantal || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setPopupOpen(false);
                    setAantal(1);
                    setKoopPrijs(null);
                  }}
                >
                  Annuleren
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow hover:bg-emerald-700"
                >
                  Bevestig aankoop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}