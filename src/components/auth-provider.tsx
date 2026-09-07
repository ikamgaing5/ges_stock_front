"use client";

/**
 * Garde en mémoire qui est connecté et sur quelle boutique la personne
 * travaille, et rend le tout disponible partout via le hook useAuth().
 *
 *   const { utilisateur, boutiqueActive, changerBoutique } = useAuth();
 *
 * `boutiqueActive` vaut null quand un propriétaire regarde toutes ses
 * boutiques à la fois. Les pages passent cette valeur à l'API sous forme
 * de paramètre `boutique_id`.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api, effacerToken, enregistrerToken, lireToken } from "@/lib/api";
import { detecterDeviseParIP } from "@/lib/geolocalisation";
import {
  demarrerSurveillanceInactivite,
  effacerDerniereActivite,
  enregistrerActivite,
  reinitialiserActivite,
} from "@/lib/inactivite";
import type { Boutique, Utilisateur } from "@/types";

/**
 * Réponse de /login : soit un token, soit un défi de double
 * authentification. Jamais les deux.
 */
type ReponseConnexion = {
  token?: string;
  user?: Utilisateur;
  deux_facteurs_requis?: boolean;
  jeton_defi?: string;
};

const CLE_BOUTIQUE = "gestion-stock-boutique";
const CLE_DEVISE = "gestion-stock-devise-affichage";
const CLE_RETOUR = "gestion-stock-dernier-chemin";

function obtenirCookie(nom: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + nom + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function definirCookie(nom: string, valeur: string, jours: number = 7) {
  if (typeof document === "undefined") return;
  document.cookie = `${nom}=${encodeURIComponent(valeur)}; path=/; max-age=${jours * 24 * 60 * 60}; SameSite=Lax`;
}

type ContexteAuth = {
  utilisateur: Utilisateur | null;
  chargement: boolean;
  /** Les boutiques auxquelles la personne a accès. */
  boutiques: Boutique[];
  /** La boutique sélectionnée, ou null pour « toutes ». */
  boutiqueActive: Boutique | null;
  changerBoutique: (id: string | null) => void;
  /** À passer aux appels d'API : { ...parametresBoutique } */
  parametresBoutique: { boutique_id?: string };
  /** La devise à afficher (sélectionnée ou déduite de la boutique). */
  devise: string;
  /** La devise de base de la boutique active. */
  deviseBoutique: string;
  /** Permet de basculer la devise d'affichage. */
  changerDevise: (devise: string) => void;
  /**
   * Tente la connexion. Si la double authentification est active, ne
   * connecte pas encore : renvoie le jeton de défi à présenter avec le
   * code.
   */
  connexion: (
    email: string,
    motDePasse: string,
  ) => Promise<{ deuxFacteursRequis: boolean; jetonDefi?: string }>;
  connexionDeuxFacteurs: (jetonDefi: string, code: string) => Promise<void>;
  deconnexion: () => Promise<void>;
  rafraichir: () => Promise<void>;
};

const Contexte = createContext<ContexteAuth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [chargement, setChargement] = useState(true);
  const [boutiqueId, setBoutiqueId] = useState<string | null>(null);
  const router = useRouter();

  const boutiques = useMemo(
    () => utilisateur?.boutiques ?? [],
    [utilisateur],
  );

  const rafraichir = useCallback(async () => {
    if (!lireToken()) {
      setUtilisateur(null);
      setChargement(false);
      return;
    }

    try {
      const reponse = await api.get<{ user: Utilisateur }>("/me");
      setUtilisateur(reponse.user);
    } catch {
      // Token invalide ou serveur injoignable : on repart de zéro.
      effacerToken();
      setUtilisateur(null);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void rafraichir();
  }, [rafraichir]);

  // Une fois les boutiques connues, on restaure le dernier choix.
  useEffect(() => {
    if (boutiques.length === 0) {
      setBoutiqueId(null);
      return;
    }

    const memorise = String(window.localStorage.getItem(CLE_BOUTIQUE));
    const existeEncore = boutiques.some((b) => b.id === memorise);

    if (existeEncore) {
      setBoutiqueId(memorise);
    } else if (boutiques.length === 1) {
      // Une seule boutique : pas de choix à faire, on la sélectionne.
      setBoutiqueId(boutiques[0].id);
    } else {
      setBoutiqueId(null);
    }
  }, [boutiques]);

  const changerBoutique = useCallback((id: string | null) => {
    setBoutiqueId(id);

    if (id === null) {
      window.localStorage.removeItem(CLE_BOUTIQUE);
    } else {
      window.localStorage.setItem(CLE_BOUTIQUE, (id));
    }
  }, []);

  // Mémorisation en continu du chemin actif
  useEffect(() => {
    if (typeof window === "undefined" || !utilisateur) return;

    const cheminActuel = window.location.pathname + window.location.search;
    if (
      cheminActuel &&
      cheminActuel.startsWith("/") &&
      !cheminActuel.startsWith("/connexion") &&
      !cheminActuel.startsWith("/inscription") &&
      !cheminActuel.startsWith("/mot-de-passe-oublie") &&
      !cheminActuel.startsWith("/merci")
    ) {
      window.localStorage.setItem(CLE_RETOUR, cheminActuel);
      definirCookie(CLE_RETOUR, cheminActuel, 7);
    }
  });

  /** Enregistre le token et redirige automatiquement sur la dernière page consultée. */
  const ouvrirSession = useCallback(
    (token: string, user: Utilisateur, urlRetourExplicite?: string) => {
      enregistrerToken(token);
      reinitialiserActivite();
      setUtilisateur(user);

      // Résolution de l'URL de destination :
      // 1. Paramètre explicite transmis à ouvrirSession
      // 2. Paramètre ?retour= dans l'URL de connexion
      // 3. Dernier chemin mémorisé localement (localStorage / cookie)
      // 4. Dernier chemin synchronisé depuis le compte utilisateur (multi-appareils)
      // 5. Par défaut : /admin pour les admins, / pour les commerçants

      let destination = urlRetourExplicite;

      if (!destination && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        destination = params.get("retour") || undefined;
      }

      if (!destination && typeof window !== "undefined") {
        destination =
          window.localStorage.getItem(CLE_RETOUR) ||
          obtenirCookie(CLE_RETOUR) ||
          undefined;
      }

      // Nettoyer la trace de retour locale
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(CLE_RETOUR);
        definirCookie(CLE_RETOUR, "", 0);
      }

      // Validation de sécurité sur la destination
      if (
        destination &&
        destination.startsWith("/") &&
        !destination.startsWith("/connexion") &&
        !destination.startsWith("/inscription") &&
        !destination.startsWith("/mot-de-passe-oublie") &&
        !destination.startsWith("/merci")
      ) {
        if (user.role === "admin" && !destination.startsWith("/admin")) {
          router.push("/admin");
        } else if (user.role !== "admin" && destination.startsWith("/admin")) {
          router.push("/");
        } else {
          router.push(destination);
        }
      } else {
        router.push(user.role === "admin" ? "/admin" : "/");
      }
    },
    [router],
  );

  /**
   * Première étape de la connexion.
   *
   * Quand la double authentification est active, le serveur ne délivre
   * AUCUN token ici : il renvoie un jeton de défi, qui ne permet rien
   * d'autre que de présenter un code. On le remonte à la page, qui
   * affiche alors le champ prévu.
   */
  const connexion = useCallback(
    async (email: string, motDePasse: string) => {
      const reponse = await api.post<ReponseConnexion>("/login", {
        email,
        password: motDePasse,
      });

      if (reponse.deux_facteurs_requis) {
        return { deuxFacteursRequis: true, jetonDefi: reponse.jeton_defi! };
      }

      ouvrirSession(reponse.token!, reponse.user!);

      return { deuxFacteursRequis: false };
    },
    [ouvrirSession],
  );

  /** Deuxième étape : le code de l'application, ou un code de secours. */
  const connexionDeuxFacteurs = useCallback(
    async (jetonDefi: string, code: string) => {
      const reponse = await api.post<{ token: string; user: Utilisateur }>(
        "/login/2fa",
        { jeton_defi: jetonDefi, code },
      );

      ouvrirSession(reponse.token, reponse.user);
    },
    [ouvrirSession],
  );

  const deconnexion = useCallback(async () => {
    try {
      await api.post("/logout");
    } catch {
      // Même si l'appel échoue (serveur arrêté), on déconnecte localement.
    }
    effacerToken();
    effacerDerniereActivite();
    window.localStorage.removeItem(CLE_BOUTIQUE);
    setUtilisateur(null);
    router.push("/connexion");
  }, [router]);

  // Surveillance d'inactivité (déconnexion automatique après 60 minutes)
  useEffect(() => {
    if (!utilisateur) return;

    enregistrerActivite();

    const stopperSurveillance = demarrerSurveillanceInactivite(async () => {
      try {
        await api.post("/logout");
      } catch {
        // En cas d'erreur réseau, la déconnexion locale est garantie
      }
      effacerToken();
      effacerDerniereActivite();
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(CLE_BOUTIQUE);
      }
      setUtilisateur(null);
      router.push("/connexion?inactivite=1");
    });

    return () => {
      stopperSurveillance();
    };
  }, [utilisateur, router]);

  const [deviseChoisie, setDeviseChoisie] = useState<string | null>(null);
  const [deviseDetectee, setDeviseDetectee] = useState<string | null>(null);

  useEffect(() => {
    const memorisee = window.localStorage.getItem(CLE_DEVISE);
    if (memorisee) {
      setDeviseChoisie(memorisee);
    } else {
      // Détection automatique par localisation IP (100% gratuit, sans pop-up)
      void detecterDeviseParIP().then((detectee) => {
        setDeviseDetectee(detectee);
      });
    }
  }, []);

  const changerDevise = useCallback((nouvelleDevise: string) => {
    setDeviseChoisie(nouvelleDevise);
    window.localStorage.setItem(CLE_DEVISE, nouvelleDevise);
  }, []);

  const boutiqueActive = useMemo(
    () => boutiques.find((b) => b.id === boutiqueId) ?? null,
    [boutiques, boutiqueId],
  );

  const deviseBoutique = useMemo(
    () => boutiqueActive?.devise ?? boutiques[0]?.devise ?? "XAF",
    [boutiqueActive, boutiques],
  );

  const devise = useMemo(() => {
    // 1. Choix manuel explicite de l'utilisateur
    if (deviseChoisie) return deviseChoisie;
    // 2. Si une boutique active est sélectionnée avec sa propre devise
    if (boutiqueActive?.devise) return boutiqueActive.devise;
    // 3. Sinon détection automatique par localisation IP
    if (deviseDetectee) return deviseDetectee;
    // 4. Repli sur la devise boutique ou XAF
    return deviseBoutique;
  }, [deviseChoisie, boutiqueActive, deviseDetectee, deviseBoutique]);

  const valeur = useMemo<ContexteAuth>(
    () => ({
      utilisateur,
      chargement,
      boutiques,
      boutiqueActive,
      changerBoutique,
      parametresBoutique: boutiqueId ? { boutique_id: boutiqueId } : {},
      devise,
      deviseBoutique,
      changerDevise,
      connexion,
      connexionDeuxFacteurs,
      deconnexion,
      rafraichir,
    }),
    [
      utilisateur,
      chargement,
      boutiques,
      boutiqueActive,
      boutiqueId,
      changerBoutique,
      devise,
      deviseBoutique,
      changerDevise,
      connexion,
      connexionDeuxFacteurs,
      deconnexion,
      rafraichir,
    ],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useAuth() {
  const contexte = useContext(Contexte);

  if (!contexte) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  }

  return contexte;
}
