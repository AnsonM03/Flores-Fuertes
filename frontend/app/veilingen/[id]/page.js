"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VeilingKlok from "../../components/VeilingKlok";
import VeilingProductenLijst from "../../components/VeilingProductenLijst";

export default function VeilingDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [veiling, setVeiling] = useState(null);
  const [error, setError] = useState(null);

  const [gebruiker, setGebruiker] = useState(null);
  const [geselecteerdProduct, setGeselecteerdProduct] = useState(null);

  // Koop popup (Dutch auction)
  const [popupOpen, setPopupOpen] = useState(false);
  const [aantal, setAantal] = useState(1);
  const [koopPrijs, setKoopPrijs] = useState(null); // prijs uit de klok

  // Gebruiker laden
  useEffect(() => {
    const stored = localStorage.getItem("gebruiker");
    if (stored) setGebruiker(JSON.parse(stored));
  }, []);

  // Veiling laden
  useEffect(() => {
    async function fetchVeiling() {
      try {
        const res = await fetch(`http://localhost:5281/api/Veilingen/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setVeiling(data);
      } catch (err) {
        console.error(err);
        setError("Kon deze veiling niet ophalen.");
      }
    }

    fetchVeiling();
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!veiling) return <p className="text-gray-500">Veiling laden...</p>;

  const isAanvoerder =
    gebruiker?.gebruikerType?.toLowerCase() === "aanvoerder";

  // 🔹 wordt aangeroepen door VeilingKlok → “Koop nu”
  function handleKoopStart(huidigePrijsUitKlok) {
    if (!geselecteerdProduct) {
      alert("Selecteer eerst een product in de lijst.");
      return;
    }

    setKoopPrijs(huidigePrijsUitKlok);
    setPopupOpen(true);
  }

  // 🔥 Koop bevestigen
  async function handleKoopSubmit(e) {
    e.preventDefault();

    if (!geselecteerdProduct) return alert("Geen product geselecteerd.");
    if (!gebruiker) return alert("Je moet ingelogd zijn.");
    if (aantal <= 0) return alert("Aantal moet minstens 1 zijn.");
    if (aantal > geselecteerdProduct.hoeveelheid)
      return alert("Je kunt niet meer kopen dan de voorraad.");

    const totaalPrijs = (koopPrijs || 0) * aantal;
    const token = localStorage.getItem("token");

    const productId =
      geselecteerdProduct.product_Id ||
      geselecteerdProduct.Product_Id ||
      geselecteerdProduct.product_id;

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
          product_Id: productId,
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

      // Optioneel voorraad refreshen
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("❌ Serverfout.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-10">
      {/* TITEL */}
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        {veiling.titel}
      </h1>

      <p className="text-gray-600 mb-6 text-lg max-w-3xl">
        {veiling.omschrijving}
      </p>

      {/* ACTIEKNOPPEN */}
      <div className="mb-6 flex flex-wrap gap-4">
        {isAanvoerder && (
          <button
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => router.push(`/koppelen/${id}`)}
          >
            + Koppel product aan deze veiling
          </button>
        )}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mt-10">
        {/* LINKERKOLOM – Producten */}
        <section className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">
            Producten in deze veiling
          </h2>

          <VeilingProductenLijst
            veilingId={id}
            onSelect={(product) => setGeselecteerdProduct(product)}
          />
        </section>

        {/* RECHTERKOLOM – Veilingklok + geselecteerd product */}
        <section className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <VeilingKlok
            veiling={veiling}
            gebruikerRol={gebruiker?.gebruikerType?.toLowerCase()}
            onKoop={handleKoopStart}
          />

          {geselecteerdProduct && (
            <div className="mt-6 p-5 bg-white rounded-xl shadow-md">
              <h3 className="text-lg font-bold mb-3 text-gray-800">
                Geselecteerd product
              </h3>

              {geselecteerdProduct.foto ? (
                <img
                  src={geselecteerdProduct.foto}
                  alt={geselecteerdProduct.naam}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                  Geen foto beschikbaar
                </div>
              )}

              <p>
                <strong>Naam:</strong> {geselecteerdProduct.naam}
              </p>
              <p>
                <strong>Kenmerken:</strong>{" "}
                {geselecteerdProduct.artikelKenmerken}
              </p>
              <p>
                <strong>Hoeveelheid:</strong>{" "}
                {geselecteerdProduct.hoeveelheid}
              </p>
              <p>
                <strong>Startprijs:</strong> €
                {geselecteerdProduct.startPrijs ?? geselecteerdProduct.prijs}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* 🟢 KOOP POPUP */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Koop {geselecteerdProduct?.naam}
            </h2>

            <form onSubmit={handleKoopSubmit} className="space-y-4">
              {/* Aantal */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Aantal
                </label>
                <input
                  type="number"
                  min="1"
                  max={geselecteerdProduct?.hoeveelheid}
                  value={aantal}
                  onChange={(e) => setAantal(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500">
                  Voorraad: {geselecteerdProduct?.hoeveelheid}
                </p>
              </div>

              {/* Prijs per stuk */}
              <p className="text-sm">
                Prijs per stuk:{" "}
                <strong>€{koopPrijs ? koopPrijs.toFixed(2) : "0.00"}</strong>
              </p>

              {/* Totaal */}
              <p className="text-md">
                Totaal:{" "}
                <strong>
                  €
                  {((koopPrijs || 0) * (aantal || 0)).toFixed(2)}
                </strong>
              </p>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-lg"
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
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