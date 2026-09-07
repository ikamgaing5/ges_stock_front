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
import { useI18n } from "@/lib/i18n";
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
  const { t } = useI18n();

  if (boutiques.length === 0) return null;

  // Une seule boutique : rien à choisir, on affiche juste où l'on est.
  if (boutiques.length === 1) {
    const b = boutiques[0];
    return (
      <p className="flex min-w-0 items-center gap-2 text-sm">
        <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate font-medium">{b.nom}</span>
        {b.adresse && (
          <span className="truncate text-xs text-muted-foreground font-normal">
            ({b.adresse})
          </span>
        )}
      </p>
    );
  }

  const estProprietaire = utilisateur?.role === "proprietaire";
  const libelleActif = boutiqueActive
    ? boutiqueActive.adresse
      ? `${boutiqueActive.nom} (${boutiqueActive.adresse})`
      : boutiqueActive.nom
    : t("selecteurBoutique.toutes");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="max-w-64" />}
      >
        <Store className="h-4 w-4 shrink-0" />
        <span className="truncate font-medium">
          {libelleActif}
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72">
        {/*
          L'intitulé et les entrées qu'il désigne doivent vivre dans le
          même <DropdownMenuGroup> : dans Base UI, un intitulé sans groupe
          lève une erreur, et le lecteur d'écran a besoin de ce lien pour
          annoncer « Vos boutiques » avant d'énumérer les choix.
        */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            {estProprietaire
              ? t("selecteurBoutique.labelProprietaire")
              : t("selecteurBoutique.labelEmploye")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {estProprietaire && (
            <>
              <DropdownMenuItem onClick={() => changerBoutique(null)}>
                <span className="flex-1">{t("selecteurBoutique.toutes")}</span>
                {boutiqueActive === null && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {boutiques.map((boutique) => (
            <DropdownMenuItem
              key={boutique.id}
              onClick={() => changerBoutique(boutique.id)}
              className="flex items-center justify-between gap-2 py-1.5"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-sm">{boutique.nom}</p>
                <p className="truncate text-xs text-muted-foreground font-normal">
                  {[boutique.adresse, boutique.ville].filter(Boolean).join(" · ") || t("boutiques.adresseNonRenseignee")}
                </p>
              </div>
              {boutiqueActive?.id === boutique.id && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
