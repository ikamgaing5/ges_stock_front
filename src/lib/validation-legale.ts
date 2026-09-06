/**
 * Utilitaires de formatage et de validation légale : NIU et RCCM (Espace OHADA / CEMAC / DGI).
 */

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
  lang: "fr" | "en" = "fr"
): { valide: boolean; erreur?: string } {
  const nettoye = nettoyerNiu(val);

  if (!nettoye) {
    return {
      valide: false,
      erreur:
        lang === "en"
          ? "Unique Tax ID (NIU) is required."
          : "Le Numéro d'Identification Unique (NIU) est obligatoire.",
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
      erreur:
        lang === "en"
          ? "Invalid NIU format (e.g., M052012345678X or 14 digits)."
          : "Format NIU non conforme (ex: M052012345678X ou 14 chiffres).",
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
  lang: "fr" | "en" = "fr"
): { valide: boolean; erreur?: string } {
  const nettoye = nettoyerRccm(val);

  if (!nettoye) {
    return {
      valide: false,
      erreur:
        lang === "en"
          ? "Trade Register (RCCM) is required."
          : "Le registre de commerce (RCCM) est obligatoire.",
    };
  }

  const pattern =
    /^(?:(?:RC|RCCM|[A-Z]{2})[\/\-])?[A-Z]{2,5}(?:[\/\-]\d{1,2})?[\/\-](?:19|20)?\d{2}[\/\-][ABM][\/\-]\d{1,7}$/;

  if (!pattern.test(nettoye)) {
    return {
      valide: false,
      erreur:
        lang === "en"
          ? "Invalid RCCM format (e.g., RC/DLA/2023/B/1234 or CM-DLA-2023-B-1234)."
          : "Format RCCM non conforme (ex: RC/DLA/2023/B/1234 ou CM-DLA-2023-B-1234).",
    };
  }

  return { valide: true };
}
