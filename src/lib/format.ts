/** Libellés et mises en forme réutilisés dans toute l'interface. */

import type {
  EtatTelephone,
  Role,
  StatutAbonnement,
  StatutTelephone,
  TypeMouvement,
} from "@/types";
import type { Langue } from "@/lib/i18n/types";
import { formaterMontantAvecConversion } from "@/lib/devises";

/** 185000 -> « 185 000 FCFA » (XAF) ou « 282,03 € » (EUR) */
export function formaterMontant(
  valeur: number,
  devise = "XAF",
  lang: Langue = "fr",
  deviseSource?: string,
): string {
  return formaterMontantAvecConversion(
    valeur,
    deviseSource ?? devise,
    devise,
    lang,
  );
}

export function formaterNombre(valeur: number, lang: Langue = "fr"): string {
  const locale = lang === "en" ? "en-US" : "fr-FR";
  return new Intl.NumberFormat(locale).format(valeur);
}

/** « 2026-08-13T05:42:31Z » -> « 13/08/2026 05:42 » */
export function formaterDate(iso: string, lang: Langue = "fr"): string {
  const locale = lang === "en" ? "en-US" : "fr-FR";
  return new Date(iso).toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** « 2026-12-31 » -> « 31 décembre 2026 » (FR) / « December 31, 2026 » (EN) */
export function formaterDateCourte(iso: string, lang: Langue = "fr"): string {
  const locale = lang === "en" ? "en-US" : "fr-FR";
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const libellesRoles: Record<Role, string> = {
  admin: "Administrateur",
  proprietaire: "Propriétaire",
  vendeuse: "Vendeuse",
  secretaire: "Secrétaire",
};

export const descriptionsRoles: Record<Role, string> = {
  admin: "Exploite la plateforme",
  proprietaire: "Gère ses boutiques et son équipe",
  vendeuse: "Enregistre les entrées et les ventes",
  secretaire: "Consulte le parc et complète les fiches",
};

export const libellesStatuts: Record<StatutTelephone, string> = {
  en_stock: "En stock",
  reserve: "Réservé",
  vendu: "Vendu",
  sav: "En réparation",
  perdu: "Perdu",
};

export const libellesEtats: Record<EtatTelephone, string> = {
  neuf: "Neuf",
  occasion: "Occasion",
  reconditionne: "Reconditionné",
};

export const libellesMouvements: Record<TypeMouvement, string> = {
  entree: "Entrée",
  vente: "Vente",
  retour: "Retour client",
  reservation: "Réservation",
  transfert: "Transfert",
  sav: "Réparation",
  perte: "Perte",
  correction: "Correction",
};

export const libellesAbonnements: Record<StatutAbonnement, string> = {
  essai: "Période d'essai",
  actif: "Abonnement actif",
  suspendu: "Suspendu",
  expire: "Expiré",
};

/**
 * Classes de couleur par statut.
 *
 * Le vert, l'ambre et le rouge sont réservés aux statuts : c'est leur
 * seul emploi dans l'application, pour qu'une couleur ne signifie
 * jamais deux choses différentes.
 */
export const couleursStatuts: Record<StatutTelephone, string> = {
  en_stock: "bg-statut-ok-fond text-statut-ok",
  reserve: "bg-statut-attente-fond text-statut-attente",
  vendu: "bg-statut-neutre-fond text-statut-neutre",
  sav: "bg-statut-attente-fond text-statut-attente",
  perdu: "bg-statut-alerte-fond text-statut-alerte",
};

export const couleursMouvements: Record<TypeMouvement, string> = {
  entree: "bg-statut-ok-fond text-statut-ok",
  vente: "bg-accent text-accent-foreground",
  retour: "bg-statut-attente-fond text-statut-attente",
  reservation: "bg-statut-attente-fond text-statut-attente",
  transfert: "bg-statut-neutre-fond text-statut-neutre",
  sav: "bg-statut-attente-fond text-statut-attente",
  perte: "bg-statut-alerte-fond text-statut-alerte",
  correction: "bg-statut-alerte-fond text-statut-alerte",
};

export const couleursAbonnements: Record<StatutAbonnement, string> = {
  essai: "bg-statut-attente-fond text-statut-attente",
  actif: "bg-statut-ok-fond text-statut-ok",
  suspendu: "bg-statut-alerte-fond text-statut-alerte",
  expire: "bg-statut-alerte-fond text-statut-alerte",
};
