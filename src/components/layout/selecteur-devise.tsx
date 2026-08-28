"use client";

/**
 * Sélecteur de devise d'affichage de la barre du haut.
 * Permet de basculer instantanément la devise de tous les prix de l'application.
 */

import { Check, Coins } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { DEVISES, obtenirDevise } from "@/lib/devises";
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

export function SelecteurDevise({
  afficheTexte = true,
  taille = "sm",
}: {
  afficheTexte?: boolean;
  taille?: "icon" | "sm" | "default";
}) {
  const { devise, changerDevise, deviseBoutique } = useAuth();
  const { lang } = useI18n();

  const deviseActive = obtenirDevise(devise);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size={taille === "icon" && !afficheTexte ? "icon" : "sm"}
            className="gap-1.5 px-2 font-medium"
          />
        }
      >
        <Coins className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase">
          {deviseActive.code}
        </span>
        {afficheTexte && (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            ({deviseActive.symbole})
          </span>
        )}
        <span className="sr-only">Changer la devise</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
            {lang === "en" ? "Display currency" : "Devise d'affichage"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {DEVISES.map((d) => {
            const estActive = d.code === deviseActive.code;
            const estBoutique = d.code === deviseBoutique;

            return (
              <DropdownMenuItem
                key={d.code}
                onClick={() => changerDevise(d.code)}
                className="flex items-center justify-between py-2 cursor-pointer"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm">{d.code}</span>
                    <span className="text-xs text-muted-foreground">
                      ({d.symbole})
                    </span>
                    {estBoutique && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {lang === "en" ? "Store base" : "Boutique"}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {lang === "en" ? d.nomEn : d.nom}
                  </span>
                </div>

                {estActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
