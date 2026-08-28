/**
 * Tout ce qui concerne l'IMEI.
 *
 * L'IMEI est le numéro unique gravé dans chaque téléphone : 15 chiffres,
 * dont le dernier est une clé de contrôle calculée par l'algorithme de
 * Luhn (le même que pour les cartes bancaires).
 *
 * Vérifier cette clé côté navigateur permet de refuser immédiatement un
 * scan incomplet, sans attendre le serveur. Le backend refait la même
 * vérification : ce contrôle-ci est un confort, pas une sécurité.
 */

/** Ne garde que les chiffres : une douchette peut ajouter espaces ou tirets. */
export function nettoyerImei(saisie: string): string {
  return saisie.replace(/\D/g, "");
}

/** L'IMEI est-il plausible ? 15 chiffres et clé de Luhn correcte. */
export function imeiValide(saisie: string): boolean {
  const chiffres = nettoyerImei(saisie);

  if (chiffres.length !== 15) return false;

  let somme = 0;

  // On parcourt de droite à gauche en doublant un chiffre sur deux.
  for (let position = 0; position < 15; position++) {
    let chiffre = Number(chiffres[14 - position]);

    if (position % 2 === 1) {
      chiffre *= 2;
      if (chiffre > 9) chiffre -= 9;
    }

    somme += chiffre;
  }

  return somme % 10 === 0;
}

import type { Langue } from "@/lib/i18n/types";

/**
 * Explique pourquoi une saisie est refusée, en une phrase utilisable
 * telle quelle dans l'interface.
 */
export function messageImei(saisie: string, lang: Langue = "fr"): string | null {
  const chiffres = nettoyerImei(saisie);

  if (chiffres.length === 0) return null;

  if (chiffres.length < 15) {
    return lang === "en"
      ? `${chiffres.length} digits of 15. Continue typing or scan again.`
      : `${chiffres.length} chiffres sur 15. Continuez la saisie ou rescannez.`;
  }

  if (chiffres.length > 15) {
    return lang === "en"
      ? `${chiffres.length} digits: an IMEI has exactly 15 digits.`
      : `${chiffres.length} chiffres : un IMEI en compte exactement 15.`;
  }

  if (!imeiValide(chiffres)) {
    return lang === "en"
      ? "These 15 digits do not form a valid IMEI. Please check the check digit."
      : "Ces 15 chiffres ne forment pas un IMEI valide. Vérifiez le dernier chiffre.";
  }

  return null;
}

/** 356938035643809 -> « 35 693803 564380 9 », plus facile à relire à voix haute. */
export function formaterImei(saisie: string): string {
  const c = nettoyerImei(saisie);

  if (c.length !== 15) return c;

  return `${c.slice(0, 2)} ${c.slice(2, 8)} ${c.slice(8, 14)} ${c.slice(14)}`;
}
