"use client";

import { useEffect, useRef, useState } from "react";

function KoperRij({ klant, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
    <tr className="koper-row">
      <td>
        {klant.voornaam} {klant.achternaam}
      </td>
      <td>{klant.woonplaats ?? "Onbekend"}</td>
      <td className="koper-actions">
        <div ref={menuRef}>
          <button
            type="button"
            className="koper-menu-btn"
            onClick={e => {
              e.stopPropagation();
              setMenuOpen(prev => !prev);
            }}
          >
            ⋮
          </button>

          {menuOpen && (
            <div className="koper-menu">
              {onDelete && (
                <button
                  type="button"
                  className="koper-menu-delete"
                  onClick={e => {
                    e.stopPropagation();
                    onDelete();
                    setMenuOpen(false);
                  }}
                >
                  Verwijderen
                </button>
              )}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  alert(`Bekijk info van ${klant.voornaam}`);
                  setMenuOpen(false);
                }}
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