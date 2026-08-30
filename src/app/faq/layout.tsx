import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foire Aux Questions & Centre d'Assistance",
  description:
    "Trouvez toutes les réponses sur la gestion de stock unitaire, le scanner d'IMEI, les devises et la facturation sur Telora.",
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
