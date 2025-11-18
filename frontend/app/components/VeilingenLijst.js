"use client";

import VeilingRij from "./VeilingRij";

export default function VeilingenLijst({
  veilingen,
  error,
  selectedVeiling,
  onSelect,
  onDelete,
  rol,
}) {
  if (error) {
    return <p className="veiling-message">{error}</p>;
  }

  if (!error && veilingen.length === 0) {
    return <p className="veiling-message">Geen veilingen gevonden...</p>;
  }

  return (
    <div className="veiling-table-wrapper" role="region" aria-label="Lijst van veilingen">
      <table className="veiling-table">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Aanvoerder</th>
            <th scope="col">Start</th>
            <th scope="col">Einde</th>
            <th scope="col">Prijs (€)</th>
            <th scope="col">Status</th>
            {rol === "veilingmeester" && <th scope="col" aria-label="Acties" />}
          </tr>
        </thead>
        <tbody>
          {veilingen.map(v => {
            const id = v.veiling_Id || v.Veiling_Id || v.id;
            const selectedId =
              selectedVeiling?.veiling_Id || selectedVeiling?.Veiling_Id || selectedVeiling?.id;

            return (
              <VeilingRij
                key={id}
                veiling={v}
                isSelected={id === selectedId}
                onSelect={onSelect}
                onDelete={onDelete}
                rol={rol}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}