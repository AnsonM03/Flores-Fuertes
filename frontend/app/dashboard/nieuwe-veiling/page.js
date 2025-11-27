"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../../styles/nieuweVeiling.css";

export default function NieuweVeilingPage() {
  const [formData, setFormData] = useState({
    veilingPrijs: "",
    veilingDatum: "",
    startTijd: "",
    eindTijd: "",
    kloklocatie: "",
    status: "wachten",
  });

  const [gebruiker, setGebruiker] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const g = localStorage.getItem("gebruiker");
    const t = localStorage.getItem("token");

    if (!g || !t) {
      router.push("/login");
      return;
    }

    setGebruiker(JSON.parse(g));
  }, [router]);

  if (!gebruiker) return <p>⏳ Laden...</p>;

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const payload = {
      veilingPrijs: parseFloat(formData.veilingPrijs),
      veilingDatum: formData.veilingDatum,
      startTijd: new Date(`${formData.veilingDatum}T${formData.startTijd}`),
      eindTijd: new Date(`${formData.veilingDatum}T${formData.eindTijd}`),
      kloklocatie: formData.kloklocatie,
      status: formData.status,
      veilingmeester_Id: gebruiker.gebruiker_Id,
    };

    console.log("📤 Verzend payload:", payload);

    const res = await fetch("http://localhost:5281/api/Veilingen", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text();
      alert("❌ Fout bij aanmaken veiling:\n" + t);
      return;
    }

    alert("✅ Veiling succesvol aangemaakt!");
    router.push("/dashboard");
  }

  return (
    <main className="nv-wrapper">
      <div className="nv-card">
        <h1>Nieuwe Veiling Aanmaken</h1>

        <form onSubmit={handleSubmit} className="nv-form">
          <label>Veiling Prijs (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.veilingPrijs}
            onChange={(e) =>
              setFormData({ ...formData, veilingPrijs: e.target.value })
            }
            required
          />

          <label>Veilingdatum</label>
          <input
            type="date"
            value={formData.veilingDatum}
            onChange={(e) =>
              setFormData({ ...formData, veilingDatum: e.target.value })
            }
            required
          />

          <label>Starttijd</label>
          <input
            type="time"
            value={formData.startTijd}
            onChange={(e) =>
              setFormData({ ...formData, startTijd: e.target.value })
            }
            required
          />

          <label>Eindtijd</label>
          <input
            type="time"
            value={formData.eindTijd}
            onChange={(e) =>
              setFormData({ ...formData, eindTijd: e.target.value })
            }
            required
          />

          <label>Kloklocatie</label>
          <input
            value={formData.kloklocatie}
            onChange={(e) =>
              setFormData({ ...formData, kloklocatie: e.target.value })
            }
            required
          />

          <label>Status</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          >
            <option value="wachten">Wachten</option>
            <option value="actief">Actief</option>
            <option value="afgelopen">Afgelopen</option>
          </select>

          <button type="submit" className="nv-btn">
            Veiling aanmaken
          </button>
        </form>
      </div>
    </main>
  );
}