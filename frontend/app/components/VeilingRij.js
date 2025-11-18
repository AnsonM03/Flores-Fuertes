"use client";

export default function VeilingRij({ veiling, isSelected, onSelect, onDelete, rol }) {
  const startTijd = new Date(veiling.startTijd).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const eindTijd = new Date(veiling.eindTijd).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const status = veiling.status || "wachten";

  let statusClass = "veiling-status--wachten";
  let statusText = "Wachten";

  if (status === "actief") {
    statusClass = "veiling-status--actief";
    statusText = "Actief";
  } else if (status === "afgelopen") {
    statusClass = "veiling-status--afgelopen";
    statusText = "Afgelopen";
  }

  const rowClass = isSelected
    ? "veiling-row veiling-row--selected"
    : "veiling-row";

  return (
    <tr
      className={rowClass}
      onClick={() => onSelect && onSelect(veiling)}
    >
      <td>{veiling.product?.naam ?? "Geen naam"}</td>
      <td>
        {veiling.aanvoerder
          ? `${veiling.aanvoerder.voornaam} ${veiling.aanvoerder.achternaam}`
          : "Onbekend"}
      </td>
      <td>{startTijd}</td>
      <td>{eindTijd}</td>
      <td>€{veiling.veilingPrijs?.toFixed(2) ?? "0.00"}</td>
      <td>
        <span className={`veiling-status-badge ${statusClass}`}>
          {statusText}
        </span>
      </td>
      {rol === "veilingmeester" && (
        <td>
          {onDelete && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onDelete(veiling.veiling_Id || veiling.Veiling_Id || veiling.id);
              }}
            >
              Verwijderen
            </button>
          )}
        </td>
      )}
    </tr>
  );
}