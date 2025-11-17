"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VeilingenLijst from "../components/VeilingenLijst";
import VeilingKlok from "../components/Veilingklok"; // We gebruiken de 'k' op het einde
import "../styles/veilingen.css"; // Importeren van de nieuwe CSS

export default function Veilingen() {
  // ------------------------
  // USESTATES
  // ------------------------
  const [veilingen, setVeilingen] = useState([]);
  const [selectedVeiling, setSelectedVeiling] = useState(null);
  const [error, setError] = useState(null);
  const [klanten, setKlanten] = useState([]); // Deze was correct
  const [gebruiker, setGebruiker] = useState(null);
  const router = useRouter();
  const rol = gebruiker?.gebruikerType?.toLowerCase();

  // ------------------------
  // Auth check
  // ------------------------
  useEffect(() => {
    const stored = localStorage.getItem("gebruiker");
    if (!stored) {
      router.push("/login");
      return;
    }
    const gebruikerData = JSON.parse(stored);
    setGebruiker(gebruikerData);
  }, [router]);

  // ------------------------
  // Veilingen ophalen
  // ------------------------
  useEffect(() => {
    async function fetchVeilingenMetAanvoerders() {
      try {
        const res = await fetch("http://localhost:5281/api/Veilingen");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Koppel aanvoerders aan veilingen
        const updated = await Promise.all(
          data.map(async (v) => {
            const aanvoerderId =
              v.product?.aanvoerder_Id || v.product?.aanvoerderId;
            const productName = v.product?.naam || "Onbekend Product";

            let aanvoerderNaam = "Onbekende Aanvoerder";
            if (aanvoerderId) {
              try {
                const r2 = await fetch(
                  `http://localhost:5281/api/Gebruikers/${aanvoerderId}`
                );
                if (r2.ok) {
                  const aanvoerder = await r2.json();
                  aanvoerderNaam =
                    `${aanvoerder.voornaam || ""} ${
                      aanvoerder.achternaam || ""
                    }`.trim();
                }
              } catch (err) {
                console.error("Kon aanvoerder niet ophalen:", err);
                // Ga door, zelfs als deze ene fetch faalt
              }
            }

            // !! FIX: Je moet het nieuwe object returnen binnen de .map() !!
            return { ...v, aanvoerderNaam, productName };
          })
        ); // <-- Einde van Promise.all

        // !! FIX: State updates moeten *na* de Promise.all gebeuren, niet erin !!
        setVeilingen(updated);

        // !! FIX: Selecteer de eerste actieve veiling *nadat* de data is opgehaald !!
        const eersteActieve =
          updated.find((v) => new Date(v.eindTijd) > new Date()) || updated[0];
        setSelectedVeiling(eersteActieve);
        
      } catch (err) {
        console.error(err);
        setError("Kon veilingen niet ophalen");
      }
    }

    fetchVeilingenMetAanvoerders();
  }, []); // Lege dependency array, runt 1x bij laden

  // ------------------------
  // Klanten ophalen
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
  }, []); // Lege dependency array, runt 1x bij laden

  // ------------------------
  // Live status updates
  // ------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      const nu = new Date();
      setVeilingen((prev) =>
        prev.map((v) => {
          const eind = new Date(v.eindTijd);
          let status = v.status;

          if (nu < eind && nu >= new Date(v.startTijd)) {
            status = "actief";
          } else if (nu >= eind) {
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

  // Handler voor het plaatsen van een bod
  const handleBod = (veilingId, bedrag) => {
    if (rol !== "klant") {
      alert("Alleen klanten kunnen bieden.");
      return;
    }

    // TODO: Implementeer je bod-logica hier
    // (Waarschijnlijk een POST request naar je API)
    console.log(
      `Klant ${gebruiker.gebruiker_Id} biedt ${bedrag} op veiling ${veilingId}`
    );
    alert(`Bod van €${bedrag} geplaatst!`);

    // Optioneel: update de veiling (bijv. met nieuwe prijs)
    // En selecteer de volgende actieve veiling
  };

  return (
    // We gebruiken de 'main' tag en voegen een class toe
    <main className="main veiling-pagina">
      {/* Een container om de layout te centreren, net als in stylebp.css */}
      <div className="container veiling-layout">
        {/* Kolom 1: De lijst met veilingen */}
        <div className="veiling-lijst-kolom">
          <VeilingenLijst
            veilingen={veilingen}
            error={error}
            selectedVeiling={selectedVeiling}
            onSelect={setSelectedVeiling}
          />
        </div>

        {/* Kolom 2: De Veilingklok */}
        <div className="veiling-klok-kolom">
          {selectedVeiling ? (
            <VeilingKlok
              veiling={selectedVeiling}
              gebruikerRol={rol}
              onBod={handleBod}
            />
          ) : (
            <p className="text-gray-500 italic">Klik op een veiling</p>
          )}
        </div>
      </div>
    </main>
  );
}