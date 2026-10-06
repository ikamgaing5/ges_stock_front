"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const CLE_URL_RETOUR = "telora_url_avant_hors_ligne";

/**
 * Surveille l'état de la connexion réseau (online/offline).
 * Dès que la connexion est perdue, redirige automatiquement vers `/hors-ligne`
 * en mémorisant l'URL précédente pour y revenir dès que le réseau revient.
 */
export function DetecteurHorsLigne() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Si on est déjà sur la page hors-ligne, ne rien faire
    if (pathname === "/hors-ligne") {
      return;
    }

    const gererPerteConnexion = () => {
      try {
        const urlActuelle = window.location.pathname + window.location.search;
        if (!urlActuelle.startsWith("/hors-ligne")) {
          sessionStorage.setItem(CLE_URL_RETOUR, urlActuelle);
          router.push("/hors-ligne");
        }
      } catch {
        router.push("/hors-ligne");
      }
    };

    // 1. Vérification immédiate au montage
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      gererPerteConnexion();
    }

    // 2. Écoute de l'événement natif 'offline' du navigateur
    window.addEventListener("offline", gererPerteConnexion);

    // 3. Écoute d'un événement custom déclenché par le client API en cas de panne totale
    window.addEventListener("telora:reseau-deconnecte", gererPerteConnexion);

    return () => {
      window.removeEventListener("offline", gererPerteConnexion);
      window.removeEventListener("telora:reseau-deconnecte", gererPerteConnexion);
    };
  }, [pathname, router]);

  return null;
}
