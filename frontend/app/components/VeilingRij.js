"use client";
export default function VeilingRij({ veiling, isSelected, onSelect, onDelete }) {
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

        <div className="relative group">
          <button onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-gray-800 px-2">
            ⋯
          </button>
          <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white border border-gray-200 shadow-md rounded-md text-sm z-10 min-w-[120px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(veiling.veiling_Id);
              }}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
            >
              Verwijderen
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}