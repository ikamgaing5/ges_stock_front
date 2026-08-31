import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte boutique ",
  description:
    "Inscrivez votre boutique de téléphonie sur Telora en 2 minutes. Suivi unitaire par IMEI, encaissement rapide et zéro perte.",
};

export default function InscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
