"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../../styles/nieuweVeiling.css";

export default function NieuweVeilingPage() {
  const [formData, setFormData] = useState({
    veilingDatum: "",
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

    // ✅ Dutch auction: geen prijs / starttijd / eindtijd bij create
    const payload = {
      veilingDatum: formData.veilingDatum || null,
      kloklocatie: formData.kloklocatie,
      status: "wachten",
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
          <label>Veilingdatum (optioneel)</label>
          <input
            type="date"
            value={formData.veilingDatum}
            onChange={(e) =>
              setFormData({ ...formData, veilingDatum: e.target.value })
            }
          />

          <label>Kloklocatie</label>
          <input
            value={formData.kloklocatie}
            onChange={(e) =>
              setFormData({ ...formData, kloklocatie: e.target.value })
            }
            required
          />

          <button type="submit" className="nv-btn">
            Veiling aanmaken
          </button>
        </form>
      </div>
    </main>
  );
}