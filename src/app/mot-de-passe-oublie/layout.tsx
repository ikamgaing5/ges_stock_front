import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Récupération de mot de passe",
  description:
    "Réinitialisez le mot de passe de votre compte Telora en toute sécurité via un code de vérification par email.",
};

export default function MotDePasseOublieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
