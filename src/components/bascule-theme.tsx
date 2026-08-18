"use client";

/**
 * Le bouton qui change de thème.
 *
 * Un menu à trois entrées plutôt qu'un simple interrupteur : « Système »
 * doit rester atteignable, sinon on ne peut plus revenir au réglage
 * automatique une fois qu'on l'a quitté.
 */

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const choix: { valeur: string; libelle: string; icone: LucideIcon }[] = [
  { valeur: "light", libelle: "Clair", icone: Sun },
  { valeur: "dark", libelle: "Sombre", icone: Moon },
  { valeur: "système", libelle: "Système", icone: Monitor },
];

export function BasculeTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  /*
   * Le thème n'est connu qu'une fois la page arrivée dans le navigateur :
   * le serveur, lui, ignore le réglage de la machine. Tant qu'on ne le
   * sait pas, on affiche une icône neutre. Sans cette précaution, React
   * signale une différence entre ce qu'a produit le serveur et ce que
   * calcule le navigateur.
   */
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    setMonte(true);
  }, []);

  const Icone = !monte ? Sun : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <Icone className="h-4 w-4" />
        <span className="sr-only">Changer de thème</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            Apparence
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {choix.map((option) => {
            const IconeOption = option.icone;
            // `theme` vaut « system » tant qu'on n'a pas choisi soi-même.
            const valeurNext =
              option.valeur === "système" ? "system" : option.valeur;

            return (
              <DropdownMenuItem
                key={option.valeur}
                onClick={() => setTheme(valeurNext)}
              >
                <IconeOption className="mr-2 h-4 w-4" />
                <span className="flex-1">{option.libelle}</span>
                {monte && theme === valeurNext && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
