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

  async function maakRandomVeiling() {
    try {
      const start = new Date();
      const eind = new Date(start.getTime() + (Math.random() * 10 + 5) * 60 * 1000);
      const randomPrijs = Math.floor(Math.random() * 100) + 20;
      const locaties = ["Aalsmeer", "Almere", "Rijnsburg", "Naaldwijk"];
      const randomLocatie = locaties[Math.floor(Math.random() * locaties.length)];

      const nieuweVeiling = {
        veilingPrijs: randomPrijs,
        veilingDatum: new Date().toISOString().split("T")[0],
        startTijd: start.toISOString(),
        eindTijd: eind.toISOString(),
        kloklocatie: randomLocatie,
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
      setVeilingen((prev) => [data, ...prev]);
      alert(`✅ Nieuwe veiling aangemaakt in ${randomLocatie} — €${randomPrijs}`);
    } catch (err) {
      console.error("Kon willekeurige veiling niet aanmaken:", err);
      alert("❌ Er ging iets mis bij het aanmaken van de veiling");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Aankomende Veilingen</h2>
              <button
                onClick={maakRandomVeiling}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
              >
                + Nieuwe Veiling
              </button>
            </div>

            {error && <p className="text-red-600">{error}</p>}
            {!error && veilingen.length === 0 && (
              <p className="text-gray-500 italic">Geen veilingen gevonden...</p>
            )}

            {veilingen.length > 0 && (
              <div className="overflow-auto rounded-md border border-gray-200">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2">Aanvoerder</th>
                      <th className="px-4 py-2">Start</th>
                      <th className="px-4 py-2">Einde</th>
                      <th className="px-4 py-2 text-right">Prijs (€)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {veilingen.map((v) => (
                      <tr
                        key={v.veiling_Id}
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-2 font-medium">{v.product?.naam ?? "Geen naam"}</td>
                        <td className="px-4 py-2">
                          {v.aanvoerder
                            ? `${v.aanvoerder.voornaam} ${v.aanvoerder.achternaam}`
                            : "Aanvoerder laden..."}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(v.startTijd).toLocaleTimeString("nl-NL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(v.eindTijd).toLocaleTimeString("nl-NL", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-gray-800">
                          €{v.veilingPrijs.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sectie: Kopers */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Kopers</h2>

            {klanten.length === 0 ? (
              <p className="text-gray-500 italic">Kopers worden geladen...</p>
            ) : (
              <div className="overflow-auto rounded-md border border-gray-200">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-2">Naam</th>
                      <th className="px-4 py-2">Woonplaats</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {klanten.map((k) => (
                      <tr
                        key={k.klant_Id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-4 py-2 font-medium">
                          {k.voornaam} {k.achternaam}
                        </td>
                        <td className="px-4 py-2">{k.woonplaats ?? "Onbekend"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-xl flex flex-col items-center justify-center p-6">
          {veilingen.length > 0 ? (
            <VeilingKlok veiling={veilingen[0]} />
          ) : (
            <p className="text-gray-500 italic">Geen veilingen beschikbaar</p>
          )}
        </div>
      </div>
    </div>
  );
}