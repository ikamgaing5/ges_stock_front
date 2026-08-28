import type {
  EtatTelephone,
  Role,
  StatutAbonnement,
  StatutTelephone,
  TypeMouvement,
} from "@/types";

export type Langue = "fr" | "en";

export interface InfoLangue {
  code: Langue;
  libelle: string;
  drapeau: string;
}

export const LANGUES_DISPONIBLES: InfoLangue[] = [
  { code: "fr", libelle: "Français", drapeau: "🇫🇷" },
  { code: "en", libelle: "English", drapeau: "🇬🇧" },
];

export type CleTraduction =
  | `commun.${string}`
  | `nav.${string}`
  | `auth.${string}`
  | `dashboard.${string}`
  | `telephones.${string}`
  | `modeles.${string}`
  | `mouvements.${string}`
  | `equipe.${string}`
  | `boutiques.${string}`
  | `monCompte.${string}`
  | `scanner.${string}`
  | `admin.${string}`
  | `changerEmail.${string}`
  | `deuxFacteurs.${string}`
  | `imei.${string}`
  | `selecteurBoutique.${string}`
  | `roles.${Role}`
  | `rolesDesc.${Role}`
  | `statuts.${StatutTelephone}`
  | `etats.${EtatTelephone}`
  | `typesMouvement.${TypeMouvement}`
  | `abonnements.${StatutAbonnement}`;

export type ParametresTraduction = Record<string, string | number>;

export interface ContexteI18n {
  lang: Langue;
  setLang: (lang: Langue) => void;
  t: (cle: string, params?: ParametresTraduction) => string;
  formatMontant: (valeur: number, devise?: string, deviseSource?: string) => string;
  formatNombre: (valeur: number) => string;
  formatDate: (iso: string) => string;
  formatDateCourte: (iso: string) => string;
  libelleRole: (role: Role) => string;
  descriptionRole: (role: Role) => string;
  libelleStatut: (statut: StatutTelephone) => string;
  libelleEtat: (etat: EtatTelephone) => string;
  libelleMouvement: (type: TypeMouvement) => string;
  libelleTypeMouvement: (type: TypeMouvement) => string;
  libelleAbonnement: (statut: StatutAbonnement) => string;
  libelleStatutAbonnement: (statut: StatutAbonnement) => string;
}
