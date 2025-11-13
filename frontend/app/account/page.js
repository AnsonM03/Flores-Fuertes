"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const [accountInfo, setAccountInfo] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [editingInfo, setEditingInfo] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({});

  // Haal accountgegevens op
  useEffect(() => {
    async function fetchAccountInfo() {
      if (!user?.gebruiker_Id) return;
      const response = await fetch(`http://localhost:5281/api/Gebruikers/${user.gebruiker_Id}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setAccountInfo(data);
        setFormData(data);
      }
      setFetching(false);
    }
    fetchAccountInfo();
  }, [user]);

  if (loading || fetching) return <p className="text-center mt-10">Laden...</p>;
  if (!user) return <p className="text-center mt-10">Je moet eerst inloggen.</p>;
  if (!accountInfo) return <p className="text-center mt-10">Geen accountinformatie beschikbaar.</p>;

  // Sla accountgegevens op
  const handleInfoSave = async () => {
    try {
      const response = await fetch(`http://localhost:5281/api/Gebruikers/${user.gebruiker_Id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        let updated = null;
        try { updated = await response.json(); } catch {}
        if (updated) setAccountInfo(updated);
        setEditingInfo(false);
        alert("Gegevens succesvol bijgewerkt!");
      } else {
        const errorText = await response.text();
        alert("Fout bij bijwerken: " + errorText);
      }
    } catch (error) {
      console.error("Fout bij opslaan:", error);
      alert("Er is een fout opgetreden bij het opslaan.");
    }
  };

  // Wijzig wachtwoord
  const handlePasswordChange = async (oldPassword, newPassword) => {
    try {
      const response = await fetch(`http://localhost:5281/api/Gebruikers/${user.gebruiker_Id}/changepassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (response.ok) {
        alert("Wachtwoord succesvol gewijzigd!");
        setChangingPassword(false);
      } else {
        const errorText = await response.text();
        alert("Wachtwoord wijzigen mislukt: " + errorText);
      }
    } catch (error) {
      console.error("Fout bij wijzigen wachtwoord:", error);
      alert("Er is een fout opgetreden bij het wijzigen van het wachtwoord.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Mijn Account</h1>

        <div className="space-y-4">
          {editingInfo ? (
            <>
              <EditableField label="Voornaam" value={formData.voornaam} onChange={(v) => setFormData({...formData, voornaam: v})} />
              <EditableField label="Achternaam" value={formData.achternaam} onChange={(v) => setFormData({...formData, achternaam: v})} />
              <EditableField label="Email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
              <EditableField label="Adres" value={formData.adres} onChange={(v) => setFormData({...formData, adres: v})} />
              <EditableField label="Telefoonnummer" value={formData.telefoonnr} onChange={(v) => setFormData({...formData, telefoonnr: v})} />
              <EditableField label="Woonplaats" value={formData.woonplaats} onChange={(v) => setFormData({...formData, woonplaats: v})} />

              <div className="flex gap-2 mt-2">
                <button onClick={handleInfoSave} className="bg-blue-600 text-white px-4 py-2 rounded-md">Opslaan</button>
                <button onClick={() => setEditingInfo(false)} className="bg-gray-400 text-white px-4 py-2 rounded-md">Annuleren</button>
              </div>
            </>
          ) : (
            <>
              <ReadOnlyField label="Voornaam" value={accountInfo.voornaam} />
              <ReadOnlyField label="Achternaam" value={accountInfo.achternaam} />
              <ReadOnlyField label="Email" value={accountInfo.email} />
              <ReadOnlyField label="Adres" value={accountInfo.adres} />
              <ReadOnlyField label="Telefoonnummer" value={accountInfo.telefoonnr} />
              <ReadOnlyField label="Woonplaats" value={accountInfo.woonplaats} />

              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditingInfo(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md">Gegevens aanpassen</button>
                <button onClick={() => setChangingPassword(true)} className="bg-green-600 text-white px-4 py-2 rounded-md">Wachtwoord wijzigen</button>
              </div>
            </>
          )}

          {changingPassword && (
            <ChangePasswordForm
              onCancel={() => setChangingPassword(false)}
              onSave={handlePasswordChange}
            />
          )}
        </div>
      </div>
    </main>
  );
}

// Componenten
function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input type="text" value={value || ""} disabled className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900" />
    </div>
  );
}

function EditableField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" />
    </div>
  );
}

function ChangePasswordForm({ onCancel, onSave }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border border-gray-300 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Wachtwoord wijzigen</h2>

      <EditableField label="Huidig wachtwoord" value={oldPassword} onChange={setOldPassword} />
      <EditableField label="Nieuw wachtwoord" value={newPassword} onChange={setNewPassword} />

      <div className="flex justify-end mt-4 gap-2">
        <button onClick={() => onSave(oldPassword, newPassword)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">Opslaan</button>
        <button onClick={onCancel} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors">Annuleren</button>
      </div>
    </div>
  );
}
