import { Page404Simple } from "@/components/404/page-404-simple";

export const metadata = {
  title: "Page introuvable (Erreur 404)",
  description: "Cette page n'existe pas ou a été déplacée.",
};

export default function NotFound() {
  return <Page404Simple />;
}
