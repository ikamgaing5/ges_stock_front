"use client";

/** La barre du haut : menu mobile, sélecteur de boutique, compte. */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { SelecteurBoutique } from "@/components/layout/selecteur-boutique";
import { SelecteurDevise } from "@/components/layout/selecteur-devise";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tiroir,
  TiroirContenu,
  TiroirDeclencheur,
  TiroirTitre,
} from "@/components/ui/tiroir";

export function Header() {
  const { utilisateur, deconnexion } = useAuth();
  const { t, libelleRole } = useI18n();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const chemin = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);
  

  useEffect(() => {
    setIsDesktop(
      typeof window !== "undefined" && Boolean(window.teloraDesktop?.isDesktop),
    );
  }, []);

  if (!utilisateur) return null;
  // Sur Desktop, la navbar est complètement supprimée pour maximiser l'espace vertical :
  // le sélecteur de boutique est intégré directement dans la barre de titre.
  if (isDesktop) return null;

  return (
    <header className="barre-navigation-haut sticky top-0 z-30 flex h-14 shrink-0 items-center gap-1.5 border-b bg-background/85 px-3 sm:px-6 sm:gap-3 backdrop-blur-sm">
      {/*
        Le menu en tiroir, uniquement sur petit écran. Sur grand écran, la
        sidebar est déjà affichée en permanence à gauche.
        `key={chemin}` referme le tiroir à chaque changement de page.
      */}
      <Tiroir key={chemin} open={menuOuvert} onOpenChange={setMenuOuvert}>
        <TiroirDeclencheur
          render={<Button variant="ghost" size="icon" className="lg:hidden" />}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("nav.ouvrirMenu")}</span>
        </TiroirDeclencheur>

        <TiroirContenu>
          <TiroirTitre className="sr-only">{t("nav.menuPrincipal")}</TiroirTitre>
          <Sidebar onNaviguer={() => setMenuOuvert(false)} />
        </TiroirContenu>
      </Tiroir>

      <SelecteurBoutique />

      {/* `ml-auto` colle ce bloc et tout ce qui suit au bord droit. */}
      <div className="ml-auto flex items-center gap-1">
        {!isDesktop && (
          <>
            <SelecteurDevise />
            <BasculeLangue />
            <BasculeTheme />
          </>
        )}

        {/*
          Bouton de compte masqué (non supprimé) :
          l'accès complet au compte et aux paramètres se fait désormais
          depuis le menu profil interactif au bas de la barre latérale.
        */}
        <div className="hidden" aria-hidden="true">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
              <UserRound className="h-4 w-4" />
              <span className="hidden max-w-32 truncate sm:inline">
                {utilisateur.name}
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
              <div className="px-1.5 py-1">
                <p className="truncate text-sm font-medium">{utilisateur.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {libelleRole(utilisateur.role)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {utilisateur.email}
                </p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                nativeButton={false}
                render={<Link href="/mon-compte" />}
              >
                <UserRound className="mr-2 h-4 w-4" />
                {t("nav.monCompte")}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => void deconnexion()}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("nav.deconnexion")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
