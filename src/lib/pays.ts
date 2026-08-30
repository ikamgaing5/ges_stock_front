/**
 * Définition et liste des pays avec indicatifs téléphoniques internationaux.
 */

export interface Pays {
  code: string; // Code ISO 3166-1 alpha-2 (ex: "CM", "CI", "FR")
  nomFr: string;
  nomEn: string;
  indicatif: string; // Ex: "+237", "+225", "+33"
  drapeau: string; // Emoji drapeau (ex: "🇨🇲")
  placeholder: string;
}

export const LISTE_PAYS: Pays[] = [
  // Afrique Centrale & de l'Ouest
  {
    code: "CM",
    nomFr: "Cameroun",
    nomEn: "Cameroon",
    indicatif: "+237",
    drapeau: "🇨🇲",
    placeholder: "6 77 11 22 33",
  },
  {
    code: "CI",
    nomFr: "Côte d'Ivoire",
    nomEn: "Ivory Coast",
    indicatif: "+225",
    drapeau: "🇨🇮",
    placeholder: "07 08 09 10 11",
  },
  {
    code: "SN",
    nomFr: "Sénégal",
    nomEn: "Senegal",
    indicatif: "+221",
    drapeau: "🇸🇳",
    placeholder: "77 123 45 67",
  },
  {
    code: "CD",
    nomFr: "RD Congo",
    nomEn: "DR Congo",
    indicatif: "+243",
    drapeau: "🇨🇩",
    placeholder: "81 234 56 78",
  },
  {
    code: "CG",
    nomFr: "Congo-Brazzaville",
    nomEn: "Congo",
    indicatif: "+242",
    drapeau: "🇨🇬",
    placeholder: "06 123 45 67",
  },
  {
    code: "GA",
    nomFr: "Gabon",
    nomEn: "Gabon",
    indicatif: "+241",
    drapeau: "🇬🇦",
    placeholder: "07 12 34 56",
  },
  {
    code: "ML",
    nomFr: "Mali",
    nomEn: "Mali",
    indicatif: "+223",
    drapeau: "🇲🇱",
    placeholder: "76 12 34 56",
  },
  {
    code: "GN",
    nomFr: "Guinée",
    nomEn: "Guinea",
    indicatif: "+224",
    drapeau: "🇬🇳",
    placeholder: "620 12 34 56",
  },
  {
    code: "BF",
    nomFr: "Burkina Faso",
    nomEn: "Burkina Faso",
    indicatif: "+226",
    drapeau: "🇧🇫",
    placeholder: "70 12 34 56",
  },
  {
    code: "BJ",
    nomFr: "Bénin",
    nomEn: "Benin",
    indicatif: "+229",
    drapeau: "🇧🇯",
    placeholder: "97 12 34 56",
  },
  {
    code: "TG",
    nomFr: "Togo",
    nomEn: "Togo",
    indicatif: "+228",
    drapeau: "🇹🇬",
    placeholder: "90 12 34 56",
  },
  {
    code: "TD",
    nomFr: "Tchad",
    nomEn: "Chad",
    indicatif: "+235",
    drapeau: "🇹🇩",
    placeholder: "66 12 34 56",
  },
  {
    code: "NE",
    nomFr: "Niger",
    nomEn: "Niger",
    indicatif: "+227",
    drapeau: "🇳🇪",
    placeholder: "90 12 34 56",
  },
  {
    code: "CF",
    nomFr: "Centrafrique",
    nomEn: "Central African Republic",
    indicatif: "+236",
    drapeau: "🇨🇫",
    placeholder: "75 12 34 56",
  },
  {
    code: "GQ",
    nomFr: "Guinée Équatoriale",
    nomEn: "Equatorial Guinea",
    indicatif: "+240",
    drapeau: "🇬🇶",
    placeholder: "222 12 34 56",
  },
  {
    code: "NG",
    nomFr: "Nigéria",
    nomEn: "Nigeria",
    indicatif: "+234",
    drapeau: "🇳🇬",
    placeholder: "803 123 4567",
  },
  {
    code: "GH",
    nomFr: "Ghana",
    nomEn: "Ghana",
    indicatif: "+233",
    drapeau: "🇬🇭",
    placeholder: "24 123 4567",
  },
  {
    code: "RW",
    nomFr: "Rwanda",
    nomEn: "Rwanda",
    indicatif: "+250",
    drapeau: "🇷🇼",
    placeholder: "788 123 456",
  },
  {
    code: "BI",
    nomFr: "Burundi",
    nomEn: "Burundi",
    indicatif: "+257",
    drapeau: "🇧🇮",
    placeholder: "79 123 456",
  },
  {
    code: "KE",
    nomFr: "Kenya",
    nomEn: "Kenya",
    indicatif: "+254",
    drapeau: "🇰🇪",
    placeholder: "712 345 678",
  },
  {
    code: "ZA",
    nomFr: "Afrique du Sud",
    nomEn: "South Africa",
    indicatif: "+27",
    drapeau: "🇿🇦",
    placeholder: "71 123 4567",
  },
  {
    code: "MG",
    nomFr: "Madagascar",
    nomEn: "Madagascar",
    indicatif: "+261",
    drapeau: "🇲🇬",
    placeholder: "34 12 345 67",
  },

  // Maghreb
  {
    code: "MA",
    nomFr: "Maroc",
    nomEn: "Morocco",
    indicatif: "+212",
    drapeau: "🇲🇦",
    placeholder: "6 12 34 56 78",
  },
  {
    code: "DZ",
    nomFr: "Algérie",
    nomEn: "Algeria",
    indicatif: "+213",
    drapeau: "🇩🇿",
    placeholder: "5 12 34 56 78",
  },
  {
    code: "TN",
    nomFr: "Tunisie",
    nomEn: "Tunisia",
    indicatif: "+216",
    drapeau: "🇹🇳",
    placeholder: "20 123 456",
  },
  {
    code: "MR",
    nomFr: "Mauritanie",
    nomEn: "Mauritania",
    indicatif: "+222",
    drapeau: "🇲🇷",
    placeholder: "45 12 34 56",
  },

  // Europe & Amérique
  {
    code: "FR",
    nomFr: "France",
    nomEn: "France",
    indicatif: "+33",
    drapeau: "🇫🇷",
    placeholder: "6 12 34 56 78",
  },
  {
    code: "BE",
    nomFr: "Belgique",
    nomEn: "Belgium",
    indicatif: "+32",
    drapeau: "🇧🇪",
    placeholder: "470 12 34 56",
  },
  {
    code: "CH",
    nomFr: "Suisse",
    nomEn: "Switzerland",
    indicatif: "+41",
    drapeau: "🇨🇭",
    placeholder: "78 123 45 67",
  },
  {
    code: "LU",
    nomFr: "Luxembourg",
    nomEn: "Luxembourg",
    indicatif: "+352",
    drapeau: "🇱🇺",
    placeholder: "621 123 456",
  },
  {
    code: "GB",
    nomFr: "Royaume-Uni",
    nomEn: "United Kingdom",
    indicatif: "+44",
    drapeau: "🇬🇧",
    placeholder: "7123 456789",
  },
  {
    code: "DE",
    nomFr: "Allemagne",
    nomEn: "Germany",
    indicatif: "+49",
    drapeau: "🇩🇪",
    placeholder: "151 12345678",
  },
  {
    code: "IT",
    nomFr: "Italie",
    nomEn: "Italy",
    indicatif: "+39",
    drapeau: "🇮🇹",
    placeholder: "312 345 6789",
  },
  {
    code: "ES",
    nomFr: "Espagne",
    nomEn: "Spain",
    indicatif: "+34",
    drapeau: "🇪🇸",
    placeholder: "612 34 56 78",
  },
  {
    code: "PT",
    nomFr: "Portugal",
    nomEn: "Portugal",
    indicatif: "+351",
    drapeau: "🇵🇹",
    placeholder: "912 345 678",
  },
  {
    code: "CA",
    nomFr: "Canada",
    nomEn: "Canada",
    indicatif: "+1",
    drapeau: "🇨🇦",
    placeholder: "514 123-4567",
  },
  {
    code: "US",
    nomFr: "États-Unis",
    nomEn: "United States",
    indicatif: "+1",
    drapeau: "🇺🇸",
    placeholder: "202 555-0123",
  },
  {
    code: "HT",
    nomFr: "Haïti",
    nomEn: "Haiti",
    indicatif: "+509",
    drapeau: "🇭🇹",
    placeholder: "34 12 3456",
  },

  // Moyen-Orient & Asie
  {
    code: "AE",
    nomFr: "Émirats Arabes Unis",
    nomEn: "United Arab Emirates",
    indicatif: "+971",
    drapeau: "🇦🇪",
    placeholder: "50 123 4567",
  },
  {
    code: "SA",
    nomFr: "Arabie Saoudite",
    nomEn: "Saudi Arabia",
    indicatif: "+966",
    drapeau: "🇸🇦",
    placeholder: "50 123 4567",
  },
  {
    code: "TR",
    nomFr: "Turquie",
    nomEn: "Turkey",
    indicatif: "+90",
    drapeau: "🇹🇷",
    placeholder: "512 345 6789",
  },
  {
    code: "CN",
    nomFr: "Chine",
    nomEn: "China",
    indicatif: "+86",
    drapeau: "🇨🇳",
    placeholder: "138 0013 8000",
  },
  {
    code: "IN",
    nomFr: "Inde",
    nomEn: "India",
    indicatif: "+91",
    drapeau: "🇮🇳",
    placeholder: "98765 43210",
  },
];

export const PAYS_PAR_DEFAUT = LISTE_PAYS[0]; // Cameroun (+237)

/**
 * Trouve un pays par son code ISO (ex: "CM", "CI").
 */
export function trouverPaysParCode(code: string): Pays {
  const codeNormalise = code.toUpperCase();
  return (
    LISTE_PAYS.find((p) => p.code === codeNormalise) ?? PAYS_PAR_DEFAUT
  );
}

/**
 * Tente de détecter le pays à partir d'un numéro international (ex: "+237677112233" -> CM).
 * Les indicatifs les plus longs sont testés en premier (+237 avant +23, etc.).
 */
export function detecterPaysDepuisNumero(numero: string): Pays | null {
  if (!numero.startsWith("+")) return null;
  const nettoye = numero.replace(/[^\d+]/g, "");

  // Tri par longueur d'indicatif décroissante pour éviter qu'un "+1" absorbe un indicatif plus spécifique
  const paysTries = [...LISTE_PAYS].sort(
    (a, b) => b.indicatif.length - a.indicatif.length,
  );

  for (const pays of paysTries) {
    if (nettoye.startsWith(pays.indicatif)) {
      return pays;
    }
  }

  return null;
}

/**
 * Décompose une valeur brute (ex: "+237677112233" ou "677112233")
 * en objet `{ pays, numeroLocal }`.
 */
export function decomposerTelephone(
  valeurBrute: string | null | undefined,
  codePaysPrefere = "CM",
): { pays: Pays; numeroLocal: string } {
  if (!valeurBrute) {
    return { pays: trouverPaysParCode(codePaysPrefere), numeroLocal: "" };
  }

  const trimmed = valeurBrute.trim();

  if (trimmed.startsWith("+")) {
    const paysDetecte = detecterPaysDepuisNumero(trimmed);
    if (paysDetecte) {
      const reste = trimmed.slice(paysDetecte.indicatif.length).trim();
      return { pays: paysDetecte, numeroLocal: reste };
    }
  }

  // Si pas de "+", on suppose le pays par défaut
  return {
    pays: trouverPaysParCode(codePaysPrefere),
    numeroLocal: trimmed,
  };
}

/**
 * Recompose le numéro au format international pour la base de données (ex: "+237677112233").
 */
export function composerTelephoneInternational(
  pays: Pays,
  numeroLocal: string,
): string {
  const chiffres = numeroLocal.replace(/[^\d]/g, "");
  if (!chiffres) return "";
  return `${pays.indicatif}${chiffres}`;
}

/**
 * Formate un numéro de téléphone pour un affichage visuel agréable (ex: "+237 6 77 11 22 33").
 */
export function formaterTelephoneVisuel(
  valeur: string | null | undefined,
): string {
  if (!valeur) return "";
  const trimmed = valeur.trim();
  if (trimmed.startsWith("+")) {
    const pays = detecterPaysDepuisNumero(trimmed);
    if (pays) {
      const reste = trimmed.slice(pays.indicatif.length).trim();
      // Regroupe les chiffres par 2 ou 3
      const espace = reste.replace(/(\d{2,3})(?=\d)/g, "$1 ");
      return `${pays.drapeau} ${pays.indicatif} ${espace}`;
    }
  }
  return trimmed;
}

