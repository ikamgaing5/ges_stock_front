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
import { couleursMouvements, couleursStatuts } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import type { StatutTelephone, TypeMouvement } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

/** En-tête de page : titre à gauche, actions à droite. */
export function TitrePage({
  titre,
  description,
  chargement = false,
  children,
}: {
  titre: string;
  description?: string;
  chargement?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
          {titre}
        </h1>
        {chargement ? (
          <Skeleton className="mt-1.5 h-4 w-48 sm:w-64 rounded-md" />
        ) : description ? (
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{description}</p>
        ) : null}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/** Lignes de texte en cours de chargement. */
export function SqueletteTexte({
  lignes = 3,
  className,
}: {
  lignes?: number;
  className?: string;
}) {
  const largeurs = ["w-full", "w-5/6", "w-4/6", "w-3/4", "w-2/3"];
  return (
    <div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lignes }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4 rounded-md", largeurs[i % largeurs.length])}
        />
      ))}
    </div>
  );
}

/** En-tête de page en cours de chargement. */
export function SqueletteTitrePage({
  avecBouton = true,
  className,
}: {
  avecBouton?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        <Skeleton className="h-7 w-48 sm:h-8 sm:w-64" />
        <Skeleton className="h-4 w-72 sm:w-96" />
      </div>
      {avecBouton && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      )}
    </div>
  );
}

/** Barre de filtres (recherche + selects) en chargement. */
export function SqueletteFiltres({
  selects = 2,
  className,
}: {
  selects?: number;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 rounded-xl border bg-card p-3 sm:p-5 shadow-xs", className)}>
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <Skeleton className="h-9 sm:h-10 flex-1 min-w-48 rounded-lg" />
        {Array.from({ length: selects }).map((_, i) => (
          <Skeleton key={i} className="h-9 sm:h-10 w-full sm:w-44 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/** Chargement d'une page complète avec titre, filtres et tableau. */
export function SquelettePageTableau({
  lignes = 8,
  colonnes = 6,
  selectsFiltre = 2,
  avecFiltres = true,
  avecBouton = true,
}: {
  lignes?: number;
  colonnes?: number;
  selectsFiltre?: number;
  avecFiltres?: boolean;
  avecBouton?: boolean;
}) {
  return (
    <div className="space-y-4">
      <SqueletteTitrePage avecBouton={avecBouton} />
      {avecFiltres && <SqueletteFiltres selects={selectsFiltre} />}
      <SquelettesTableau lignes={lignes} colonnes={colonnes} />
    </div>
  );
}

/** Chargement du shell dashboard (layout initial). */
export function SqueletteShellDashboard() {
  return (
    <div className="flex min-h-[100dvh]">
      <aside className="hidden h-dvh w-60 shrink-0 border-r p-4 lg:flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 sm:px-6">
          <Skeleton className="h-5 w-48" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <SqueletteDashboard />
        </main>
      </div>
    </div>
  );
}

/**
 * Chargement d'un tableau complet (en-tête + lignes).
 */
export function SquelettesTableau({
  lignes = 5,
  colonnes = 5,
  className,
}: {
  lignes?: number;
  colonnes?: number;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card shadow-xs", className)}>
      {/* En-tête de colonnes */}
      <div className="flex items-center gap-4 border-b bg-muted/40 px-4 py-3">
        {Array.from({ length: colonnes }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "h-4",
              i === 0
                ? "w-36 sm:w-44"
                : i === colonnes - 1
                  ? "ml-auto w-16"
                  : "w-24 sm:w-28",
            )}
          />
        ))}
      </div>

      {/* Lignes de données */}
      <div className="divide-y divide-border/60">
        {Array.from({ length: lignes }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-4 py-3.5 transition-colors"
            style={{ opacity: Math.max(0.4, 1 - index * 0.1) }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="h-4 w-32 sm:w-48" />
            </div>
            {colonnes > 2 && <Skeleton className="h-4 w-20 sm:w-28" />}
            {colonnes > 3 && (
              <Skeleton className="hidden sm:block h-4 w-24 sm:w-32" />
            )}
            {colonnes > 4 && (
              <Skeleton className="hidden md:block h-4 w-20" />
            )}
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Chargement d'une grille de cartes KPI (Tableau de bord). */
export function SquelettesCartes({ nombre = 4 }: { nombre?: number }) {
  return (
    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: nombre }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border bg-card p-3.5 sm:p-5 shadow-xs flex items-start justify-between gap-3"
        >
          <div className="space-y-2 flex-1 min-w-0">
            <Skeleton className="h-3.5 w-24 sm:w-28" />
            <Skeleton className="h-7 w-20 sm:w-24" />
            <Skeleton className="h-3 w-32 sm:w-36" />
          </div>
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Chargement complet du tableau de bord (cartes KPI + listes alertes/mouvements). */
export function SqueletteDashboard() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <SquelettesCartes />
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2.5">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Chargement de la fiche détaillée d'un appareil (/telephones/[id]). */
export function SqueletteFicheDetail() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Bouton retour + Titre */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-36 rounded-md" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-40 rounded-md" />
      </div>

      {/* Grille 2 colonnes */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4 sm:space-y-6">
          {/* Carte Actions */}
          <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4 shadow-xs">
            <Skeleton className="h-5 w-24" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          </div>

          {/* Carte Identification */}
          <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-3.5 shadow-xs">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between py-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>

          {/* Carte Commercial */}
          <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-3.5 shadow-xs">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between py-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Historique droite */}
        <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4 shadow-xs">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Chargement d'un formulaire de saisie ou d'entrée de stock (/telephones/nouveau). */
export function SqueletteFormulaire({
  champs = 6,
  className,
}: {
  champs?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-7 w-56 sm:h-8 sm:w-72" />
        <Skeleton className="h-4 w-80 sm:w-96" />
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-5 shadow-xs">
          <Skeleton className="h-5 w-28" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>

          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4 shadow-xs">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-3">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Chargement de la grille de boutiques (/boutiques). */
export function SqueletteGrilleBoutiques() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <SqueletteTitrePage />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3.5 w-48" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex gap-6 pt-2">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
            <div className="flex gap-2 border-t pt-4">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Chargement de la page Mon compte (/mon-compte). */
export function SqueletteMonCompte() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40 sm:h-8 sm:w-48" />
        <Skeleton className="h-4 w-60" />
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-3.5 shadow-xs">
        <Skeleton className="h-5 w-32" />
        <div className="flex justify-between py-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="flex justify-between py-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4 shadow-xs">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4 shadow-xs">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
    </div>
  );
}

/** Chargement de la page Abonnement (/mon-compte/abonnement). */
export function SqueletteAbonnement() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-8 w-72 sm:w-96" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-xs flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-60" />
          <Skeleton className="h-3.5 w-full max-w-lg" />
        </div>
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-10 w-72 rounded-xl" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-6 shadow-xs">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-9 w-32 pt-2" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-6 shadow-xs">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-9 w-32 pt-2" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
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
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
      <p className="text-sm font-medium text-destructive">
        {t("commun.chargementEchoue")}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onReessayer && (
        <button
          type="button"
          onClick={onReessayer}
          className="mt-3 text-sm font-medium text-primary underline underline-offset-4"
        >
          {t("commun.reessayer")}
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
  const { libelleStatut } = useI18n();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        couleursStatuts[statut],
        className,
      )}
    >
      {libelleStatut(statut)}
    </span>
  );
}

/** Pastille du type de mouvement. */
export function PastilleMouvement({ type }: { type: TypeMouvement }) {
  const { libelleMouvement } = useI18n();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        couleursMouvements[type],
      )}
    >
      {libelleMouvement(type)}
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
