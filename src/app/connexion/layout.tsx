import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion sécurisée",
  description:
    "Connectez-vous à votre espace Telora pour piloter le stock, la traçabilité des IMEI et les ventes de vos boutiques.",
};

export default function ConnexionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
