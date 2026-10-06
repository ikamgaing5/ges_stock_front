/**
 * Module de validation des moyens de paiement (Cartes bancaires & Mobile Money) :
 * - Somme de contrôle selon l'algorithme de Luhn (ISO/IEC 7812)
 * - Détection automatique du réseau (Visa, Mastercard)
 * - Contrôle dynamique du numéro, titulaire, date d'expiration et cryptogramme visuel
 * - Contrôle dynamique des numéros Mobile Money (Orange Money & MTN MoMo)
 */

/**
 * Valide un numéro de carte bancaire avec l'algorithme de Luhn.
 * Détecte les fautes de frappe, chiffres inversés ou numéros fictifs.
 */
export function validerLuhn(numero: string): boolean {
  const chiffres = numero.replace(/\D/g, "");
  const longueur = chiffres.length;

  if (longueur < 13 || longueur > 19) {
    return false;
  }

  let somme = 0;
  let estPair = false;

  for (let i = longueur - 1; i >= 0; i--) {
    let chiffre = parseInt(chiffres[i], 10);

    if (estPair) {
      chiffre *= 2;
      if (chiffre > 9) {
        chiffre -= 9;
      }
    }

    somme += chiffre;
    estPair = !estPair;
  }

  return somme % 10 === 0;
}

/**
 * Détecte la marque d'une carte à partir de ses premiers chiffres (IIN / BIN).
 */
export function detecterMarqueCarte(
  numero: string
): "visa" | "mastercard" | "autre" | null {
  const chiffres = numero.replace(/\D/g, "");
  if (!chiffres) return null;

  // Visa : commence par 4
  if (chiffres.startsWith("4")) {
    return "visa";
  }

  // Mastercard : commence par 51-55 ou 2221-2720
  const prefixe2 = parseInt(chiffres.slice(0, 2), 10);
  const prefixe4 = parseInt(chiffres.slice(0, 4), 10);

  if (
    (prefixe2 >= 51 && prefixe2 <= 55) ||
    (prefixe4 >= 2221 && prefixe4 <= 2720)
  ) {
    return "mastercard";
  }

  return "autre";
}

/**
 * Validation dynamique complète d'un numéro de carte.
 */
export function validerNumeroCarte(numero: string): {
  valide: boolean;
  complet: boolean;
  erreur?: string;
  marque: "visa" | "mastercard" | "autre" | null;
} {
  const chiffres = numero.replace(/\D/g, "");
  const marque = detecterMarqueCarte(chiffres);

  if (!chiffres) {
    return {
      valide: false,
      complet: false,
      erreur: "Le numéro de carte bancaire est obligatoire.",
      marque: null,
    };
  }

  if (chiffres.length < 16) {
    return {
      valide: false,
      complet: false,
      erreur: `Numéro incomplet (${chiffres.length}/16 chiffres saisis).`,
      marque,
    };
  }

  if (chiffres.length > 16) {
    return {
      valide: false,
      complet: false,
      erreur: "Le numéro de carte ne doit pas dépasser 16 chiffres.",
      marque,
    };
  }

  if (!validerLuhn(chiffres)) {
    return {
      valide: false,
      complet: true,
      erreur: "Numéro de carte bancaire invalide (clé de contrôle de sécurité erronée).",
      marque,
    };
  }

  return {
    valide: true,
    complet: true,
    marque,
  };
}

/**
 * Valide dynamiquement le nom du titulaire sur la carte.
 */
export function validerNomTitulaire(nom: string): {
  valide: boolean;
  erreur?: string;
} {
  const nettoye = nom.trim();

  if (!nettoye) {
    return {
      valide: false,
      erreur: "Le nom du titulaire sur la carte est obligatoire.",
    };
  }

  if (nettoye.length < 3) {
    return {
      valide: false,
      erreur: "Le nom doit comporter au moins 3 caractères.",
    };
  }

  if (!/^[a-zA-ZÀ-ÿ\s'.-]+$/.test(nettoye)) {
    return {
      valide: false,
      erreur: "Le nom ne doit comporter que des lettres (pas de chiffres ou symboles).",
    };
  }

  return { valide: true };
}

/**
 * Valide que la date d'expiration (MM/AA) est valide et non échue dans le passé.
 */
export function validerDateExpiration(expiration: string): {
  valide: boolean;
  erreur?: string;
} {
  const texte = expiration.trim();

  if (!texte) {
    return {
      valide: false,
      erreur: "La date d'expiration est obligatoire.",
    };
  }

  const match = texte.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);
  if (!match) {
    if (texte.length >= 2) {
      const mois = parseInt(texte.slice(0, 2), 10);
      if (mois < 1 || mois > 12) {
        return {
          valide: false,
          erreur: "Le mois d'expiration doit être compris entre 01 et 12.",
        };
      }
    }
    return {
      valide: false,
      erreur: "Format d'expiration invalide (format attendu : MM/AA).",
    };
  }

  const mois = parseInt(match[1], 10);
  const annee = 2000 + parseInt(match[2], 10);

  const maintenant = new Date();
  const anneeCourante = maintenant.getFullYear();
  const moisCourant = maintenant.getMonth() + 1; // 1-12

  if (annee < anneeCourante || (annee === anneeCourante && mois < moisCourant)) {
    return {
      valide: false,
      erreur: "La date d'expiration de la carte est dépassée.",
    };
  }

  if (annee > anneeCourante + 20) {
    return {
      valide: false,
      erreur: "Date d'expiration trop lointaine (maximum 20 ans).",
    };
  }

  return { valide: true };
}

/**
 * Valide dynamiquement le code CVV/CVC.
 */
export function validerCvv(cvv: string): {
  valide: boolean;
  erreur?: string;
} {
  const chiffres = cvv.replace(/\D/g, "");

  if (!chiffres) {
    return {
      valide: false,
      erreur: "Le code de sécurité (CVC/CVV) est obligatoire.",
    };
  }

  if (chiffres.length < 3) {
    return {
      valide: false,
      erreur: "Le code de sécurité doit comporter 3 chiffres.",
    };
  }

  if (chiffres.length > 4) {
    return {
      valide: false,
      erreur: "Le code de sécurité ne doit pas dépasser 4 chiffres.",
    };
  }

  return { valide: true };
}

/**
 * Valide dynamiquement un numéro Mobile Money camerounais (Orange Money & MTN MoMo).
 */
export function validerTelephoneMobileMoney(
  telephone: string,
  operateur: "orange_money" | "mtn_momo"
): {
  valide: boolean;
  erreur?: string;
  avertissement?: string;
} {
  const chiffres = telephone.replace(/\D/g, "");

  if (!chiffres) {
    return {
      valide: false,
      erreur: "Le numéro de téléphone est obligatoire.",
    };
  }

  const suffixe = chiffres.length >= 9 ? chiffres.slice(-9) : chiffres;

  if (suffixe.length < 9) {
    return {
      valide: false,
      erreur: `Numéro incomplet (${suffixe.length}/9 chiffres requis).`,
    };
  }

  // Détection opérateur par préfixe camerounais (9 chiffres commençant par 6)
  if (suffixe.startsWith("6")) {
    const p2 = suffixe.slice(0, 2);
    const p3 = suffixe.slice(0, 3);

    const estOrange =
      p2 === "69" ||
      ["655", "656", "657", "658", "659"].includes(p3);

    const estMtn =
      p2 === "67" ||
      p2 === "68" ||
      ["650", "651", "652", "653", "654"].includes(p3);

    if (operateur === "orange_money" && estMtn) {
      return {
        valide: true,
        avertissement: "Ce numéro semble correspondre au réseau MTN MoMo plutôt qu'Orange Money.",
      };
    }

    if (operateur === "mtn_momo" && estOrange) {
      return {
        valide: true,
        avertissement: "Ce numéro semble correspondre au réseau Orange Money plutôt que MTN MoMo.",
      };
    }
  }

  return { valide: true };
}
