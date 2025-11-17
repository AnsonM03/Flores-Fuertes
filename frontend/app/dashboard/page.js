"use client";
import { useEffect, useState } from "react";
import VeilingenLijst from "../components/VeilingenLijst";
import VeilingKlok from "../components/Veilingklok";
import KoperRij from "../components/Koperrij";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  // !! FIX: Haal 'gebruiker' en 'loading' op uit de AuthContext
  const { gebruiker, loading } = useAuth();
  const router = useRouter(); // !! FIX: Eén keer 'router' declareren

  const [veilingen, setVeilingen] = useState([]);
  const [selectedVeiling, setSelectedVeiling] = useState(null);
  const [error, setError] = useState(null);
  const [klanten, setKlanten] = useState([]);

  // !! FIX: De dubbele declaraties voor 'gebruiker' en 'router' zijn verwijderd.
  // 'rol' wordt nu correct afgeleid van de 'gebruiker' uit de AuthContext.
  const rol = gebruiker?.gebruikerType?.toLowerCase();

  console.log("GEVONDEN ROL:", rol);
  console.log("GEHELE GEBRUIKER:", gebruiker);

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
            // !! FIX: Aangepast om 'aanvoerder_Id' of 'aanvoerderId' te checken
            const aanvoerderId =
              v.product?.aanvoerder_Id || v.product?.aanvoerderId;
            if (!aanvoerderId) return v;

            try {
              // !! FIX: API-endpoint moet overeenkomen (Gebruikers/Aanvoerders?)
              // Ik gebruik hier 'Gebruikers' o.b.v. een vorig bestand. Pas aan indien nodig.
              const r2 = await fetch(
                `http://localhost:5281/api/Gebruikers/${aanvoerderId}`
              );
              if (!r2.ok) return v;
              const aanvoerder = await r2.json();
              // Sla de naam plat op voor eenvoudiger gebruik
              const aanvoerderNaam =
                `${aanvoerder.voornaam || ""} ${
                  aanvoerder.achternaam || ""
                }`.trim();
              return { ...v, aanvoerder, aanvoerderNaam };
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

    // Voer alleen uit als de gebruiker is geladen
    if (gebruiker) {
      fetchVeilingen();
    }
  }, [gebruiker]); // Afhankelijk van 'gebruiker'

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
    // Voer alleen uit als de gebruiker is geladen
    if (gebruiker) {
      fetchKlanten();
    }
  }, [gebruiker]); // Afhankelijk van 'gebruiker'

  // Willekeurige veiling maken
  async function maakRandomVeiling() {
    // ... (deze functie was correct)
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
      product_Id: "632e5fc8-abfa-4760-9e6b-28859ca83529", // Hardcoded, pas aan!
      veilingmeester_Id: gebruiker.gebruiker_Id, // Gebruik de ingelogde veilingmeester
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

  // !! FIX: Ontbrekende functies toegevoegd
  async function handleVeilingVerwijderen(veilingId) {
    if (!confirm("Weet je zeker dat je deze veiling wilt verwijderen?")) return;

    console.log("Verwijder veiling:", veilingId);
    // TODO: Implementeer je fetch DELETE request hier
    // try {
    //   await fetch(`http://localhost:5281/api/Veilingen/${veilingId}`, { method: 'DELETE' });
    //   setVeilingen(prev => prev.filter(v => v.veiling_Id !== veilingId));
    //   alert("Veiling verwijderd.");
    // } catch (err) {
    //   alert("Kon veiling niet verwijderen.");
    // }
  }

  // !! FIX: Ontbrekende functies toegevoegd
  async function handleKlantVerwijderen(klantId) {
    if (!confirm("Weet je zeker dat je deze klant wilt verwijderen?")) return;

    console.log("Verwijder klant:", klantId);
    // TODO: Implementeer je fetch DELETE request hier
    // try {
    //   await fetch(`http://localhost:5281/api/Klanten/${klantId}`, { method: 'DELETE' });
    //   setKlanten(prev => prev.filter(k => k.gebruiker_Id !== klantId));
    //   alert("Klant verwijderd.");
    // } catch (err) {
    //   alert("Kon klant niet verwijderen.");
    // }
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

  if (loading || !gebruiker)
    return <p className="text-center mt-10">Laden...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          {/* --- VEILINGEN (voor aanvoerder & veilingmeester)--- */}
          {/* We geven de rol nu mee aan de lijst, zodat die de knoppen kan tonen/verbergen */}
          <VeilingenLijst
            veilingen={veilingen}
            error={error}
            selectedVeiling={selectedVeiling}
            onSelect={setSelectedVeiling}
            onDelete={
              rol === "veilingmeester" ? handleVeilingVerwijderen : undefined
            }
            onAdd={rol === "veilingmeester" ? maakRandomVeiling : undefined}
          />

          {/* --- KOPERS (alleen voor veilingmeester) --- */}
          {(rol === "veilingmeester" || rol === "aanvoerder") && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Kopers
              </h2>

              {klanten.length === 0 ? (
                <p className="text-gray-500 italic">Kopers worden geladen...</p>
              ) : (
                <div className="overflow-auto rounded-md border border-gray-200">
                  <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-2">Naam</th>
                        <th className="px-4 py-2">Woonplaats</th>
                        <th className="px-4 py-2 text-right">Acties</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {klanten.map((k) => (
                        <KoperRij
                          key={k.gebruiker_Id}
                          klant={k}
                          onDelete={
                            rol === "veilingmeester"
                              ? () => handleKlantVerwijderen(k.gebruiker_Id)
                              : undefined
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
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