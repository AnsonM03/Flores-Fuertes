"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VeilingProductenLijst from "../../components/VeilingProductenLijst";
// import VeilingKlok from "../components/VeilingKlok";

export default function VeilingDetailPage() {
  const { id } = useParams();
  const [veiling, setVeiling] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();


  const [gebruiker, setGebruiker] = useState(null);

  // Gebruiker ophalen (voor rol)
  useEffect(() => {
    const stored = localStorage.getItem("gebruiker");
    if (stored) setGebruiker(JSON.parse(stored));
  }, []);


  // Veiling ophalen
  useEffect(() => {
    async function fetchVeiling() {
      try {
        const res = await fetch(`http://localhost:5281/api/Veilingen/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setVeiling(data);
      } catch (err) {
        console.error("❌ Fout bij ophalen veiling:", err);
        setError("Kon deze veiling niet ophalen.");
      }
    }

    fetchVeiling();
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!veiling) return <p className="text-gray-500">Veiling laden...</p>;

  const isAanvoerder = gebruiker?.gebruikerType?.toLowerCase() === "aanvoerder";

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-6 border border-gray-100">

        {/* Titel + omschrijving */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{veiling.titel}</h1>
        <p className="text-gray-600 mb-8">{veiling.omschrijving}</p>

        {/* Koppel product knop (alleen aanvoerder) */}
        {isAanvoerder && (
          <div className="mb-6">
            <button
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              onClick={() => router.push(`/koppelen/${id}`)}
            >
              + Koppel product aan deze veiling
            </button>
          </div>
        )}

        {/* VEILINGKLOK */}
        {/* <div className="mb-10">
          <VeilingKlok
            veiling={veiling}
            gebruikerRol={gebruiker?.gebruikerType?.toLowerCase()}
            onBod={(veilingId, prijs) => {
              console.log("Bod geplaatst:", prijs, "op", veilingId);
              alert(`Je hebt gekocht voor €${prijs}`);
            }}
          />
        </div> */}

        {/* Productenlijst */}
        <h2 className="text-xl font-semibold mb-4">Producten in deze veiling</h2>
        <VeilingProductenLijst veilingId={id} />

      </div>
    </main>
  );
}