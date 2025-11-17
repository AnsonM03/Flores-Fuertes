"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VeilingenLijst from "../components/VeilingenLijst";
import VeilingKlok from "../components/Veilingklok";
import "../styles/veilingen.css";

export default function Veilingen() {
  const [veilingen, setVeilingen] = useState([]);
  const [selectedVeiling, setSelectedVeiling] = useState(null);
  const [error, setError] = useState(null);
  const [klanten, setKlanten] = useState([]);
  const [gebruiker, setGebruiker] = useState(null);
  const router = useRouter();

  const rol = gebruiker?.gebruikerType?.toLowerCase();

  // ------------------------
  // AUTH CHECK
  // ------------------------
  useEffect(() => {
    const stored = localStorage.getItem("gebruiker");
    if (!stored) {
      router.push("/login");
      return;
    }
    setGebruiker(JSON.parse(stored));
  }, [router]);

  // ------------------------
  // VEILINGEN OPHALEN + AANVOERDER KOPPELEN
  // ------------------------
  useEffect(() => {
    async function fetchVeilingen() {
      try {
        const res = await fetch("http://localhost:5281/api/Veilingen");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();

        const updated = await Promise.all(
          raw.map(async (v) => {
            const aanvoerderId = v.product?.aanvoerder_Id;

            let aanvoerderNaam = "Onbekende Aanvoerder";
            if (aanvoerderId) {
              const r2 = await fetch(
                `http://localhost:5281/api/Gebruikers/${aanvoerderId}`
              );
              if (r2.ok) {
                const a = await r2.json();
                aanvoerderNaam = `${a.voornaam} ${a.achternaam}`;
              }
            }

            return {
              ...v,
              productNaam: v.product?.naam || "Onbekend product",
              aanvoerderNaam,
            };
          })
        ); // <-- Einde van Promise.all

        // !! FIX: State updates moeten *na* de Promise.all gebeuren, niet erin !!
        setVeilingen(updated);

        // selecteer eerste actieve veiling
        const actieve = updated.find(
          (v) => new Date(v.eindTijd) > new Date()
        );
        setSelectedVeiling(actieve || updated[0]);
      } catch (err) {
        console.error(err);
        setError("Kon veilingen niet ophalen");
      }
    }

    fetchVeilingen();
  }, []);

  // ------------------------
  // KLANTEN OPHALEN
  // ------------------------
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

  // ------------------------
  // LIVE STATUS UPDATES
  // ------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      const nu = new Date();
      setVeilingen((prev) =>
        prev.map((v) => {
          let status = v.status;

          if (nu >= new Date(v.startTijd) && nu < new Date(v.eindTijd)) {
            status = "actief";
          } else if (nu >= new Date(v.eindTijd)) {
            status = "afgelopen";
          } else {
            status = "wachten";
          }

          // !! FIX: Je moet het nieuwe object returnen binnen de .map() !!
          return { ...v, status };
        })
      );
    }, 1000);

    return () => clearInterval(interval); // Cleanup
  }, []); // Lege dependency array, interval start 1x

  // ------------------------
  // BOD HANDLER
  // ------------------------
  const handleBod = (veilingId, bedrag) => {
    if (rol !== "klant") {
      alert("Alleen klanten mogen bieden.");
      return;
    }

    console.log(
      `Klant ${gebruiker.gebruiker_Id} biedt €${bedrag} op veiling ${veilingId}`
    );
    alert(`Bod geplaatst: €${bedrag}`);
  };

  return (
    <main className="main veiling-pagina">
      <div className="container veiling-layout">
        {/* Veilingen lijst */}
        <div className="veiling-lijst-kolom">
          <VeilingenLijst
            veilingen={veilingen}
            error={error}
            selectedVeiling={selectedVeiling}
            onSelect={setSelectedVeiling}
          />
        </div>

        {/* Klok */}
        <div className="veiling-klok-kolom">
          {selectedVeiling ? (
            <VeilingKlok
              veiling={selectedVeiling}
              gebruikerRol={rol}
              onBod={handleBod}
            />
          ) : (
            <p className="text-gray-500 italic">Selecteer een veiling</p>
          )}
        </div>
      </div>
    </main>
  );
}