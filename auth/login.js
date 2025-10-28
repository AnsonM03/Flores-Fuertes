import Link from "next/link";

export default function Login() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Login Page</h1>

      <form method="post">
        <label htmlFor="Gebruikersnaam">Gebruikersnaam:</label><br />
        <input type="text" id="Gebruikersnaam" name="Gebruikersnaam" required /><br /><br />

        <label htmlFor="Wachtwoord">Wachtwoord:</label><br />
        <input type="password" id="Wachtwoord" name="Wachtwoord" required /><br /><br />

        <input type="checkbox" id="aangemeldblijven" name="aangemeldblijven" />
        <label htmlFor="aangemeldblijven"> Aangemeld blijven</label><br /><br />

        <button type="submit">Inloggen</button>
      </form>

      <p>Nog geen account?</p>

      <Link href="/register">
        <button>Account aanmaken</button>
      </Link>
    </div>
  );
}