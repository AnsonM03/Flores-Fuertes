"use client";
import VeilingRij from "./VeilingRij";
import { useState, useEffect} from "react";

export default function VeilingenLijst({ veilingen, error, selectedVeiling, onSelect, onDelete, onAdd }) {
    const [rol, setRol] = useState(null);

    // Haal rol op uit localStorage
      useEffect(() => {
        const stored = localStorage.getItem("gebruiker");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setRol(parsed.rol?.toLowerCase());
          } catch {
            console.error("Kon gebruiker niet parsen uit localStorage");
          }
        }
      }, []);
  

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Aankomende Veilingen</h2>
        {rol === "Veilingmeester" && (
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition"
        >
          + Nieuwe Veiling
        </button>
        )}
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
                <VeilingRij
                  key={v.veiling_Id}
                  veiling={v}
                  isSelected={selectedVeiling?.veiling_Id === v.veiling_Id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}