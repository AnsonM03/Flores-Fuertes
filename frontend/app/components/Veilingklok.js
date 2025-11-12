"use client";
import { useEffect, useState } from "react";

export default function VeilingKlok({ veiling }) {
  const [status, setStatus] = useState("wachten"); // wachten | actief | afgelopen
  const [resterend, setResterend] = useState(0);

  useEffect(() => {
    if (!veiling?.startTijd || !veiling?.eindTijd) return;

    const start = new Date(veiling.startTijd);
    const eind = new Date(veiling.eindTijd);

    function updateTijd() {
      const nu = new Date();

      if (nu < start) {
        setStatus("wachten");
        setResterend(Math.floor((start - nu) / 1000));
      } else if (nu >= start && nu < eind) {
        setStatus("actief");
        setResterend(Math.floor((eind - nu) / 1000));
      } else {
        setStatus("afgelopen");
        setResterend(0);
      }
    }

    updateTijd();
    const interval = setInterval(updateTijd, 1000);
    return () => clearInterval(interval);
  }, [veiling]);

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
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
      {/* Titel */}
      <h2 className="text-3xl font-bold text-gray-800 mb-2">🕒 Veilingklok</h2>

      {/* Countdown */}
      {status === "wachten" && (
        <div className="text-yellow-500 text-xl font-semibold animate-pulse">
          Start over {formatTime(resterend)}
        </div>
      )}

      {status === "actief" && (
        <div className="text-6xl font-extrabold text-green-600 drop-shadow-sm">
          {formatTime(resterend)}
        </div>
      )}

      {status === "afgelopen" && (
        <div className="text-red-600 text-xl font-semibold">
          Veiling afgelopen
        </div>
      )}

      {/* Info over veiling */}
      <div className="w-full bg-gray-50 rounded-lg border border-gray-200 p-4 text-gray-700 shadow-inner">
        <p className="text-lg font-semibold text-gray-800 mb-2">
          {veiling.product?.naam ?? "Onbekend product"}
        </p>

        {/* ✅ Aanvoerdernaam */}
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

          <span className="text-gray-500">Huidige prijs:</span>
          <span className="font-semibold text-green-700">
            €{veiling.veilingPrijs.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}