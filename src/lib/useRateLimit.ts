"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ErreurApi } from "./api";

export interface OptionsRateLimit {
  /** Durée initiale en secondes (par défaut 0). */
  initialSecondes?: number;
  /** Callback exécuté lorsque le compte à rebours se termine. */
  auDeblocage?: () => void;
}

export interface RetourRateLimit {
  /** Nombre de secondes restantes (décrémenté chaque seconde). */
  secondes: number;
  /** Vaut true si l'action est actuellement bloquée par le rate limiting. */
  estBloque: boolean;
  /** Message d'erreur associé au blocage si renseigné. */
  message: string | null;
  /** Démarre le compte à rebours pour un nombre précis de secondes. */
  demarrer: (secondes: number, message?: string | null) => void;
  /** Arrête immédiatement le compte à rebours et débloque le bouton. */
  arreter: () => void;
  /**
   * Analyse une erreur attrapée. Si c'est un 429 ou un rate limit,
   * démarre automatiquement le compte à rebours et renvoie true.
   */
  gererErreur: (erreur: unknown, fallbackSecondes?: number) => boolean;
  /**
   * Aide au libellé de bouton : affiche le texte d'attente avec les secondes
   * restantes si bloqué, sinon le libellé normal.
   */
  texteBouton: (texteNormal: string, prefixeAttente?: string) => string;
}

/**
 * Hook gérant le décompte dynamique du rate limiting en direct sur la vue.
 *
 * Décrémente automatiquement les secondes restantes chaque seconde et
 * fournit un état booléen `estBloque` pour désactiver les boutons d'action.
 */
export function useRateLimit(options: OptionsRateLimit = {}): RetourRateLimit {
  const { initialSecondes = 0, auDeblocage } = options;
  const [secondes, setSecondes] = useState<number>(initialSecondes);
  const [message, setMessage] = useState<string | null>(null);
  const callbackRef = useRef(auDeblocage);

  useEffect(() => {
    callbackRef.current = auDeblocage;
  }, [auDeblocage]);

  useEffect(() => {
    if (secondes <= 0) {
      return;
    }

    const minuteur = setInterval(() => {
      setSecondes((actuelles) => {
        if (actuelles <= 1) {
          clearInterval(minuteur);
          if (callbackRef.current) {
            callbackRef.current();
          }
          return 0;
        }
        return actuelles - 1;
      });
    }, 1000);

    return () => clearInterval(minuteur);
  }, [secondes]);

  const demarrer = useCallback((sec: number, msg: string | null = null) => {
    const secValides = Math.max(1, Math.ceil(sec));
    setSecondes(secValides);
    if (msg !== undefined) {
      setMessage(msg);
    }
  }, []);

  const arreter = useCallback(() => {
    setSecondes(0);
    setMessage(null);
  }, []);

  const gererErreur = useCallback(
    (erreur: unknown, fallbackSecondes = 60): boolean => {
      if (erreur instanceof ErreurApi && erreur.estRateLimit()) {
        const sec = erreur.secondesRestantes(fallbackSecondes);
        demarrer(sec, erreur.message);
        return true;
      }
      return false;
    },
    [demarrer],
  );

  const texteBouton = useCallback(
    (texteNormal: string, prefixeAttente = "Réessayer dans"): string => {
      if (secondes > 0) {
        return `${prefixeAttente} (${secondes}s)`;
      }
      return texteNormal;
    },
    [secondes],
  );

  return {
    secondes,
    estBloque: secondes > 0,
    message,
    demarrer,
    arreter,
    gererErreur,
    texteBouton,
  };
}
