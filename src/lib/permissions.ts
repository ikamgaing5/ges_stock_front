/**
 * Ce que chaque rôle peut faire, côté interface.
 *
 * ATTENTION : ceci sert uniquement à masquer les boutons d'actions
 * impossibles. La vraie sécurité est appliquée par le backend
 * (backend/app/Policies/). Les deux doivent rester cohérents : si tu
 * changes une règle ici, change-la aussi là-bas.
 */

import type { Role } from "@/types";

export const permissions = {
  /** Créer, modifier, supprimer des boutiques */
  gererBoutiques: (role: Role) => role === "proprietaire",

  /** Créer et modifier les comptes des employés */
  gererEmployes: (role: Role) => role === "proprietaire",

  /** Voir la liste de l'équipe */
  voirEquipe: (role: Role) => role === "proprietaire" || role === "secretaire",

  /** Ajouter un appareil au parc, compléter une fiche */
  saisirAppareils: (role: Role) => role !== "admin",

  /** Supprimer un appareil ou un modèle du catalogue */
  supprimer: (role: Role) => role === "proprietaire",

  /** Vendre, réserver, envoyer en SAV, déclarer une perte */
  bougerStock: (role: Role) => role === "proprietaire" || role === "vendeuse",

  /** Déplacer un appareil vers une autre boutique */
  transferer: (role: Role) => role === "proprietaire" || role === "vendeuse",

  /** Rattraper un statut incohérent */
  corriger: (role: Role) => role === "proprietaire",

  /** Accéder à l'espace d'administration de la plateforme */
  administrer: (role: Role) => role === "admin",
} as const;
