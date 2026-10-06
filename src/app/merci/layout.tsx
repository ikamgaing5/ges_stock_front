import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bienvenue sur Telora — Inscription réussie",
  description:
    "Votre compte Telora est activé et votre boutique est configurée. Découvrez vos prochaines étapes pour sécuriser votre stock et vos encaissements.",
};

export default function MerciLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
