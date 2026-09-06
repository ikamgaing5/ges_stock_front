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
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CLE_TOKEN, token);
    document.cookie = `${CLE_TOKEN}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  }
}

export function effacerToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CLE_TOKEN);
    document.cookie = `${CLE_TOKEN}=; path=/; max-age=0; SameSite=Lax`;
  }
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
  /** Secondes restantes imposées par le rate-limiting ou le serveur. */
  retryApres?: number;

  constructor(
    message: string,
    statut: number,
    erreurs: Record<string, string[]> = {},
    donnees: Record<string, unknown> = {},
    retryApres?: number,
  ) {
    super(message);
    this.name = "ErreurApi";
    this.statut = statut;
    this.erreurs = erreurs;
    this.donnees = donnees;

    // Déduction des secondes restantes
    if (typeof retryApres === "number" && !isNaN(retryApres)) {
      this.retryApres = retryApres;
    } else if (typeof donnees?.retry_after === "number") {
      this.retryApres = donnees.retry_after;
    } else if (typeof donnees?.secondes_restantes === "number") {
      this.retryApres = donnees.secondes_restantes;
    }
  }

  /** Indique si cette erreur correspond à un blocage par limitation de débit (429). */
  estRateLimit(): boolean {
    return this.statut === 429 || this.retryApres !== undefined;
  }

  /** Retourne le nombre de secondes restantes (ou un repli par défaut). */
  secondesRestantes(defaut: number = 60): number {
    if (typeof this.retryApres === "number" && this.retryApres > 0) {
      return this.retryApres;
    }
    const depuisDonnees = this.nombre("retry_after") ?? this.nombre("secondes_restantes");
    if (depuisDonnees !== undefined && depuisDonnees > 0) {
      return depuisDonnees;
    }
    // Tentative d'extraction par regex dans le message si présent
    const match = String(this.message).match(/(\d+)\s*(?:secondes?|seconds?|s\b)/i);
    if (match) {
      const sec = parseInt(match[1], 10);
      if (!isNaN(sec) && sec > 0) return sec;
    }
    return defaut;
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
  methode?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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

  const estFormData = typeof FormData !== "undefined" && corps instanceof FormData;

  if (corps !== undefined && !estFormData) {
    entetes["Content-Type"] = "application/json";
  }

  const token = lireToken();
  if (token) {
    entetes["Authorization"] = `Bearer ${token}`;
  }

  let methodeEffective = methode;
  let corpsEffectif: BodyInit | undefined = undefined;

  if (estFormData) {
    if (methode === "PUT" || methode === "PATCH") {
      methodeEffective = "POST";
      if (!corps.has("_method")) {
        corps.append("_method", methode);
      }
    }
    corpsEffectif = corps;
  } else if (corps !== undefined) {
    corpsEffectif = JSON.stringify(corps);
  }

  let reponse: Response;
  try {
    reponse = await fetch(url, {
      method: methodeEffective,
      headers: entetes,
      body: corpsEffectif,
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
    // 401 = token invalide ou expiré : on déconnecte et on renvoie au login en conservant la page active.
    if (reponse.status === 401 && typeof window !== "undefined") {
      effacerToken();
      if (!window.location.pathname.startsWith("/connexion")) {
        const cheminActuel = window.location.pathname + window.location.search;
        window.localStorage.setItem("gestion-stock-dernier-chemin", cheminActuel);
        document.cookie = `gestion-stock-dernier-chemin=${encodeURIComponent(cheminActuel)}; path=/; max-age=604800; SameSite=Lax`;
        window.location.href = `/connexion?retour=${encodeURIComponent(cheminActuel)}`;
      }
    }

    if (reponse.status === 403 && typeof window !== "undefined") {
      if (donnees?.message?.includes("propriétaire de la boutique") || donnees?.message?.includes("store owner")) {
        effacerToken();
        window.location.href = "/connexion?boutique_desactivee=1";
      } else if (donnees?.message?.includes("accès a été désactivé") || donnees?.message?.includes("account has been deactivated")) {
        effacerToken();
        window.location.href = "/connexion?desactive=1";
      }
    }

    // 402 = abonnement expiré : redirection vers la page de choix de formule
    if (reponse.status === 402 && typeof window !== "undefined") {
      if (!window.location.pathname.startsWith("/mon-compte/abonnement")) {
        window.location.href = "/mon-compte/abonnement?expire=1";
      }
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

    // Extraction du délai de Rate Limiting
    let delaiAttente: number | undefined;
    const headerRetryAfter = reponse.headers.get("Retry-After") || reponse.headers.get("retry-after");
    if (headerRetryAfter) {
      const parsed = parseInt(headerRetryAfter, 10);
      if (!isNaN(parsed) && parsed > 0) delaiAttente = parsed;
    }
    if (delaiAttente === undefined && typeof donnees?.retry_after === "number") {
      delaiAttente = donnees.retry_after;
    }
    if (delaiAttente === undefined && typeof donnees?.secondes_restantes === "number") {
      delaiAttente = donnees.secondes_restantes;
    }
    if (delaiAttente === undefined && reponse.status === 429) {
      const match = String(messageAffiche).match(/(\d+)\s*(?:secondes?|seconds?|s\b)/i);
      if (match) {
        const sec = parseInt(match[1], 10);
        if (!isNaN(sec) && sec > 0) delaiAttente = sec;
      } else {
        delaiAttente = 60;
      }
    }

    throw new ErreurApi(
      messageAffiche,
      reponse.status,
      erreursAssainies,
      donnees ?? {},
      delaiAttente,
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
