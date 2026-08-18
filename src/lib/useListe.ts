"use client";

/**
 * Charge une liste depuis l'API, avec annulation de la requête précédente.
 *
 * Le problème qu'il résout : sur un écran filtré, taper « sam-s-u-n-g »
 * lance plusieurs recherches. Rien ne garantit qu'elles reviennent dans
 * l'ordre ; une réponse lente partie plus tôt peut arriver après une
 * réponse rapide et réafficher un résultat périmé. Chaque nouvelle
 * demande annule donc la précédente.
 *
 * Le délai (`attente`) évite en plus d'interroger le serveur à chaque
 * lettre : moins de requêtes, moins de charge quand plusieurs personnes
 * cherchent en même temps.
 *
 * Utilisation :
 *
 *   const { donnees, chargement, erreur, recharger } = useListe(
 *     (signal) => api.get<{ data: Produit[] }>("/produits", { recherche }, signal),
 *     [recherche],
 *   );
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ErreurApi, estAnnulation } from "@/lib/api";

export function useListe<T>(
  charger: (signal: AbortSignal) => Promise<T>,
  dependances: unknown[],
  options: { attente?: number } = {},
) {
  const { attente = 0 } = options;

  const [donnees, setDonnees] = useState<T | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // `charger` est recréée à chaque rendu par l'appelant : on la garde dans
  // une référence pour ne pas relancer l'effet sans raison.
  //
  // La mise à jour se fait dans un effet, jamais pendant le rendu : React
  // interdit d'écrire dans une référence en plein rendu, car le rendu peut
  // être abandonné et rejoué. Cet effet est déclaré AVANT celui qui charge,
  // il s'exécute donc en premier et la référence est toujours à jour.
  const fonction = useRef(charger);

  useEffect(() => {
    fonction.current = charger;
  });

  // Force un rechargement à la demande, sans changer les dépendances.
  const [compteur, setCompteur] = useState(0);
  const recharger = useCallback(() => setCompteur((n) => n + 1), []);

  useEffect(() => {
    const controleur = new AbortController();

    const lancer = async () => {
      setErreur(null);

      try {
        const resultat = await fonction.current(controleur.signal);
        setDonnees(resultat);
        setChargement(false);
      } catch (e) {
        // Une requête annulée a été remplacée par une plus récente :
        // ne rien afficher, et surtout ne pas arrêter le chargement.
        if (estAnnulation(e)) return;

        setErreur(e instanceof ErreurApi ? e.resume() : "Erreur inconnue.");
        setChargement(false);
      }
    };

    const minuteur = setTimeout(() => void lancer(), attente);

    return () => {
      clearTimeout(minuteur);
      controleur.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependances, compteur, attente]);

  return { donnees, chargement, erreur, recharger };
}
