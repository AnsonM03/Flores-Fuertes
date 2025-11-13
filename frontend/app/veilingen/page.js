"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import VeilingenLijst from "../components/VeilingenLijst";
import VeilingKlok from "../components/Veilingklok";


export default function Veilingen() {
     // ------------------------
      // USESTATES
      // ------------------------
      const [veilingen, setVeilingen] = useState([]);
      const [selectedVeiling, setSelectedVeiling] = useState(null);
      const [error, setError] = useState(null);
      const [klanten, setKlanten] = useState([]);
      const [gebruiker, setGebruiker] = useState(null);
      const router = useRouter();
      const rol = gebruiker?.gebruikerType?.toLowerCase();

      console.log("GEVONDEN ROL:", rol);
    console.log("GEHELE GEBRUIKER:", gebruiker);
    
      // ------------------------
      // Auth check
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
          } catch (err) {
            console.error(err);
            setError("Kon veilingen niet ophalen");
          }
        }
    
        fetchVeilingenMetAanvoerders();
      }, []);
    
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
      }, []);
    
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
    
              return { ...v, status };
            })
          );
        }, 1000);
    
        return () => clearInterval(interval);
      }, []);

    return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">

          {/* --- VEILINGEN (voor klanten)--- */}
          <VeilingenLijst
              veilingen={veilingen}
              error={error}
              selectedVeiling={selectedVeiling}
              onSelect={setSelectedVeiling}
            />

            </div>

        {/* --- VEILINGKLOK (alle rollen zien dit, klant alleen "koop nu") --- */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl flex flex-col items-center justify-center p-6">
          {selectedVeiling ? (
            <VeilingKlok veiling={selectedVeiling} gebruikerRol={rol} />
          ) : (
            <p className="text-gray-500 italic">Klik op een veiling</p>
          )}
        </div>
      </div>
    </div>
  );
}