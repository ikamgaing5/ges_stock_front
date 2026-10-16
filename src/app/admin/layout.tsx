"use client";

/**
 * L'espace de l'administrateur de la plateforme.
 *
 * Volontairement séparé de l'application métier : l'administrateur gère
 * des comptes clients et des abonnements, il n'a accès à aucun stock.
 * Cette séparation dans le code reflète la séparation des droits.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Menu } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { SidebarAdmin } from "@/components/admin/sidebar-admin";
import { Button } from "@/components/ui/button";
import {
  Tiroir,
  TiroirContenu,
  TiroirDeclencheur,
  TiroirTitre,
} from "@/components/ui/tiroir";
import { useI18n } from "@/lib/i18n";
import { IconeTelora } from "@/components/ui/logo-telora";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { utilisateur, chargement } = useAuth();
  const { t } = useI18n();
  const chemin = usePathname();
  const [tiroirOuvert, setTiroirOuvert] = useState(false);

  useEffect(() => {
    if (chargement) return;

    if (!utilisateur) {
      const cheminActuel =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "";
      const destination = cheminActuel
        ? `/connexion?retour=${encodeURIComponent(cheminActuel)}`
        : "/connexion";
      if (typeof window !== "undefined") {
        window.location.replace(destination);
      }
      return;
    }

    if (utilisateur.role !== "admin") {
      if (typeof window !== "undefined") {
        window.location.replace("/dashboard");
      }
    }
  }, [chargement, utilisateur]);

  // Verrouiller le défilement au niveau de la fenêtre pour éviter la double scrollbar
  useEffect(() => {
    document.documentElement.classList.add("overflow-hidden");
    document.body.classList.add("overflow-hidden");
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  if (chargement || utilisateur?.role !== "admin") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="sr-only">{t("commun.chargement")}</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-[var(--hauteur-barre-titre,0px)] flex overflow-hidden">
      {/* 1. Sidebar admin fixe sur grand écran */}
      <aside className="hidden h-full w-60 shrink-0 lg:block select-none">
        <SidebarAdmin />
      </aside>

      {/* 2. Zone principale droite (Navbar + Contenu défilant) */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Navbar admin : uniquement langue & thème à droite, tiroir mobile à gauche */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background/85 px-4 sm:px-6 backdrop-blur-sm">
          {/* Menu mobile (tiroir) sur petit écran */}
          <div className="flex items-center gap-2 lg:hidden">
            <Tiroir key={chemin} open={tiroirOuvert} onOpenChange={setTiroirOuvert}>
              <TiroirDeclencheur
                render={
                  <Button variant="ghost" size="icon" className="lg:hidden" />
                }
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("nav.ouvrirMenu")}</span>
              </TiroirDeclencheur>
              <TiroirContenu cote="gauche">
                <TiroirTitre className="sr-only">
                  {t("nav.menuPrincipal")}
                </TiroirTitre>
                <SidebarAdmin
                  dansLeTiroir
                  onNaviguer={() => setTiroirOuvert(false)}
                />
              </TiroirContenu>
            </Tiroir>

            <div className="flex items-center gap-2">
              <IconeTelora size={26} />
              <span className="font-heading font-bold text-sm tracking-tight text-foreground">
                Telora{" "}
                <span className="text-[10px] font-semibold text-primary uppercase ml-0.5">
                  Admin
                </span>
              </span>
            </div>
          </div>

          {/* Espace gauche vide sur desktop car la sidebar contient déjà l'identité */}
          <div className="hidden lg:block" />

          {/* Seules la langue et le thème dans la navbar */}
          <div className="flex items-center gap-2">
            <BasculeLangue />
            <BasculeTheme />
          </div>
        </header>

        {/* Contenu principal de la page admin */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
