"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [veilingen, setVeilingen] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVeilingenMetAanvoerders() {
      try {
        const res = await fetch("http://localhost:5281/api/Veilingen");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // ✅ Haal aanvoerder info op per veiling
        const updated = await Promise.all(
          data.map(async (v) => {
            const aanvoerderId = v.product?.aanvoerder_Id;
            if (!aanvoerderId) return v;

            try {
              const r2 = await fetch(`http://localhost:5281/api/Aanvoerders/${aanvoerderId}`);
              if (!r2.ok) return v;
              const aanvoerder = await r2.json();
              return { ...v, aanvoerder }; // ✅ naam bij veiling plakken
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

  return (
    <div className="grid grid-cols-[50%_50%] h-screen bg-gray-100 p-3 gap-3 font-sans">
      <div className="grid grid-rows-[1fr_1fr] gap-3">

        <div className="bg-white border border-gray-300 p-3 rounded-md overflow-auto text-sm">
          <h2 className="font-semibold text-lg mb-2">Aankomende Veilingen</h2>

          {error && <p className="text-red-600">{error}</p>}
          {!error && veilingen.length === 0 && <p>Laden...</p>}

          <ul className="space-y-1">
            {veilingen.map(v => (
              <li
                key={v.veiling_Id}
                className="p-2 bg-gray-200 rounded-md border border-gray-300 hover:bg-gray-300 cursor-pointer"
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

        <div className="bg-white border border-gray-300 p-3 rounded-md overflow-auto text-sm">
          <h2 className="font-semibold text-lg mb-2">Kopers die bieden</h2>
          <p>API nog niet aangesloten</p>
        </div>

      </div>

      <div className="bg-white border border-gray-300 rounded-md flex items-center justify-center">
        <h2 className="text-xl font-bold text-gray-600">Veilingklok komt hier</h2>
      </div>
    </div>
  );
}