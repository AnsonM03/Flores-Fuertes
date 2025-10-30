"use client";
import { useEffect, useState } from "react";
import VeilingKlok from "../components/Veilingklok";

export default function Dashboard() {
  const [veilingen, setVeilingen] = useState([]);
  const [error, setError] = useState(null);
  const [klanten, setKlanten] = useState([]);

  useEffect(() => {
    async function fetchVeilingenMetAanvoerders() {
      try {
        const res = await fetch("http://localhost:5281/api/Veilingen");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const updated = await Promise.all(
          data.map(async (v) => {
            const aanvoerderId = v.product?.aanvoerder_Id;
            if (!aanvoerderId) return v;

            try {
              const r2 = await fetch(`http://localhost:5281/api/Aanvoerders/${aanvoerderId}`);
              if (!r2.ok) return v;
              const aanvoerder = await r2.json();
              return { ...v, aanvoerder };
            } catch {
              return v;
            }
          })
        );

        setVeilingen(updated);
      } catch (err) {
        console.error(err);
        setError("Kon veilingen niet ophalen");
      }
    }

    fetchVeilingenMetAanvoerders();
  }, []);

  useEffect(() => {
    async function fetchKlanten() {
      try {
        const res = await fetch("http://localhost:5281/api/Klanten");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setKlanten(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchKlanten();
  }, []);

  async function maakTestVeiling() {
  try {
    const start = new Date();
    const eind = new Date(start.getTime() + 10 * 60 * 1000); // +5 minuten

    const nieuweVeiling = {
      veilingPrijs: Math.floor(Math.random() * 100) + 50,
      veilingDatum: new Date().toISOString().split("T")[0], // yyyy-MM-dd
      startTijd: start.toISOString(),
      eindTijd: eind.toISOString(),
      kloklocatie: "Almere",
      status: "open",
      product_Id: "ce01670c-bc94-4dc3-8864-ddb756996006",
      veilingmeester_Id: "47fea64c-55e4-4a68-a89f-90bee7e2ec23",
    };

    const res = await fetch("http://localhost:5281/api/Veilingen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nieuweVeiling),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    alert("✅ Nieuwe testveiling aangemaakt!");

    // Voeg de nieuwe veiling toe bovenaan
    setVeilingen((prev) => [data, ...prev]);
  } catch (err) {
    console.error("Kon testveiling niet aanmaken:", err);
  }
}

  return (
    <div className="grid grid-cols-2 h-screen bg-gray-100 p-3 gap-3 font-sans">
      <div className="flex flex-col gap-80">

        <div className="bg-white border border-gray-300 p-3 rounded-md overflow-auto text-sm h-48">
          <h2 className="font-semibold text-lg mb-2 text-black">Aankomende Veilingen</h2>

          <button
            onClick={maakTestVeiling}
            className="bg-blue-500 text-white px-3 py-1 my-2 rounded hover:bg-blue-600"
          >
            + Testveiling
          </button>

          {error && <p className="text-red-600">{error}</p>}
          {!error && veilingen.length === 0 && <p className="text-black">Laden...</p>}

          <ul className="space-y-1">
            {veilingen.map(v => (
              <li
                key={v.veiling_Id}
                className="p-2 bg-gray-200 rounded-md border border-gray-300 hover:bg-gray-300 cursor-pointer text-black"
              >
                {/* ✅ Productnaam */}
                <strong>{v.product?.naam ?? "Geen productnaam"}</strong>

                {/* ✅ Aanvoerder naam */}
                — {v.aanvoerder
                    ? `${v.aanvoerder.voornaam} ${v.aanvoerder.achternaam}`
                    : "Aanvoerder laden..."}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-gray-300 p-3 rounded-md overflow-auto text-sm h-48">
          <h2 className="font-semibold text-lg mb-2 text-black">Kopers</h2>

          {klanten.length === 0 ? ( <p className="text-black">Laden...</p>) : (<ul className="space-y-1">
            {klanten.map(k => (<li key={k.klant_Id} className="p-2 bg-gray-200 rounded-md border border-gray-300 text-black">
              {k.voornaam} {k.achternaam}
            </li>
          ))}
          </ul>
        )}
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-md flex items-center justify-center">
        {veilingen.length > 0 ? (
          <VeilingKlok veiling={veilingen[0]} />
        ) : (
          <p className="text-gray-500">Geen veilingen beschikbaar</p>
        )}
      </div>
    </div>
  );
}