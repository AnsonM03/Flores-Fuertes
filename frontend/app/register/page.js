// app/register/page.js
import RegisterForm from './Register';

export const metadata = {
  title: "Registreren - Royal Flora Holland",
  description: "Registreer een nieuw account op het Royal Flora Holland veilingsplatform",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
