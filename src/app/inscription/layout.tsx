import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte boutique",
  description:
    "Créez votre compte Telora en 2 minutes. Chaque téléphone est suivi par son IMEI, du carton à la vente.",
};

export default function InscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
