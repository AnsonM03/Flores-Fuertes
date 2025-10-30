import { useEffect, useState } from "react";

export default function VeilingKlok({ veiling }) {
  const [status, setStatus] = useState("wachten"); // wachten | actief | afgelopen
  const [resterend, setResterend] = useState(0); // seconden

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

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Veilingklok</h2>

      {status === "wachten" && (
        <div className="text-yellow-600 text-lg font-medium">
          Start over {formatTime(resterend)}
        </div>
      )}

      {status === "actief" && (
        <div className="text-6xl font-bold text-green-600">{formatTime(resterend)}</div>
      )}

      {status === "afgelopen" && (
        <div className="text-red-600 text-xl font-semibold">Veiling afgelopen</div>
      )}
    </div>
  );
}