/**
 * Client API — le SEUL fichier qui parle au backend Laravel.
 *
 * Toutes les pages passent par ici. Si l'adresse de l'API change, ou si
 * on veut ajouter un en-tête à toutes les requêtes, c'est ici et nulle
 * part ailleurs.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api";

const CLE_TOKEN = "gestion-stock-token";
const CLE_LANGUE = "gestion-stock-lang";

export function lireLangue(): string {
  if (typeof window === "undefined") return "fr";
  return window.localStorage.getItem(CLE_LANGUE) ?? "fr";
}

// --------------------------------------------------------------------------
// Le token de connexion
// --------------------------------------------------------------------------

export function lireToken(): string | null {
  if (typeof window === "undefined") return null; // côté serveur : pas de localStorage
  return window.localStorage.getItem(CLE_TOKEN);
}

export function enregistrerToken(token: string) {
  window.localStorage.setItem(CLE_TOKEN, token);
}

export function effacerToken() {
  window.localStorage.removeItem(CLE_TOKEN);
}

// --------------------------------------------------------------------------
// L'erreur renvoyée par l'API
// --------------------------------------------------------------------------

/**
 * Erreur levée dès que l'API répond autre chose qu'un succès.
 * `erreurs` contient les messages champ par champ, tels que Laravel les
 * renvoie : { "nom": ["Le champ nom est obligatoire."] }
 */
export class ErreurApi extends Error {
  statut: number;
  erreurs: Record<string, string[]>;
  /**
   * Le corps complet de la réponse. Certaines erreurs transportent des
   * informations utiles en plus du message : par exemple le nombre de
   * secondes à attendre avant de pouvoir redemander un code.
   */
  donnees: Record<string, unknown>;

  constructor(
    message: string,
    statut: number,
    erreurs: Record<string, string[]> = {},
    donnees: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ErreurApi";
    this.statut = statut;
    this.erreurs = erreurs;
    this.donnees = donnees;
  }

  /** Lit un champ supplémentaire du corps de la réponse. */
  nombre(champ: string): number | undefined {
    const valeur = this.donnees[champ];
    return typeof valeur === "number" ? valeur : undefined;
  }

  /** Le premier message d'erreur d'un champ donné, s'il y en a un. */
  erreurDe(champ: string): string | undefined {
    return this.erreurs[champ]?.[0];
  }

  /**
   * Le message à afficher dans une notification.
   *
   * Quand plusieurs champs sont en erreur, Laravel résume par « … (and 2
   * more errors) », en anglais et sans intérêt pour la personne. On préfère
   * le premier message de champ, qui est précis et traduit.
   */
  resume(): string {
    const premier = Object.values(this.erreurs)[0]?.[0];
    return premier ?? this.message;
  }

  /**
   * Les erreurs mises à plat : { nom: "Le champ nom est obligatoire." }
   * Les erreurs sur un tableau (« boutiques.0 ») sont regroupées sous la
   * clé du tableau, qui est celle affichée dans le formulaire.
   */
  parChamp(): Record<string, string> {
    const messages: Record<string, string> = {};

    for (const [champ, liste] of Object.entries(this.erreurs)) {
      const cle = champ.split(".")[0];
      if (!messages[cle]) messages[cle] = liste[0];
    }

    return messages;
  }
}

// --------------------------------------------------------------------------
// La fonction de base
// --------------------------------------------------------------------------

type Options = {
  methode?: "GET" | "POST" | "PUT" | "DELETE";
  corps?: unknown;
  /** Paramètres ajoutés à l'URL : { recherche: "samsung", page: 2 } */
  params?: Record<string, string | number | boolean | undefined | null>;
  /**
   * Permet d'annuler la requête. Indispensable sur les listes filtrées :
   * quand on tape vite, plusieurs recherches partent en même temps et
   * rien ne garantit qu'elles reviennent dans l'ordre. Sans annulation,
   * une réponse lente peut écraser une réponse plus récente et afficher
   * un résultat qui ne correspond plus à la saisie.
   */
  signal?: AbortSignal;
};

/**
 * Erreur levée quand une requête est annulée volontairement.
 * Elle ne doit jamais être affichée : ce n'est pas un échec.
 */
export class RequeteAnnulee extends Error {
  constructor() {
    super("Requête annulée.");
    this.name = "RequeteAnnulee";
  }
}

/** Est-ce une annulation volontaire, à ignorer sans rien afficher ? */
export function estAnnulation(erreur: unknown): boolean {
  return erreur instanceof RequeteAnnulee;
}

async function requete<T>(chemin: string, options: Options = {}): Promise<T> {
  const { methode = "GET", corps, params, signal } = options;

  let url = `${BASE_URL}${chemin}`;

  if (params) {
    const query = new URLSearchParams();
    for (const [cle, valeur] of Object.entries(params)) {
      if (valeur !== undefined && valeur !== null && valeur !== "") {
        query.append(cle, String(valeur));
      }
    }
    const chaine = query.toString();
    if (chaine) url += `?${chaine}`;
  }

  const entetes: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": lireLangue(),
  };

  if (corps !== undefined) {
    entetes["Content-Type"] = "application/json";
  }

  const token = lireToken();
  if (token) {
    entetes["Authorization"] = `Bearer ${token}`;
  }

  let reponse: Response;
  try {
    reponse = await fetch(url, {
      method: methode,
      headers: entetes,
      body: corps === undefined ? undefined : JSON.stringify(corps),
      signal,
    });
  } catch (e) {
    // Une annulation n'est pas une panne : on la distingue pour que
    // l'interface n'affiche pas de message d'erreur.
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new RequeteAnnulee();
    }

    const lang = lireLangue();
    const msg =
      lang === "en"
        ? "An error occurred, please try again later."
        : "Une erreur est survenue, veuillez réessayer plus tard.";

    throw new ErreurApi(msg, 0);
  }

  // 204 = succès sans contenu
  if (reponse.status === 204) {
    return undefined as T;
  }

  const texte = await reponse.text();
  const donnees = texte ? JSON.parse(texte) : null;

  if (!reponse.ok) {
    // 401 = token invalide ou expiré : on déconnecte et on renvoie au login.
    if (reponse.status === 401 && typeof window !== "undefined") {
      effacerToken();
      if (!window.location.pathname.startsWith("/connexion")) {
        // Rechargement complet volontaire : ce fichier n'est pas un composant
        // React, il n'a donc pas accès à useRouter(). Et repartir d'une page
        // vierge garantit qu'aucune donnée de l'ancienne session ne subsiste.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/connexion";
      }
    }

    if (
      reponse.status === 403 &&
      donnees?.message?.includes("accès a été désactivé") &&
      typeof window !== "undefined"
    ) {
      effacerToken();
      window.location.href = "/connexion?desactive=1";
    }

    let messageAffiche = donnees?.message ?? "Une erreur est survenue.";

    // Détection et assainissement des messages d'erreurs techniques, SQL ou 500
    const estErreurTechnique =
      reponse.status >= 500 ||
      /sqlstate|pdoexception|connection refused|expressément refusée|syntax error|database query/i.test(
        String(messageAffiche),
      );

    if (estErreurTechnique) {
      const lang = lireLangue();
      messageAffiche =
        lang === "en"
          ? "An error occurred, please try again later."
          : "Une erreur est survenue, veuillez réessayer plus tard.";
    }

    // Nettoyer également les messages par champ s'ils contiennent des traces SQL
    const erreursAssainies: Record<string, string[]> = {};
    if (donnees?.errors && typeof donnees.errors === "object") {
      for (const [champ, liste] of Object.entries(
        donnees.errors as Record<string, string[]>,
      )) {
        if (Array.isArray(liste)) {
          erreursAssainies[champ] = liste.map((err) =>
            /sqlstate|pdoexception|connection refused|expressément refusée/i.test(err)
              ? messageAffiche
              : err,
          );
        }
      }
    }

    throw new ErreurApi(
      messageAffiche,
      reponse.status,
      erreursAssainies,
      donnees ?? {},
    );
  }

  return donnees as T;
}

/**
 * Raccourcis utilisés dans les pages.
 *
 * Exemple :
 *   const produits = await api.get<Page<Produit>>("/produits", { recherche: "a54" });
 *   await api.post("/mouvements", { produit_id: 1, type: "sortie", quantite: 2 });
 */
export const api = {
  get: <T>(
    chemin: string,
    params?: Options["params"],
    signal?: AbortSignal,
  ) => requete<T>(chemin, { methode: "GET", params, signal }),

  post: <T>(chemin: string, corps?: unknown) =>
    requete<T>(chemin, { methode: "POST", corps }),

  put: <T>(chemin: string, corps?: unknown) =>
    requete<T>(chemin, { methode: "PUT", corps }),

  // Une suppression peut avoir un corps : désactiver la double
  // authentification exige par exemple le mot de passe.
  delete: <T>(chemin: string, corps?: unknown) =>
    requete<T>(chemin, { methode: "DELETE", corps }),
};
