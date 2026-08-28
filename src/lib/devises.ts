/**
 * Configuration et moteur de conversion des devises.
 * La devise de référence interne est le XAF (Franc CFA BEAC).
 */

export interface DeviseConfig {
  code: string;
  nom: string;
  nomEn: string;
  symbole: string;
  decimales: number;
  /** Taux par rapport au XAF : 1 unité de cette devise = XAF équivalent. */
  taux: number;
}

export const DEVISES: DeviseConfig[] = [
  {
    code: "XAF",
    nom: "Franc CFA (CEMAC)",
    nomEn: "Central African CFA Franc",
    symbole: "FCFA",
    decimales: 0,
    taux: 1.0,
  },
  {
    code: "XOF",
    nom: "Franc CFA (UEMOA)",
    nomEn: "West African CFA Franc",
    symbole: "FCFA",
    decimales: 0,
    taux: 1.0,
  },
  {
    code: "EUR",
    nom: "Euro",
    nomEn: "Euro",
    symbole: "€",
    decimales: 2,
    taux: 655.957,
  },
  {
    code: "USD",
    nom: "Dollar américain",
    nomEn: "US Dollar",
    symbole: "$",
    decimales: 2,
    taux: 610.0,
  },
  {
    code: "CAD",
    nom: "Dollar canadien",
    nomEn: "Canadian Dollar",
    symbole: "$ CA",
    decimales: 2,
    taux: 445.0,
  },
  {
    code: "GBP",
    nom: "Livre sterling",
    nomEn: "British Pound",
    symbole: "£",
    decimales: 2,
    taux: 790.0,
  },
  {
    code: "CHF",
    nom: "Franc suisse",
    nomEn: "Swiss Franc",
    symbole: "CHF",
    decimales: 2,
    taux: 695.0,
  },
  {
    code: "AED",
    nom: "Dirham des Émirats",
    nomEn: "UAE Dirham",
    symbole: "AED",
    decimales: 2,
    taux: 166.0,
  },
  {
    code: "CNY",
    nom: "Yuan chinois",
    nomEn: "Chinese Yuan",
    symbole: "¥",
    decimales: 2,
    taux: 84.0,
  },
  {
    code: "MAD",
    nom: "Dirham marocain",
    nomEn: "Moroccan Dirham",
    symbole: "MAD",
    decimales: 2,
    taux: 61.5,
  },
  {
    code: "GNF",
    nom: "Franc guinéen",
    nomEn: "Guinean Franc",
    symbole: "GNF",
    decimales: 0,
    taux: 0.071,
  },
  {
    code: "CDF",
    nom: "Franc congolais",
    nomEn: "Congolese Franc",
    symbole: "CDF",
    decimales: 0,
    taux: 0.22,
  },
  {
    code: "NGN",
    nom: "Naira nigérian",
    nomEn: "Nigerian Naira",
    symbole: "₦",
    decimales: 0,
    taux: 0.41,
  },
];

const DEVISES_MAP = new Map<string, DeviseConfig>(
  DEVISES.map((d) => [d.code.toUpperCase(), d]),
);

/**
 * Récupère la configuration d'une devise par son code.
 * Repli sur XAF si inconnu.
 */
export function obtenirDevise(code?: string): DeviseConfig {
  if (!code) return DEVISES[0];
  const cfg = DEVISES_MAP.get(code.toUpperCase().trim());
  return (
    cfg ?? {
      code: code.toUpperCase(),
      nom: code.toUpperCase(),
      nomEn: code.toUpperCase(),
      symbole: code.toUpperCase(),
      decimales: 0,
      taux: 1.0,
    }
  );
}

/**
 * Convertit un montant numérique d'une devise source vers une devise cible.
 */
export function convertirMontant(
  montant: number,
  deDevise = "XAF",
  versDevise = "XAF",
): number {
  if (
    montant === undefined ||
    montant === null ||
    isNaN(montant) ||
    !isFinite(montant)
  ) {
    return 0;
  }

  const de = deDevise.toUpperCase().trim();
  const vers = versDevise.toUpperCase().trim();

  if (de === vers) {
    return montant;
  }

  const configDe = obtenirDevise(de);
  const configVers = obtenirDevise(vers);

  if (configVers.taux <= 0) {
    return montant;
  }

  // 1. Passage en XAF
  const enXAF = montant * configDe.taux;
  // 2. Passage en devise cible
  const resultat = enXAF / configVers.taux;

  return resultat;
}

/**
 * Formate un montant dans la devise d'affichage avec conversion automatique.
 */
export function formaterMontantAvecConversion(
  montant: number,
  deviseSource = "XAF",
  deviseAffichage = "XAF",
  lang: "fr" | "en" = "fr",
): string {
  if (
    montant === undefined ||
    montant === null ||
    isNaN(montant) ||
    !isFinite(montant)
  ) {
    return `0 ${obtenirDevise(deviseAffichage).symbole}`;
  }

  const montantConverti = convertirMontant(montant, deviseSource, deviseAffichage);
  const configCible = obtenirDevise(deviseAffichage);

  const locale = lang === "en" ? "en-US" : "fr-FR";
  const arrondi =
    configCible.decimales === 0
      ? Math.round(montantConverti)
      : Number(montantConverti.toFixed(configCible.decimales));

  const formatteur = new Intl.NumberFormat(locale, {
    minimumFractionDigits: configCible.decimales,
    maximumFractionDigits: configCible.decimales,
  });

  return `${formatteur.format(arrondi)} ${configCible.symbole}`;
}
