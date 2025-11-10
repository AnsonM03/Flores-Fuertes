"use client";
import { useEffect, useState } from "react";

export default function VeilingKlok({ veiling }) {
  const [status, setStatus] = useState("wachten"); // wachten | actief | afgelopen
  const [huidigePrijs, setHuidigePrijs] = useState(veiling?.veilingPrijs || 100);

  // Instellingen
  const minimumPrijs = 5; // waar de prijs stopt

  useEffect(() => {
    if (!veiling?.startTijd || !veiling?.eindTijd) return;

    const start = new Date(veiling.startTijd);
    const eind = new Date(veiling.eindTijd);

    const totaleSeconden = Math.max((eind - start) / 1000, 1);
    const startPrijs = veiling.veilingPrijs;
    const dalingPerSeconde = (startPrijs - minimumPrijs) / totaleSeconden;

    function updatePrijs() {
      const nu = new Date();

      if (nu < start) {
        setStatus("wachten");
        setHuidigePrijs(startPrijs);
      } else if (nu >= start && nu < eind) {
        setStatus("actief");
        const verstreken = (nu - start) / 1000;
        const nieuwePrijs = Math.max(startPrijs - verstreken * dalingPerSeconde, minimumPrijs);
        setHuidigePrijs(nieuwePrijs);
      } else {
        setStatus("afgelopen");
        setHuidigePrijs(minimumPrijs);
      }
    }

    updatePrijs();
    const interval = setInterval(updatePrijs, 1000);
    return () => clearInterval(interval);
  }, [veiling]);

  function handleKoopNu() {
    if (status !== "actief") return;
    setStatus("afgelopen");
    alert(`🛒 Product verkocht voor €${huidigePrijs.toFixed(2)}!`);
  }

  if (!veiling) return <p className="text-gray-500">Geen actieve veiling</p>;

  const start = new Date(veiling.startTijd).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const eind = new Date(veiling.eindTijd).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Klokveiling</h2>

      {/* Prijsweergave */}
      {status === "wachten" && (
        <div className="text-yellow-500 text-lg font-semibold animate-pulse">
          Veiling start om {start}
        </div>
      )}

      {status === "actief" && (
        <div className="text-6xl font-extrabold text-green-600 drop-shadow-sm transition-all duration-500">
          €{huidigePrijs.toFixed(2)}
        </div>
      )}

      {status === "afgelopen" && (
        <div className="text-red-600 text-xl font-semibold">
          Veiling afgelopen
        </div>
      )}

      {/* Veiling info */}
      <div className="w-full bg-gray-50 rounded-lg border border-gray-200 p-4 text-gray-700 shadow-inner">
        <p className="text-lg font-semibold text-gray-800 mb-2">
          {veiling.product?.naam ?? "Onbekend product"}
        </p>

        <p className="text-sm text-gray-600 mb-4">
          Aanvoerder:{" "}
          <span className="font-medium text-gray-800">
            {veiling.aanvoerder
              ? `${veiling.aanvoerder.voornaam} ${veiling.aanvoerder.achternaam}`
              : "Onbekend"}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-500">Starttijd:</span>
          <span className="font-medium">{start}</span>

          <span className="text-gray-500">Eindtijd:</span>
          <span className="font-medium">{eind}</span>

          <span className="text-gray-500">Minimale prijs:</span>
          <span className="font-semibold text-gray-800">€{minimumPrijs}</span>
        </div>
      </div>

      {/* Koopknop */}
      <button
        onClick={handleKoopNu}
        disabled={status !== "actief"}
        className={`px-6 py-2 rounded-md text-white text-lg font-semibold transition ${
          status === "actief"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {status === "actief" ? "Koop nu" : "Verkocht"}
      </button>
    </div>
  );
}