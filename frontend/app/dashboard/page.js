"use client";
import { useEffect, useState } from "react";
import VeilingKlok from "../components/Veilingklok";
import KoperRij from "../components/Koperrij";

export default function Dashboard() {
  const [veilingen, setVeilingen] = useState([]);
  const [selectedVeiling, setSelectedVeiling] = useState(null);
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
        if (updated.length > 0) setSelectedVeiling(updated[0]);
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


async function handleKlantVerwijderen(klantId) {
  if (!confirm("Weet je zeker dat je deze koper wilt verwijderen?")) return;

  try {
    const res = await fetch(`http://localhost:5281/api/Klanten/${klantId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    setKlanten((prev) => prev.filter((k) => k.klant_Id !== klantId));
    alert("🗑️ Koper succesvol verwijderd");
  } catch (err) {
    console.error("❌ Fout bij verwijderen van koper:", err);
    alert("Er ging iets mis bij het verwijderen van de koper");
  }
}

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
      setSelectedVeiling(data);
      alert(`✅ Nieuwe veiling aangemaakt in ${randomLocatie} — €${randomPrijs}`);
    } catch (err) {
      console.error("Kon willekeurige veiling niet aanmaken:", err);
      alert("❌ Er ging iets mis bij het aanmaken van de veiling");
    }
  }

useEffect(() => {
  const interval = setInterval(() => {
    const nu = new Date();
    setVeilingen((prev) =>
      prev.map((v) => {
        const eind = new Date(v.eindTijd);
        let status = v.status;

        if (nu < eind && nu >= new Date(v.startTijd)) {
          status = "actief";
        } else if (nu >= eind) {
          status = "afgelopen";
        } else {
          status = "wachten";
        }

        return { ...v, status };
      })
    );
  }, 1000);

  return () => clearInterval(interval);
}, []);


/////////////////////////////////

return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          {/* --- VEILINGEN --- */}
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
                        onClick={() => setSelectedVeiling(v)}
                        className={`cursor-pointer transition-colors ${
                          selectedVeiling?.veiling_Id === v.veiling_Id
                            ? "bg-blue-100"
                            : "hover:bg-blue-50"
                        }`}
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
                        <td className="px-4 py-2 text-right font-semibold text-gray-800 flex justify-end items-center gap-2">
                          <span>€{v.veilingPrijs.toFixed(2)}</span>
                          {v.status === "actief" && (
                            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                              Actief
                            </span>
                          )}
                          {v.status === "wachten" && (
                            <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded">
                              Wachten
                            </span>
                          )}
                          {v.status === "afgelopen" && (
                            <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">
                              Afgelopen
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* --- KOPERS --- */}
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
                      <th className="px-4 py-2 text-right">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {klanten.map((k) => (
                      <KoperRij
                        key={k.gebruiker_Id}
                        klant={k}
                        onDelete={() => handleKlantVerwijderen(k.gebruiker_Id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* --- VEILINGKLOK --- */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl flex flex-col items-center justify-center p-6">
          {selectedVeiling ? (
            <VeilingKlok veiling={selectedVeiling} />
          ) : (
            <p className="text-gray-500 italic">Geen actieve veilingen</p>
          )}
        </div>
      </div>
    </div>
  );
}