import { fr } from "@/lib/i18n/dictionnaires/fr";
import { en } from "@/lib/i18n/dictionnaires/en";

/**
 * Nettoie et formate un Numéro d'Identification Unique (NIU / Identifiant fiscal) :
 * - Suppression de tous les espaces
 * - Conversion automatique en majuscules
 */
export function nettoyerNiu(val: string): string {
  if (!val) return "";
  return val.replace(/\s+/g, "").toUpperCase();
}

/**
 * Valide la conformité du NIU :
 * - Format HARMONY (DGI Cameroun / CEMAC) : 14 caractères (1 lettre statut + 12 chiffres + 1 clé alphanumérique)
 * - Format ATOM (DGI Cameroun nouveau) : 14 chiffres consécutifs
 * - Format Bénin / Congo (IFU / NIU) : 13 chiffres consécutifs
 * - Format Côte d'Ivoire (NCC) : 7 chiffres + 1 lettre clé
 * - Format Sénégal (NINEA) : 9 chiffres + 1 à 3 caractères
 */
export function validerNiu(
  val: string,
  lang: "fr" | "en" = "fr",
): { valide: boolean; erreur?: string } {
  const dict = lang === "en" ? en : fr;
  const nettoye = nettoyerNiu(val);

  if (!nettoye) {
    return {
      valide: false,
      erreur: dict.boutiques.niuRequis,
    };
  }

  const estHarmony = /^[A-Z][0-9]{12}[A-Z0-9]$/.test(nettoye);
  const estAtom = /^[0-9]{14}$/.test(nettoye);
  const estIfuCongo = /^[0-9]{13}$/.test(nettoye);
  const estNccCI = /^(?:[A-Z]{2})?[0-9]{7}[A-Z]$/.test(nettoye);
  const estNineaSN = /^[0-9]{9}[A-Z0-9]{1,3}$/.test(nettoye);

  if (!estHarmony && !estAtom && !estIfuCongo && !estNccCI && !estNineaSN) {
    return {
      valide: false,
      erreur: dict.boutiques.niuInvalide,
    };
  }

  return { valide: true };
}

/**
 * Nettoie et normalise un numéro de Registre du Commerce et du Crédit Mobilier (RCCM) :
 * - Conversion en majuscules
 * - Suppression des espaces parasites autour des séparateurs '/' et '-'
 * - Remplacement des espaces multiples par un seul
 */
export function nettoyerRccm(val: string): string {
  if (!val) return "";
  return val
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/\s*([\/\-])\s*/g, "$1")
    .trim();
}

/**
 * Valide la conformité du RCCM :
 * - Format Greffe OHADA usuel : RC/DLA/2023/B/1234, RC/YAO/2021/A/567
 * - Format normalisé Fichier Régional OHADA : CM-DLA-2023-B-1234, CI-ABJ-2020-B-12345
 * - Types acceptés : A (Personne physique/ETS), B (Personne morale/Société), M (Modificatif)
 */
export function validerRccm(
  val: string,
  lang: "fr" | "en" = "fr",
): { valide: boolean; erreur?: string } {
  const dict = lang === "en" ? en : fr;
  const nettoye = nettoyerRccm(val);

  if (!nettoye) {
    return {
      valide: false,
      erreur: dict.boutiques.rccmRequis,
    };
  }

  const pattern =
    /^(?:(?:RC|RCCM|[A-Z]{2})[\/\-])?[A-Z]{2,5}(?:[\/\-]\d{1,2})?[\/\-](?:19|20)?\d{2}[\/\-][ABM][\/\-]\d{1,7}$/;

  if (!pattern.test(nettoye)) {
    return {
      valide: false,
      erreur: dict.boutiques.rccmInvalide,
    };
  }

  return { valide: true };
}
