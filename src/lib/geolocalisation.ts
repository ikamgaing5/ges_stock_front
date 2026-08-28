/**
 * Détection de la devise en fonction de la localisation IP de l'utilisateur.
 * 100% gratuit, sans clé d'API, avec mise en cache locale dans le navigateur.
 */

const CLE_PAYS_DETECTE = "gestion-stock-pays-detecte";
const CLE_DEVISE_DETECTEE = "gestion-stock-devise-detectee";

/**
 * Correspondance entre codes pays ISO (alpha-2) et les devises supportées.
 */
export const PAYS_VERS_DEVISE: Record<string, string> = {
  // Zone CEMAC (Franc CFA BEAC)
  CM: "XAF", // Cameroun
  GA: "XAF", // Gabon
  CG: "XAF", // République du Congo
  TD: "XAF", // Tchad
  CF: "XAF", // République centrafricaine
  GQ: "XAF", // Guinée équatoriale

  // Zone UEMOA (Franc CFA BCEAO)
  CI: "XOF", // Côte d'Ivoire
  SN: "XOF", // Sénégal
  ML: "XOF", // Mali
  BF: "XOF", // Burkina Faso
  BJ: "XOF", // Bénin
  TG: "XOF", // Togo
  NE: "XOF", // Niger
  GW: "XOF", // Guinée-Bissau

  // Afrique subsaharienne & du Nord
  CD: "CDF", // République Démocratique du Congo
  GN: "GNF", // Guinée (Conakry)
  NG: "NGN", // Nigeria
  MA: "MAD", // Maroc

  // Moyen-Orient & Asie
  AE: "AED", // Émirats arabes unis (Dubaï)
  CN: "CNY", // Chine

  // Europe (Zone Euro)
  FR: "EUR", // France
  BE: "EUR", // Belgique
  DE: "EUR", // Allemagne
  ES: "EUR", // Espagne
  IT: "EUR", // Italie
  PT: "EUR", // Portugal
  NL: "EUR", // Pays-Bas
  LU: "EUR", // Luxembourg
  IE: "EUR", // Irlande
  AT: "EUR", // Autriche
  FI: "EUR", // Finlande
  GR: "EUR", // Grèce

  // Autres devises internationales
  GB: "GBP", // Royaume-Uni
  CH: "CHF", // Suisse
  CA: "CAD", // Canada
  US: "USD", // États-Unis
};

/**
 * Tente de détecter le pays de l'utilisateur par son adresse IP de manière transparente.
 * Utilise un délai maximal de 2,5 secondes pour ne jamais ralentir l'expérience utilisateur.
 */
export async function detecterDeviseParIP(): Promise<string> {
  // 1. Vérification du cache local
  if (typeof window !== "undefined") {
    const memorisee = window.localStorage.getItem(CLE_DEVISE_DETECTEE);
    if (memorisee) {
      return memorisee;
    }
  }

  let codePays: string | null = null;

  // 2. Appel au service gratuit GeoJS (léger, sans inscription, compatible CORS)
  try {
    const controleur = new AbortController();
    const minuteur = setTimeout(() => controleur.abort(), 2500);

    const reponse = await fetch("https://get.geojs.io/v1/ip/country.json", {
      signal: controleur.signal,
    });
    clearTimeout(minuteur);

    if (reponse.ok) {
      const donnees = (await reponse.json()) as { country?: string };
      if (donnees.country) {
        codePays = donnees.country.toUpperCase();
      }
    }
  } catch {
    // Échec ou timeout du premier service : tentative de repli
  }

  // 3. Repli de secours gratuit via ipapi.co si le premier n'a pas répondu
  if (!codePays) {
    try {
      const controleur = new AbortController();
      const minuteur = setTimeout(() => controleur.abort(), 2000);

      const reponse = await fetch("https://ipapi.co/json/", {
        signal: controleur.signal,
      });
      clearTimeout(minuteur);

      if (reponse.ok) {
        const donnees = (await reponse.json()) as { country_code?: string };
        if (donnees.country_code) {
          codePays = donnees.country_code.toUpperCase();
        }
      }
    } catch {
      // Ignorer si hors ligne
    }
  }

  // 4. Détermination de la devise à partir du pays détecté
  const devise = codePays && PAYS_VERS_DEVISE[codePays]
    ? PAYS_VERS_DEVISE[codePays]
    : "XAF";

  // 5. Mise en mémoire cache pour les prochaines visites
  if (typeof window !== "undefined" && codePays) {
    window.localStorage.setItem(CLE_PAYS_DETECTE, codePays);
    window.localStorage.setItem(CLE_DEVISE_DETECTEE, devise);
  }

  return devise;
}
