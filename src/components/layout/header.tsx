"use client";

/** La barre du haut : menu mobile, sélecteur de boutique, compte. */

import { useState } from "react";
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

  if (!utilisateur) return null;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-1.5 border-b bg-background/85 px-2.5 sm:px-4 sm:gap-3 backdrop-blur-sm">
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
        <SelecteurDevise />
        <BasculeLangue />
        <BasculeTheme />

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
            <UserRound className="h-4 w-4" />
            <span className="hidden max-w-32 truncate sm:inline">
              {utilisateur.name}
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60">
            {/*
              Un simple bloc de texte, et non un DropdownMenuLabel : dans
              Base UI, ce composant est l'intitulé d'un groupe d'entrées et
              doit vivre dans un <DropdownMenuGroup>. Ici il ne s'agit pas
              d'un intitulé mais de l'identité de la personne connectée.
            */}
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

            {/* `nativeButton={false}` prévient Base UI que l'élément rendu
                n'est pas un <button> mais un lien. */}
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
    </header>
  );
}
