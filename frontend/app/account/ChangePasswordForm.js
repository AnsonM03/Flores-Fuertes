function ChangePasswordForm({ onCancel, onSave }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border border-gray-300 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Wachtwoord wijzigen</h2>

      <EditableField
        label="Huidig wachtwoord"
        value={oldPassword}
        onChange={setOldPassword}
      />
      <EditableField
        label="Nieuw wachtwoord"
        value={newPassword}
        onChange={setNewPassword}
      />

      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={() => onSave(oldPassword, newPassword)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Opslaan
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors"
        >
          Annuleren
        </button>
      </div>
    </div>
  );
}
