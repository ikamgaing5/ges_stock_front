/**
 * Surveillance de l'inactivité utilisateur.
 *
 * Déconnecte automatiquement la session après 60 minutes d'inactivité
 * (souris, clavier, tactile, défilement).
 *
 * La dernière activité est synchronisée via localStorage afin que l'activité
 * dans un onglet empêche la déconnexion dans les autres onglets ouverts.
 */

// 60 minutes en millisecondes
export const DELAI_INACTIVITE_MS = 60 * 60 * 1000;

export const CLE_DERNIERE_ACTIVITE = "gestion-stock-derniere-activite";

/** Met à jour l'horodatage de la dernière action utilisateur dans le stockage partagé. */
export function enregistrerActivite(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE_DERNIERE_ACTIVITE, Date.now().toString());
  } catch {
    // Évite de bloquer en mode navigation privée très restreint
  }
}

/** Réinitialise l'activité au moment de la connexion. */
export function reinitialiserActivite(): void {
  enregistrerActivite();
}

/** Nettoie la clé lors de la déconnexion. */
export function effacerDerniereActivite(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLE_DERNIERE_ACTIVITE);
  } catch {
    // Ignorer
  }
}

/** Vérifie si le délai d'inactivité de 60 minutes est dépassé. */
export function verifierSiInactif(delaiMs: number = DELAI_INACTIVITE_MS): boolean {
  if (typeof window === "undefined") return false;

  try {
    const enregistre = window.localStorage.getItem(CLE_DERNIERE_ACTIVITE);
    if (!enregistre) {
      // Premier chargement : on initialise
      enregistrerActivite();
      return false;
    }

    const timestamp = parseInt(enregistre, 10);
    if (isNaN(timestamp)) {
      enregistrerActivite();
      return false;
    }

    return Date.now() - timestamp > delaiMs;
  } catch {
    return false;
  }
}

/**
 * Démarre l'écoute globale de l'activité utilisateur.
 *
 * @param surInactivite Callback exécuté dès que 60 minutes d'inactivité sont constatées.
 * @param delaiMs Délai avant expiration (par défaut 60 minutes).
 * @returns Fonction pour stopper la surveillance et détacher les écouteurs.
 */
export function demarrerSurveillanceInactivite(
  surInactivite: () => void,
  delaiMs: number = DELAI_INACTIVITE_MS,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let dernierEnregistrementLocal = Date.now();
  // On ne persiste dans localStorage qu'au maximum toutes les 10 secondes pour préserver les performances
  const THROTTLE_MS = 10_000;

  function marquerActivite() {
    const maintenant = Date.now();
    if (maintenant - dernierEnregistrementLocal > THROTTLE_MS) {
      dernierEnregistrementLocal = maintenant;
      enregistrerActivite();
    }
  }

  function verifier() {
    if (verifierSiInactif(delaiMs)) {
      surInactivite();
    }
  }

  const evenements = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll",
    "click",
  ];

  evenements.forEach((nomEvent) => {
    window.addEventListener(nomEvent, marquerActivite, { passive: true });
  });

  // Vérification périodique toutes les 15 secondes
  const intervalId = window.setInterval(verifier, 15_000);

  // Vérification immédiate dès que l'onglet redevient visible ou reprend le focus
  function onVisibilite() {
    if (!document.hidden) {
      verifier();
    }
  }

  window.addEventListener("focus", verifier);
  document.addEventListener("visibilitychange", onVisibilite);

  return () => {
    evenements.forEach((nomEvent) => {
      window.removeEventListener(nomEvent, marquerActivite);
    });
    window.clearInterval(intervalId);
    window.removeEventListener("focus", verifier);
    document.removeEventListener("visibilitychange", onVisibilite);
  };
}
