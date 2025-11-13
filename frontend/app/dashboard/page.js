"use client";
import { useEffect, useState } from "react";
import VeilingenLijst from "../components/VeilingenLijst";
import VeilingKlok from "../components/Veilingklok";
import KoperRij from "../components/Koperrij";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { gebruiker, loading } = useAuth();
  const router = useRouter();

  const [veilingen, setVeilingen] = useState([]);
  const [selectedVeiling, setSelectedVeiling] = useState(null);
  const [error, setError] = useState(null);
  const [klanten, setKlanten] = useState([]);

  const rol = gebruiker?.rol?.toLowerCase();

  // Redirect naar login als niet ingelogd
  useEffect(() => {
    if (!loading && !gebruiker) {
      router.push("/login");
    }
  }, [loading, gebruiker, router]);

  // Veilingen ophalen
  useEffect(() => {
    async function fetchVeilingen() {
      try {
        const res = await fetch("http://localhost:5281/api/Veilingen");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Aanvoerders koppelen
        const updated = await Promise.all(
          data.map(async (v) => {
            const aanvoerderId = v.product?.aanvoerder_Id;
            if (!aanvoerderId) return v;
            try {
              const r2 = await fetch(`http://localhost:5281/api/Aanvoerders/${aanvoerderId}`);
              if (!r2.ok) return v;
              const aanvoerder = await r2.json();
              return { ...v, aanvoerder };
            } catch {
              return v;
            }
          })
        );

        setVeilingen(updated);
        if (updated.length > 0) setSelectedVeiling(updated[0]);
      } catch (err) {
        console.error(err);
        setError("Kon veilingen niet ophalen");
      }
    }

    fetchVeilingen();
  }, []);

  // Klanten ophalen
  useEffect(() => {
    async function fetchKlanten() {
      try {
        const res = await fetch("http://localhost:5281/api/Klanten");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setKlanten(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchKlanten();
  }, []);

  // Willekeurige veiling maken
  async function maakRandomVeiling() {
    const start = new Date();
    const eind = new Date(start.getTime() + (Math.random() * 10 + 5) * 60 * 1000);
    const randomPrijs = Math.floor(Math.random() * 100) + 20;
    const locaties = ["Aalsmeer", "Almere", "Rijnsburg", "Naaldwijk"];
    const randomLocatie = locaties[Math.floor(Math.random() * locaties.length)];

    const nieuweVeiling = {
      veilingPrijs: randomPrijs,
      veilingDatum: new Date().toISOString().split("T")[0],
      startTijd: start.toISOString(),
      eindTijd: eind.toISOString(),
      kloklocatie: randomLocatie,
      status: "open",
      product_Id: "632e5fc8-abfa-4760-9e6b-28859ca83529",
      veilingmeester_Id: "19c7ec76-e38f-4b8c-b985-00e5f804ca43",
    };

    try {
      const res = await fetch("http://localhost:5281/api/Veilingen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nieuweVeiling),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setVeilingen((prev) => [data, ...prev]);
      setSelectedVeiling(data);
      alert(`✅ Nieuwe veiling aangemaakt in ${randomLocatie} — €${randomPrijs}`);
    } catch (err) {
      console.error(err);
      alert("❌ Er ging iets mis bij het aanmaken van de veiling");
    }
  }

  // Live status updates
  useEffect(() => {
    const interval = setInterval(() => {
      const nu = new Date();
      setVeilingen((prev) =>
        prev.map((v) => {
          const eind = new Date(v.eindTijd);
          let status = v.status;
          if (nu < eind && nu >= new Date(v.startTijd)) status = "actief";
          else if (nu >= eind) status = "afgelopen";
          else status = "wachten";
          return { ...v, status };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !gebruiker) return <p className="text-center mt-10">Laden...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <VeilingenLijst
            veilingen={veilingen}
            error={error}
            selectedVeiling={selectedVeiling}
            onSelect={setSelectedVeiling}
            onDelete={(id) =>
              setVeilingen((prev) => prev.filter((v) => v.veiling_Id !== id))
            }
            onAdd={rol === "veilingmeester" ? maakRandomVeiling : undefined}
            rol={rol}
          />
          {/* Koperslijst */}
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl flex flex-col items-center justify-center p-6">
          {selectedVeiling ? (
            <VeilingKlok veiling={selectedVeiling} gebruikerRol={rol} />
          ) : (
            <p className="text-gray-500 italic">Geen actieve veilingen</p>
          )}
        </div>
      </div>
    </div>
  );
}