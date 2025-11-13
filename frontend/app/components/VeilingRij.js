"use client";
import { useState, useEffect} from "react";

export default function VeilingRij({ veiling, isSelected, onSelect, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
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
    <tr
      onClick={() => onSelect(veiling)}
      className={`cursor-pointer transition-colors ${
        isSelected ? "bg-blue-100" : "hover:bg-blue-50"
      }`}
    >
      <td className="px-4 py-2 font-medium">{veiling.product?.naam ?? "Geen naam"}</td>
      <td className="px-4 py-2">
        {veiling.aanvoerder
          ? `${veiling.aanvoerder.voornaam} ${veiling.aanvoerder.achternaam}`
          : "Aanvoerder laden..."}
      </td>
      <td className="px-4 py-2">
        {new Date(veiling.startTijd).toLocaleTimeString("nl-NL", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-2">
        {new Date(veiling.eindTijd).toLocaleTimeString("nl-NL", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-2 text-right font-semibold text-gray-800 flex justify-end items-center gap-2 relative">
        <span>€{veiling.veilingPrijs.toFixed(2)}</span>

        {veiling.status === "actief" && (
          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
            Actief
          </span>
        )}
        {veiling.status === "wachten" && (
          <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded">
            Wachten
          </span>
        )}
        {veiling.status === "afgelopen" && (
          <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">
            Afgelopen
          </span>
        )}


        {/* --- Alleen veilingmeester ziet dit menu --- */}
        {rol?.toLowerCase === "veilingmeester" && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="text-gray-500 hover:text-gray-800 px-2"
            >
              ⋯
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-md rounded-md text-sm z-10 min-w-[120px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(veiling.veiling_Id);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  Verwijderen
                </button>
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}