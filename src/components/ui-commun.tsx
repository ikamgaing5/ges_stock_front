"use client";

/**
 * Les briques réutilisées dans toutes les pages : en-tête, états de
 * chargement, état vide, pastilles de statut.
 *
 * Les regrouper ici évite de recopier la même structure dix fois, et
 * garantit qu'une alerte a la même allure partout dans l'application.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  couleursMouvements,
  couleursStatuts,
  libellesMouvements,
  libellesStatuts,
} from "@/lib/format";
import type { StatutTelephone, TypeMouvement } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

/** En-tête de page : titre à gauche, actions à droite. */
export function TitrePage({
  titre,
  description,
  children,
}: {
  titre: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {titre}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/**
 * Chargement d'un tableau.
 *
 * On dessine des lignes grises de la forme du tableau final plutôt qu'un
 * rond qui tourne : la page ne saute pas quand les données arrivent.
 */
export function SquelettesTableau({ lignes = 5 }: { lignes?: number }) {
  return (
    <div className="space-y-px overflow-hidden rounded-xl border">
      {Array.from({ length: lignes }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 bg-card px-4 py-3.5"
          style={{ opacity: 1 - index * 0.13 }}
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="ml-auto h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

/** Chargement d'une grille de cartes. */
export function SquelettesCartes({ nombre = 4 }: { nombre?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: nombre }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

/** Ce qu'on affiche quand il n'y a rien à afficher. */
export function EtatVide({
  icone,
  titre,
  description,
  children,
}: {
  icone?: ReactNode;
  titre: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center">
      {icone && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icone}
        </div>
      )}
      <p className="font-medium">{titre}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

/** Message d'erreur de chargement, avec possibilité de réessayer. */
export function EtatErreur({
  message,
  onReessayer,
}: {
  message: string;
  onReessayer?: () => void;
}) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
      <p className="text-sm font-medium text-destructive">
        Le chargement a échoué
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onReessayer && (
        <button
          type="button"
          onClick={onReessayer}
          className="mt-3 text-sm font-medium text-primary underline underline-offset-4"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

/** Pastille colorée : en stock, réservé, vendu, en réparation, perdu. */
export function PastilleStatut({
  statut,
  className,
}: {
  statut: StatutTelephone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        couleursStatuts[statut],
        className,
      )}
    >
      {libellesStatuts[statut]}
    </span>
  );
}

/** Pastille du type de mouvement. */
export function PastilleMouvement({ type }: { type: TypeMouvement }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        couleursMouvements[type],
      )}
    >
      {libellesMouvements[type]}
    </span>
  );
}

/**
 * Enveloppe qui fait apparaître son contenu en douceur.
 * `index` décale l'animation pour produire une cascade dans une liste.
 */
export function Apparait({
  index = 0,
  className,
  children,
}: {
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("anim-apparait", className)}
      style={{ "--index": index } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
