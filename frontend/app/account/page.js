"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import '../styles/account.css'; // <-- 1. Importeer je nieuwe CSS

export default function AccountPage() {
  const { gebruiker, loading } = useAuth();
  const [accountInfo, setAccountInfo] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [editingInfo, setEditingInfo] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({});

  // Haal accountgegevens op
  useEffect(() => {
    async function fetchAccountInfo() {
      if (!gebruiker?.gebruiker_Id) return;
      const response = await fetch(`http://localhost:5281/api/Gebruikers/${gebruiker.gebruiker_Id}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setAccountInfo(data);
        setFormData(data);
      }
      setFetching(false);
    }
    // Wacht tot de gebruiker geladen is uit de context
    if (!loading && gebruiker) {
      fetchAccountInfo();
    } else if (!loading && !gebruiker) {
      setFetching(false); // Geen gebruiker, stop met laden
    }
  }, [gebruiker, loading]); // Voeg 'loading' toe als dependency

  // Sla accountgegevens op
  const handleInfoSave = async () => {
    try {
      const response = await fetch(`http://localhost:5281/api/Gebruikers/${gebruiker.gebruiker_Id}`, {
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
      const response = await fetch(`http://localhost:5281/api/Gebruikers/${gebruiker.gebruiker_Id}/changepassword`, {
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

  // --- Laad- en foutstatussen ---
  if (loading || fetching) {
    return (
      <main className="account-page">
        <p>Gegevens laden...</p>
      </main>
    );
  }
  
  if (!gebruiker) {
    return (
      <main className="account-page">
        <div className="auth-card account-card">
          <div className="auth-form">
            <h1>Geen toegang</h1>
            <p>Je moet eerst inloggen om je accountgegevens te zien.</p>
          </div>
        </div>
      </main>
    );
  }
  
  if (!accountInfo) {
     return (
      <main className="account-page">
        <p>Kon accountinformatie niet laden.</p>
      </main>
    );
  }

  // --- Hoofdweergave ---
  return (
    <main className="account-page">
      <div className="auth-card account-card">
        <div className="auth-form">
          
          <div className="account-header">
            <h1>Mijn Account</h1>
            {/* Toon knop alleen als we niet al aan het wijzigen zijn */}
            {!editingInfo && !changingPassword && (
              <div className="button-group" style={{ marginTop: 0 }}>
                <button onClick={() => setEditingInfo(true)} className="btn btn-primary">
                  Gegevens aanpassen
                </button>
              </div>
            )}
          </div>

          <div className="account-content">
            {editingInfo ? (
              <>
                {/* --- Bewerkbare Velden --- */}
                <EditableField label="Voornaam" value={formData.voornaam} onChange={(v) => setFormData({ ...formData, voornaam: v })} />
                <EditableField label="Achternaam" value={formData.achternaam} onChange={(v) => setFormData({ ...formData, achternaam: v })} />
                <EditableField label="Email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} />
                <EditableField label="Adres" value={formData.adres} onChange={(v) => setFormData({ ...formData, adres: v })} />
                <EditableField label="Telefoonnummer" value={formData.telefoonnr} onChange={(v) => setFormData({ ...formData, telefoonnr: v })} />
                <EditableField label="Woonplaats" value={formData.woonplaats} onChange={(v) => setFormData({ ...formData, woonplaats: v })} />

                <div className="button-group">
                  <button onClick={handleInfoSave} className="btn btn-primary">Opslaan</button>
                  <button onClick={() => setEditingInfo(false)} className="btn btn-secondary">Annuleren</button>
                </div>
              </>
            ) : (
              <>
                {/* --- Alleen-lezen Velden --- */}
                <ReadOnlyField label="Voornaam" value={accountInfo.voornaam} />
                <ReadOnlyField label="Achternaam" value={accountInfo.achternaam} />
                <ReadOnlyField label="Email" value={accountInfo.email} />
                <ReadOnlyField label="Adres" value={accountInfo.adres} />
                <ReadOnlyField label="Telefoonnummer" value={accountInfo.telefoonnr} />
                <ReadOnlyField label="Woonplaats" value={accountInfo.woonplaats} />

                {/* Toon 'Wachtwoord wijzigen' knop alleen in read-only modus */}
                <div className="button-group">
                  {!changingPassword && (
                    <button onClick={() => setChangingPassword(true)} className="btn btn-secondary">Wachtwoord wijzigen</button>
                  )}
                </div>
              </>
            )}

            {/* --- Wachtwoord Formulier --- */}
            {changingPassword && (
              <ChangePasswordForm
                onCancel={() => setChangingPassword(false)}
                onSave={handlePasswordChange}
              />
            )}
          </div>
          
        </div>
      </div>
    </main>
  );
}

// --- Inline Componenten (nu met custom classes) ---

function ReadOnlyField({ label, value }) {
  return (
    <div className="account-field">
      <label>{label}</label>
      <input type="text" value={value || ""} disabled />
    </div>
  );
}

function EditableField({ label, value, onChange }) {
  return (
    <div className="account-field">
      <label>{label}</label>
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ChangePasswordForm({ onCancel, onSave }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <div className="password-form">
      <h2>Wachtwoord wijzigen</h2>
      {/* Hergebruik account-content voor de 2-kolommen layout */}
      <div className="account-content">
        <EditableField label="Huidig wachtwoord" value={oldPassword} onChange={setOldPassword} type="password" />
        <EditableField label="Nieuw wachtwoord" value={newPassword} onChange={setNewPassword} type="password" />
      </div>
      <div className="button-group">
        <button onClick={() => onSave(oldPassword, newPassword)} className="btn btn-primary">Opslaan</button>
        <button onClick={onCancel} className="btn btn-secondary">Annuleren</button>
      </div>
    </div>
  );
}