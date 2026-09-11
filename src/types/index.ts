/**
 * Les formes de données échangées avec l'API Laravel.
 *
 * À garder aligné avec backend/app/Http/Resources/*.php : si tu ajoutes un
 * champ là-bas, ajoute-le ici aussi.
 */

export type Role = "admin" | "proprietaire" | "vendeuse" | "secretaire";

/** Où en est un appareil précis. */
export type StatutTelephone =
  | "en_stock"
  | "reserve"
  | "vendu"
  | "sav"
  | "perdu";

export type EtatTelephone = "neuf" | "occasion" | "reconditionne";

export type TypeMouvement =
  | "entree"
  | "vente"
  | "retour"
  | "reservation"
  | "transfert"
  | "sav"
  | "perte"
  | "correction";

export type ModePaiementVente = "cash" | "om_momo";

export type StatutAbonnement = "essai" | "actif" | "suspendu" | "expire";
export type PlanAbonnement = "standard" | "premium";

/** État de la double authentification, pour la personne connectée. */
export interface DeuxFacteurs {
  actif: boolean;
  codes_secours_restants: number;
}

export interface Abonnement {
  statut: StatutAbonnement | null;
  plan?: PlanAbonnement;
  est_premium?: boolean;
  echeance: string | null;
  utilisable: boolean;
}

export interface Boutique {
  id: string;
  proprietaire_id: number;
  nom: string;
  pays?: string;
  adresse: string | null;
  ville: string | null;
  telephone: string | null;
  libelle_complet?: string;
  devise: string;
  active: boolean;
  logo_url?: string | null;
  niu?: string | null;
  registre_commerce?: string | null;
  nb_employes?: number;
  nb_en_stock?: number;
  created_at: string;
}

export interface Utilisateur {
  id: number;
  name: string;
  email: string;
  role: Role;
  telephone: string | null;
  entreprise_nom?: string | null;
  pays?: string | null;
  niu?: string | null;
  registre_commerce?: string | null;
  logo_url?: string | null;
  actif: boolean;
  proprietaire_id: number | null;
  created_at: string;
  est_premium?: boolean;
  /** Présent uniquement pour la personne connectée. */
  abonnement?: Abonnement;
  /** Présent uniquement pour la personne connectée. */
  deux_facteurs?: DeuxFacteurs;
  /** Les boutiques accessibles, pour la personne connectée. */
  boutiques?: Boutique[];
  /** Pour la liste des employés. */
  boutiques_rattachees?: Boutique[];
  /** Compteurs de l'espace administrateur. */
  boutiques_possedees_count?: number;
  employes_count?: number;
}

export interface InvitationEmploye {
  id: string;
  email: string;
  role: Role;
  boutiques: { id: string; nom: string }[];
  expire_le: string;
  est_expiree: boolean;
  created_at: string;
}

export interface ResultatLookupImei {
  trouve: boolean;
  premium_requis?: boolean;
  message?: string;
  deja_en_catalogue?: boolean;
  tac?: string;
  marque?: string;
  gamme?: string;
  modele?: string;
  nom_commercial?: string;
  stockage_defaut?: string;
  selection?: {
    marque_id: string;
    gamme_id: string;
    modele_id: string;
    modele_stockage_id: string | null;
  } | null;
}

export type Marque = {
  id: string;
  nom: string;
};

// export type Marque = { id: string; nom: string };
export type Gamme =
  {
    id: string;
    nom: string;
    marque: Marque
  };

export type ModeleStockage =
  {
    id: string;
    valeur: string
  };


/** Une référence commerciale du catalogue : « Samsung Galaxy A54 128 Go ». */
export interface Modele {
  id: number;
  // marque: Marque;
  gamme: Gamme;
  nom: string;
  // stockage: string | null;
  stockages: ModeleStockage[];
  ram: string | null;
  libelle: string;
  description: string | null;
  prix_achat_conseille: number;
  prix_vente_conseille: number;
  seuil_alerte: number;
  actif: boolean;
  nb_en_stock?: number;
  nb_total?: number;
  created_at: string;
}

/** UN APPAREIL PHYSIQUE, identifié par son IMEI. */
export interface Telephone {
  id: number | string;
  boutique_id: number;
  modele_id: number;
  modele_stockage: ModeleStockage;
  imei: string;
  imei2: string | null;
  numero_serie: string | null;
  couleur: string | null;
  etat: EtatTelephone;
  statut: StatutTelephone;
  prix_achat: number;
  prix_vente: number;
  prix_vente_reel: number | null;
  fournisseur: string | null;
  client_nom: string | null;
  client_telephone: string | null;
  entre_le: string | null;
  sorti_le: string | null;
  notes: string | null;
  modele?: Modele;
  boutique?: Boutique;
  created_at: string;
  updated_at: string;
}

export interface Mouvement {
  id: string | number;
  uuid?: string;
  mouvement_id?: number;
  boutique_id: number;
  telephone_id: number;
  type: TypeMouvement;
  statut_avant: StatutTelephone | null;
  statut_apres: StatutTelephone;
  prix: number | null;
  mode_paiement?: ModePaiementVente | null;
  numero_facture?: string | null;
  client_nom: string | null;
  client_telephone: string | null;
  motif: string | null;
  commentaire: string | null;
  telephone?: Telephone;
  user?: Utilisateur;
  boutique?: Boutique;
  boutique_source?: Boutique;
  boutique_destination?: Boutique;
  created_at: string;
}

export interface StatistiquesTableauBord {
  nb_en_stock: number;
  nb_reserves: number;
  nb_sav: number;
  nb_perdus: number;
  valeur_achat: number;
  valeur_vente: number;
  nb_boutiques: number;
  nb_alertes: number;
  entrees_du_jour: number;
  ventes_du_jour: number;
  chiffre_du_jour: number;
  ventes_du_mois: number;
  chiffre_du_mois: number;
}

export interface TableauBord {
  statistiques: StatistiquesTableauBord;
  alertes: Modele[];
  derniers_mouvements: Mouvement[];
  par_boutique: {
    boutique_id: number;
    boutique: string;
    nb_en_stock: number;
    valeur: number;
  }[];
}

export interface StatistiquesAdmin {
  nb_proprietaires: number;
  nb_actifs: number;
  nb_essais: number;
  nb_suspendus: number;
  nb_echeances_proches: number;
  nb_boutiques: number;
  nb_employes: number;
  nb_appareils: number;
  inscriptions_30_jours: number;
}

/** Réponse paginée de Laravel. */
export interface Page<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    total_boutique?: number;
    from: number | null;
    to: number | null;
  };
}

/** Réponse de la recherche par IMEI. */
export interface ResultatImei {
  trouve: boolean;
  accessible?: boolean;
  message?: string;
  data?: Telephone;
}

export type StatutPaiement = "en_attente" | "valide" | "echec" | "annule";
export type ModePaiement = "test" | "production";
export type MoyenPaiement = "orange_money" | "mtn_momo" | "carte";

export interface Paiement {
  id: number;
  user_id: number;
  reference: string;
  montant: number;
  devise: string;
  plan: PlanAbonnement;
  duree_mois: number;
  passerelle: string;
  moyen_paiement: string | null;
  statut: StatutPaiement;
  mode: ModePaiement;
  cinetpay_token?: string | null;
  cinetpay_operator_id?: string | null;
  donnees_reponse?: Record<string, unknown> | null;
  paye_a?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    telephone: string | null;
  };
}

export interface StatutAbonnementComplet {
  statut: StatutAbonnement | null;
  plan: PlanAbonnement;
  echeance: string | null;
  jours_restants: number;
  est_expire: boolean;
  est_essai: boolean;
  est_actif: boolean;
  est_premium: boolean;
  mode_paiement: ModePaiement;
  tarifs: {
    standard: { mensuel: number; annuel: number };
    premium: { mensuel: number; annuel: number };
    devise: string;
  };
}

export interface ConfigurationPaiementAdmin {
  cinetpay_mode: ModePaiement;
  cinetpay_site_id: string;
  cinetpay_api_key: string;
  cinetpay_secret_key: string;
  cle_api_renseignee: boolean;
  cle_secrete_renseignee: boolean;
  site_id_renseigne: boolean;
  tarifs: {
    prix_standard_mensuel: number;
    prix_standard_annuel: number;
    prix_premium_mensuel: number;
    prix_premium_annuel: number;
  };
  statistiques: {
    total_valides: number;
    total_montant: number;
    devise: string;
  };
}

export interface SessionPaiementReponse {
  reference: string;
  montant: number;
  devise: string;
  plan: PlanAbonnement;
  duree_mois: number;
  mode: ModePaiement;
  payment_url: string;
  payment_token: string | null;
}

export interface ClientResume {
  cle: string;
  nom: string;
  telephone: string;
  nombre_achats: number;
  total_depense: number;
  premier_achat: string;
  dernier_achat: string;
  boutiques: Array<{ id: number; nom: string; uuid?: string }>;
  derniers_appareils: string[];
}

export interface ClientAchatDetail {
  id: number | string;
  uuid?: string;
  date: string;
  prix: number;
  mode_paiement?: string | null;
  numero_facture?: string | null;
  commentaire?: string | null;
  boutique_nom: string;
  vendeur_nom: string;
  telephone: {
    id: number | string;
    imei?: string | null;
    couleur?: string | null;
    modele: string;
    marque: string;
  };
}

export interface ClientFicheDetail {
  client: {
    cle: string;
    nom: string;
    telephone: string;
    nombre_achats: number;
    total_depense: number;
    premier_achat: string;
    dernier_achat: string;
  };
  achats: ClientAchatDetail[];
}

export interface StatistiquesClients {
  total_clients: number;
  total_ventes: number;
  chiffre_affaires: number;
  panier_moyen: number;
  clients_fideles: number;
}

