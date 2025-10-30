import { useEffect, useRef, useState } from "react";

function KoperRij({ klant, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Sluit menu bij klik buiten de ref
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <tr className="hover:bg-blue-50 transition-colors relative">
      <td className="px-4 py-2 font-medium">
        {klant.voornaam} {klant.achternaam}
      </td>
      <td className="px-4 py-2">{klant.woonplaats ?? "Onbekend"}</td>
      <td className="px-4 py-2 text-right">
        <div className="relative" ref={menuRef}>
          {/* 3 puntjes knop */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="p-2 rounded hover:bg-gray-200 transition"
          >
            <span className="text-xl">⋮</span>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-md z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-red-100 text-red-600 text-sm rounded-t-md"
              >
                Verwijderen
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Bekijk info van ${klant.voornaam}`);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm rounded-b-md"
              >
                Bekijk info
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default KoperRij;