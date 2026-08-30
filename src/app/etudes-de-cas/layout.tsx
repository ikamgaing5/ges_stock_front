import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Témoignages & Études de Cas Commerçants",
  description:
    "Découvrez les retours d'expérience concrets de gérants de boutiques de téléphonie qui ont sécurisé leur stock et simplifié leur gestion avec Telora.",
};

export default function EtudesDeCasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
