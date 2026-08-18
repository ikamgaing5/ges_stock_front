"use client";

/**
 * Le sélecteur de boutique de la barre du haut.
 *
 * Il ne s'affiche que si la personne a accès à plusieurs boutiques :
 * une vendeuse rattachée à un seul point de vente n'a aucun choix à faire,
 * on lui montre simplement le nom de sa boutique.
 *
 * Le propriétaire dispose en plus de l'option « Toutes mes boutiques »,
 * qui agrège son parc entier.
 */

import { Check, ChevronsUpDown, Store } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
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

export function SelecteurBoutique() {
  const { boutiques, boutiqueActive, changerBoutique, utilisateur } = useAuth();

  if (boutiques.length === 0) return null;

  // Une seule boutique : rien à choisir, on affiche juste où l'on est.
  if (boutiques.length === 1) {
    return (
      <p className="flex min-w-0 items-center gap-2 text-sm">
        <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate font-medium">{boutiques[0].nom}</span>
      </p>
    );
  }

  const estProprietaire = utilisateur?.role === "proprietaire";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="max-w-56" />}
      >
        <Store className="h-4 w-4 shrink-0" />
        <span className="truncate">
          {boutiqueActive?.nom ?? "Toutes mes boutiques"}
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        {/*
          L'intitulé et les entrées qu'il désigne doivent vivre dans le
          même <DropdownMenuGroup> : dans Base UI, un intitulé sans groupe
          lève une erreur, et le lecteur d'écran a besoin de ce lien pour
          annoncer « Vos boutiques » avant d'énumérer les choix.
        */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            {estProprietaire
              ? "Choisissez le point de vente à consulter"
              : "Vos boutiques"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {estProprietaire && (
            <>
              <DropdownMenuItem onClick={() => changerBoutique(null)}>
                <span className="flex-1">Toutes mes boutiques</span>
                {boutiqueActive === null && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {boutiques.map((boutique) => (
            <DropdownMenuItem
              key={boutique.id}
              onClick={() => changerBoutique(boutique.id)}
            >
              <span className="flex-1 truncate">
                {boutique.nom}
                {boutique.ville && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {boutique.ville}
                  </span>
                )}
              </span>
              {boutiqueActive?.id === boutique.id && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
