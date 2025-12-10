"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VeilingProductenLijst from "../../components/VeilingProductenLijst";
//import VeilingKlok from "../../components/VeilingKlok";

export default function VeilingDetailPage() {
  const { id } = useParams();
  const [veiling, setVeiling] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [gebruiker, setGebruiker] = useState(null);

  // Gebruiker Laden
  useEffect(() => {
    const stored = localStorage.getItem("gebruiker");
    if (stored) setGebruiker(JSON.parse(stored));
  }, []);

  // Veiling Laden
  useEffect(() => {
    async function fetchVeiling() {
      try {
        const res = await fetch(`http://localhost:5281/api/Veilingen/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setVeiling(data);
      } catch (err) {
        setError("Kon deze veiling niet ophalen.");
      }
    }

    fetchVeiling();
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!veiling) return <p className="text-gray-500">Veiling laden...</p>;

  const isAanvoerder = gebruiker?.gebruikerType?.toLowerCase() === "aanvoerder";
  const isKlant = gebruiker?.gebruikerType?.toLowerCase() === "klant";

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-10">

      {/* TITEL BOVEN */}
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
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            onClick={() => router.push(`/koppelen/${id}`)}
          >
            + Koppel product aan deze veiling
          </button>
        )}

        {isKlant && (
          <button
            className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
            onClick={() => alert("Bieding-popup komt nog")}
          >
            + Maak een bieding
          </button>
        )}
      </div>

      {/* PRODUCTEN LINKS / KLOK RECHTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mt-10">

        {/* PRODUCTEN (links) */}
        <section className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">
            Producten in deze veiling
          </h2>
          <VeilingProductenLijst veilingId={id} />
        </section>

        {/* KLOK (rechts) */}
        <section className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
          <VeilingKlok
            veiling={veiling}
            gebruikerRol={gebruiker?.gebruikerType?.toLowerCase()}
            onBod={(veilingId, prijs) => {
              alert(`Je hebt gekocht voor €${prijs}`);
            }}
          />
        </section>

      </div>

    </main>
  );
}