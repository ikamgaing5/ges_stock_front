"use client";

/**
 * Page de gestion des forfaits et paiement des abonnements Telora (/mon-compte/abonnement).
 *
 * Entièrement humanisée et adaptée aux commerçants de téléphonie :
 * - Période d'essai de 14 jours expliquée avec bienveillance (aucun stress, vos données restent à vous)
 * - Formules claires : Plan Standard (1 magasin) vs Plan Premium (multi-magasins)
 * - Remise incitative : 2 mois offerts sur le règlement annuel
 * - Logos officiels vectoriels pour Orange Money, MTN MoMo et Carte Bancaire
 * - Modale "Régler mon abonnement" complètement repensée :
 *   • Structure 100% lisible avec DialogHeader, DialogCorps (défilement fluide sans coupure) et DialogFooter
 *   • Contraste élevé, typographie nette et aérée (fini les textes sombres illisibles)
 *   • Choix visuel de l'opérateur avec logo officiel
 *   • Saisie du numéro de téléphone avec indicatif pays pour l'envoi de l'invite USSD/Push
 *   • Explications limpides pour chaque opérateur
 *   • Mode test / démonstration pédagogique sans frais réels
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
  Loader2,
  Lock,
  Pencil,
  Phone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useRateLimit } from "@/lib/useRateLimit";
import { AlerteRateLimit } from "@/components/ui/alerte-rate-limit";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { SqueletteAbonnement } from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogCorps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChampTelephone } from "@/components/champ-telephone";
import { IconeTelora } from "@/components/ui/logo-telora";
import {
  IconeCarteBancaire,
  IconeMtnMomo,
  IconeOrangeMoney,
} from "@/components/icones-paiement";
import type {
  MoyenPaiement,
  PlanAbonnement,
  SessionPaiementReponse,
  StatutAbonnementComplet,
} from "@/types";

/**
 * Icône florale / botanique minimaliste inspirée de Claude (1 tige, 3 nœuds)
 */
function IconeClaudeStandard({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="20" y1="34" x2="20" y2="12" />
      <circle cx="20" cy="9" r="3" />
      <path d="M20 23 C14 23 13 19 13 16" />
      <circle cx="13" cy="15" r="2.5" />
      <path d="M20 23 C26 23 27 19 27 16" />
      <circle cx="27" cy="15" r="2.5" />
    </svg>
  );
}

/**
 * Icône florale / botanique ramifiée inspirée de Claude (1 tige, 5 nœuds symétriques)
 */
function IconeClaudePremium({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="20" y1="34" x2="20" y2="10" />
      <circle cx="20" cy="7.5" r="2.5" />
      <path d="M20 18 C14 18 13 14 13 12" />
      <circle cx="13" cy="11.5" r="2.2" />
      <path d="M20 18 C26 18 27 14 27 12" />
      <circle cx="27" cy="11.5" r="2.2" />
      <path d="M20 26 C11 26 9 20 9 17" />
      <circle cx="9" cy="16.5" r="2.2" />
      <path d="M20 26 C29 26 31 20 31 17" />
      <circle cx="31" cy="16.5" r="2.2" />
    </svg>
  );
}

/**
 * Coche ultra-fine et discrète fidèle à la liste Claude
 */
function CocheMinimaliste({ className = "w-4 h-4 text-foreground/60 shrink-0 mt-0.5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
    </svg>
  );
}

export default function PageAbonnement() {
  const { utilisateur, rafraichir } = useAuth();
  const { t, lang, formatMontant, formatDateCourte } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const caracteristiquesStandard = [
    t("monCompte.featBoutiqueUnique"),
    t("monCompte.featImeiIllimite"),
    t("monCompte.featCaisseClotures"),
    t("monCompte.featComptesProteges"),
    t("monCompte.featSuiviStockAlertes"),
  ];

  const caracteristiquesPremium = [
    t("monCompte.featBoutiquesIllimitees"),
    t("monCompte.featTransfertsStock"),
    t("monCompte.featBeneficeNetPointVente"),
    t("monCompte.featExportsComptables"),
    t("monCompte.featSupportWhatsapp"),
  ];

  const [statut, setStatut] = useState<StatutAbonnementComplet | null>(null);
  const [chargement, setChargement] = useState(true);

  // Rate limiting dynamique
  const rateLimitPaiement = useRateLimit();

  const [modalAnnulationOuverte, setModalAnnulationOuverte] = useState(false);

  // Choix de la formule
  const [duree, setDuree] = useState<1 | 12>(1); // 1 mois ou 12 mois
  const [planSelectionne, setPlanSelectionne] = useState<PlanAbonnement>("standard");
  const [moyenPaiement, setMoyenPaiement] = useState<MoyenPaiement>("orange_money");
  const [telephonePaiement, setTelephonePaiement] = useState("");
  const [telephoneOrange, setTelephoneOrange] = useState("");
  const [telephoneMtn, setTelephoneMtn] = useState("");
  const [enregistrementMoyenEnCours, setEnregistrementMoyenEnCours] = useState(false);
  const [conditionsAcceptees, setConditionsAcceptees] = useState(false);

  // Vue de configuration demandée via paramètre URL
  const vueParam = searchParams.get("vue");
  const planParam = searchParams.get("plan");
  const dureeParam = searchParams.get("duree") || searchParams.get("periode");

  const estVueConfigurer = vueParam === "configurer";

  // Synchronisation avec l'URL
  useEffect(() => {
    if (planParam === "premium" || planParam === "standard") {
      setPlanSelectionne(planParam);
    }
  }, [planParam]);

  useEffect(() => {
    if (dureeParam === "12" || dureeParam === "annuel") {
      setDuree(12);
    } else if (dureeParam === "1" || dureeParam === "mensuel") {
      setDuree(1);
    }
  }, [dureeParam]);

  // Modale de paiement & Push direct
  const [modalOuvert, setModalOuvert] = useState(false);
  const [session, setSession] = useState<SessionPaiementReponse | null>(null);
  const [initialisationEnCours, setInitialisationEnCours] = useState(false);
  const [simulationEnCours, setSimulationEnCours] = useState(false);
  const [pushDirectEnCours, setPushDirectEnCours] = useState(false);
  const [statutPushDirect, setStatutPushDirect] = useState<"attente" | "succes" | "echec">("attente");
  const [messageErreurPush, setMessageErreurPush] = useState<string | null>(null);
  const [verificationManuelleEnCours, setVerificationManuelleEnCours] = useState(false);

  const chargerStatut = useCallback(async () => {
    try {
      const data = await api.get<StatutAbonnementComplet>("/abonnements/statut");
      setStatut(data);
      if (data.plan) {
        setPlanSelectionne(data.plan);
      }
      if (data.telephone_orange) {
        setTelephoneOrange(data.telephone_orange);
      }
      if (data.telephone_mtn) {
        setTelephoneMtn(data.telephone_mtn);
      }
      const moyen = data.moyen_prefere || "orange_money";
      setMoyenPaiement(moyen);

      if (moyen === "orange_money") {
        setTelephonePaiement(data.telephone_orange || data.telephone_paiement || "");
      } else if (moyen === "mtn_momo") {
        setTelephonePaiement(data.telephone_mtn || data.telephone_paiement || "");
      } else {
        setTelephonePaiement(data.telephone_paiement || "");
      }
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void chargerStatut();
  }, [chargerStatut]);

  /**
   * Bascule le moyen de paiement et recharge automatiquement le numéro propre à cet opérateur
   */
  function choisirMoyenPaiement(nouveauMoyen: MoyenPaiement) {
    setMoyenPaiement(nouveauMoyen);
    if (nouveauMoyen === "orange_money") {
      setTelephonePaiement(telephoneOrange);
    } else if (nouveauMoyen === "mtn_momo") {
      setTelephonePaiement(telephoneMtn);
    }
  }

  /**
   * Saisie manuelle du numéro de téléphone avec mise à jour du numéro lié à l'opérateur en cours
   */
  function changerTelephone(nouveauTel: string) {
    setTelephonePaiement(nouveauTel);
    if (moyenPaiement === "orange_money") {
      setTelephoneOrange(nouveauTel);
    } else if (moyenPaiement === "mtn_momo") {
      setTelephoneMtn(nouveauTel);
    }
  }

  /**
   * Enregistre le moyen de paiement choisi et son numéro associé en base de données
   */
  async function enregistrerMoyenPaiement() {
    if (moyenPaiement !== "carte" && !telephonePaiement.trim()) {
      toast.error(t("monCompte.telephoneObligatoire"));
      return;
    }

    setEnregistrementMoyenEnCours(true);
    try {
      const res = await api.post<{
        message: string;
        moyen_prefere: MoyenPaiement;
        telephone_paiement: string;
        telephone_orange: string | null;
        telephone_mtn: string | null;
      }>("/abonnements/enregistrer-moyen", {
        moyen_paiement: moyenPaiement,
        telephone: telephonePaiement.trim() || undefined,
      });

      if (res.telephone_orange) setTelephoneOrange(res.telephone_orange);
      if (res.telephone_mtn) setTelephoneMtn(res.telephone_mtn);

      setStatut((prev) =>
        prev
          ? {
              ...prev,
              moyen_prefere: res.moyen_prefere,
              telephone_paiement: res.telephone_paiement,
              telephone_orange: res.telephone_orange,
              telephone_mtn: res.telephone_mtn,
            }
          : prev
      );

      toast.success(res.message || t("monCompte.moyenMisAJourSucces"));
      setModalOuvert(false);
    } catch (e) {
      toast.error(
        e instanceof ErreurApi ? e.resume() : t("commun.erreur")
      );
    } finally {
      setEnregistrementMoyenEnCours(false);
    }
  }

  // Polling automatique pour les paiements Push USSD directs Softpay
  useEffect(() => {
    if (!pushDirectEnCours || !session?.reference || statutPushDirect !== "attente") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await api.get<{ statut: string; reference_operateur?: string }>(`/paiements/${session.reference}`);
        if (res.reference_operateur && res.reference_operateur !== session.reference_operateur) {
          setSession((prev) => (prev ? { ...prev, reference_operateur: res.reference_operateur } : prev));
        }

        if (res.statut === "valide") {
          setStatutPushDirect("succes");
          clearInterval(interval);
          toast.success(t("monCompte.abonnementActiveSucces"));
          await rafraichir();
          await chargerStatut();
          setTimeout(() => {
            setModalOuvert(false);
            setPushDirectEnCours(false);
            setStatutPushDirect("attente");
          }, 2500);
        } else if (res.statut === "echec" || res.statut === "annule") {
          setStatutPushDirect("echec");
          setMessageErreurPush(t("monCompte.transactionRefuseeDesc"));
          clearInterval(interval);
        }
      } catch {
        // En cas de micro-coupure réseau temporaire, continuer le polling
      }
    }, 2500);

    // Arrêt de sécurité après 90 secondes si aucune validation
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (statutPushDirect === "attente") {
        setStatutPushDirect("echec");
        setMessageErreurPush(t("monCompte.delaiDepasseDesc"));
      }
    }, 90000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pushDirectEnCours, session?.reference, statutPushDirect, t, rafraichir, chargerStatut]);

  // Retour de passerelle SaasPay externe
  useEffect(() => {
    if (searchParams.get("statut") === "retour") {
      void chargerStatut();
      void rafraichir();
      toast.info(t("monCompte.confirmationAbonnementEnCours"));
    }
  }, [searchParams, chargerStatut, rafraichir, lang]);

  const [chargementRenouvellement, setChargementRenouvellement] = useState(false);

  async function basculerRenouvellementAuto() {
    if (!statut || chargementRenouvellement) return;

    // Si on veut activer et qu'aucune carte n'est encore enregistrée
    if (!statut.renouvellement_auto && !statut.a_carte_enregistree) {
      toast.info(t("monCompte.configurerCartePourRenouvellement"));
      setMoyenPaiement("carte");
      setModalOuvert(true);
      return;
    }

    setChargementRenouvellement(true);
    try {
      const res = await api.post<{ renouvellement_auto: boolean; message: string }>(
        "/abonnements/toggle-renouvellement-auto",
        { activer: !statut.renouvellement_auto }
      );
      setStatut((prev) => (prev ? { ...prev, renouvellement_auto: res.renouvellement_auto } : prev));
      toast.success(res.message);
      await rafraichir();
    } catch (e) {
      if (e instanceof ErreurApi && (e.donnees as Record<string, unknown>)?.doit_ajouter_carte) {
        toast.info(e.resume());
        setMoyenPaiement("carte");
        setModalOuvert(true);
      } else {
        toast.error(e instanceof ErreurApi ? e.resume() : t("monCompte.impossibleModifierPreference"));
      }
    } finally {
      setChargementRenouvellement(false);
    }
  }

  // Calcul du tarif
  const montantActuel = (plan: PlanAbonnement, d: 1 | 12) => {
    if (!statut) return 0;
    const tPlan = statut.tarifs[plan];
    return d === 12 ? tPlan.annuel : tPlan.mensuel;
  };

  /**
   * Ouvre la modale pour choisir l'opérateur et saisir son numéro
   */
  /**
   * Lance directement la souscription :
   * - Si un moyen de paiement et un numéro sont déjà enregistrés sur le compte :
   *   Lancement direct en 1 clic ! Le push Mobile Money est envoyé immédiatement
   *   et la modale s'ouvre directement avec le logo Telora et le spinner d'attente.
   * - Sinon (aucun numéro) :
   *   Ouvre la modale pour choisir son opérateur et renseigner son numéro.
   */
  async function declencherSouscription(planChoisi: PlanAbonnement) {
    if (rateLimitPaiement.estBloque || initialisationEnCours) return;

    setPlanSelectionne(planChoisi);

    const telCible = telephonePaiement.trim() || statut?.telephone_paiement?.trim() || utilisateur?.telephone?.trim() || "";
    const moyenCible = moyenPaiement || statut?.moyen_prefere || "orange_money";

    // Si on a déjà les informations nécessaires (numéro Mobile Money, ou Carte)
    if (telCible || moyenCible === "carte") {
      if (telCible && telephonePaiement !== telCible) {
        setTelephonePaiement(telCible);
      }
      if (moyenCible && moyenPaiement !== moyenCible) {
        setMoyenPaiement(moyenCible);
      }

      setPushDirectEnCours(true);
      setStatutPushDirect("attente");
      setMessageErreurPush(null);
      setModalOuvert(true);

      await executerPaiementDirect(planChoisi, moyenCible, telCible);
    } else {
      // Aucun numéro renseigné : on ouvre la modale de configuration
      setPushDirectEnCours(false);
      setStatutPushDirect("attente");
      setMessageErreurPush(null);
      setModalOuvert(true);
    }
  }

  /**
   * Bascule vers l'écran de configuration du forfait demandé via argument d'URL
   */
  function naviguerVersConfiguration(planChoisi: PlanAbonnement) {
    setPlanSelectionne(planChoisi);
    router.push(
      `/mon-compte/abonnement?vue=configurer&plan=${planChoisi}&duree=${duree}`,
      { scroll: false }
    );
  }

  /**
   * Déclenche la souscription finale depuis l'écran de configuration
   */
  async function validerSouscriptionDepuisConfiguration() {
    if (!conditionsAcceptees || rateLimitPaiement.estBloque || initialisationEnCours) return;

    const telCible =
      telephonePaiement.trim() ||
      statut?.telephone_paiement?.trim() ||
      utilisateur?.telephone?.trim() ||
      "";
    const moyenCible = moyenPaiement || statut?.moyen_prefere || "orange_money";

    if (moyenCible !== "carte" && !telCible) {
      toast.info(t("monCompte.veuillezRenseignerTelephone"));
      setModalOuvert(true);
      return;
    }

    setPushDirectEnCours(moyenCible !== "carte");
    setStatutPushDirect("attente");
    setMessageErreurPush(null);
    if (moyenCible !== "carte") {
      setModalOuvert(true);
    }

    await executerPaiementDirect(planSelectionne, moyenCible, telCible);
  }

  /**
   * Vérification manuelle lors du clic sur le bouton Actualiser
   */
  async function verifierStatutPaiementManuel() {
    if (!session?.reference || verificationManuelleEnCours) return;
    setVerificationManuelleEnCours(true);
    try {
      const res = await api.get<{ statut: string; reference_operateur?: string }>(`/paiements/${session.reference}`);
      if (res.reference_operateur && res.reference_operateur !== session.reference_operateur) {
        setSession((prev) => (prev ? { ...prev, reference_operateur: res.reference_operateur } : prev));
      }

      if (res.statut === "valide") {
        setStatutPushDirect("succes");
        toast.success(t("monCompte.abonnementActiveSucces"));
        await rafraichir();
        await chargerStatut();
        setTimeout(() => {
          setModalOuvert(false);
          setPushDirectEnCours(false);
          setStatutPushDirect("attente");
        }, 2000);
      } else if (res.statut === "echec" || res.statut === "annule") {
        setStatutPushDirect("echec");
        setMessageErreurPush(t("monCompte.transactionRefuseeDesc"));
      } else {
        toast.info(t("monCompte.paiementToujoursEnAttente"));
      }
    } catch {
      toast.error(t("monCompte.verificationImpossible"));
    } finally {
      setVerificationManuelleEnCours(false);
    }
  }

  /**
   * Déclenche le règlement auprès de SaasPay (Push USSD Softpay direct ou Checkout pré-rempli)
   */
  async function executerPaiementDirect(
    planCible: PlanAbonnement,
    moyenCible: MoyenPaiement,
    telCible: string
  ) {
    if (rateLimitPaiement.estBloque || initialisationEnCours) return;

    if (moyenCible !== "carte" && !telCible.trim()) {
      setPushDirectEnCours(false);
      toast.error(t("monCompte.veuillezRenseignerTelephone"));
      return;
    }

    setInitialisationEnCours(true);
    setMessageErreurPush(null);

    try {
      const reponse = await api.post<SessionPaiementReponse>("/paiements/initialiser", {
        plan: planCible,
        duree_mois: duree,
        moyen_souhaite: moyenCible,
        telephone: telCible,
        mode_direct: moyenCible !== "carte",
        return_url: window.location.origin + "/mon-compte/abonnement?statut=retour",
      });

      setSession(reponse);

      if (reponse.mode === "test") {
        setPushDirectEnCours(false);
        return;
      }

      if (reponse.type === "direct_push" || !reponse.payment_url) {
        setPushDirectEnCours(true);
        setStatutPushDirect("attente");
        toast.info(reponse.message || t("monCompte.demandePaiementEnvoyee"));
      } else if (reponse.payment_url) {
        toast.info(t("monCompte.redirectionPasserelle"));
        window.location.href = reponse.payment_url;
      }
    } catch (e) {
      setPushDirectEnCours(false);
      if (e instanceof ErreurApi) {
        rateLimitPaiement.gererErreur(e);
        toast.error(e.resume());
      } else {
        toast.error(t("commun.erreur"));
      }
    } finally {
      setInitialisationEnCours(false);
    }
  }

  async function executerPaiement() {
    await executerPaiementDirect(planSelectionne, moyenPaiement, telephonePaiement);
  }

  /**
   * Simulation en mode test pour vérifier le parcours sans débourser d'argent
   */
  async function validerSimulationTest(succes: boolean) {
    setSimulationEnCours(true);

    try {
      let ref = session?.reference;
      if (!ref) {
        const init = await api.post<SessionPaiementReponse>("/paiements/initialiser", {
          plan: planSelectionne,
          duree_mois: duree,
          moyen_souhaite: moyenPaiement,
          telephone: telephonePaiement,
          mode_direct: true,
          return_url: window.location.origin + "/mon-compte/abonnement?statut=retour",
        });
        ref = init.reference;
      }

      if (succes) {
        await api.post("/paiements/simuler-succes", {
          reference: ref,
          moyen_paiement: moyenPaiement,
        });

        toast.success(t("monCompte.abonnementActiveSucces"));
        setModalOuvert(false);
        setSession(null);
        await rafraichir();
        await chargerStatut();
      } else {
        await api.post("/paiements/simuler-echec", {
          reference: ref,
        });

        toast.error(t("monCompte.simulationEchecEffectuee"));
      }
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setSimulationEnCours(false);
    }
  }

  if (chargement || !statut) {
    return <SqueletteAbonnement />;
  }

  const estModeTest = statut.mode_paiement === "test";

  // Date future estimée après prolongation
  const dateActuelle = statut.echeance && !statut.est_expire ? new Date(statut.echeance) : new Date();
  const dateProlongee = new Date(dateActuelle);
  dateProlongee.setMonth(dateProlongee.getMonth() + duree);

  // Prochaine facture estimée
  const prochaineFactureInfo = (() => {
    if (!statut) return null;
    const plan = statut.plan || "standard";
    const tarifsPlan = statut.tarifs?.[plan];
    const devise = statut.tarifs?.devise || "XAF";

    const montant = tarifsPlan
      ? (duree === 12 ? tarifsPlan.annuel : tarifsPlan.mensuel)
      : (plan === "premium" ? 25000 : 10000);
    const datePrelevement = statut.echeance ? formatDateCourte(statut.echeance) : null;

    if (!datePrelevement) return null;

    return {
      montant: formatMontant(montant, devise),
      date: datePrelevement,
    };
  })();

  const planActif = statut.plan || "standard";
  const estPlanActuel = (plan: PlanAbonnement) => {
    return planActif === plan && !statut.est_expire;
  };

  const libelleBouton = (plan: PlanAbonnement) => {
    if (initialisationEnCours && planSelectionne === plan) {
      return t("monCompte.boutonInitialisation");
    }
    if (statut.est_essai && planActif === plan) {
      return plan === "premium"
        ? t("monCompte.boutonActiverPremium")
        : t("monCompte.boutonActiverStandard");
    }
    if (estPlanActuel(plan)) {
      return plan === "premium"
        ? t("monCompte.boutonProlongerPremium")
        : t("monCompte.boutonProlongerStandard");
    }
    return plan === "premium"
      ? t("monCompte.boutonObtenirPremium")
      : t("monCompte.boutonObtenirStandard");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 px-4 sm:px-6">
      {/* 1. Barre de navigation haute & environnement */}
      <div className="flex items-center justify-between pt-1">
        {estVueConfigurer ? (
          <button
            type="button"
            onClick={() => router.push("/mon-compte/abonnement", { scroll: false })}
            className="-ml-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("monCompte.retourAuxForfaits")}</span>
          </button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground hover:text-foreground cursor-pointer font-medium"
            nativeButton={false}
            render={<Link href="/mon-compte#facturation" />}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {t("monCompte.retourMonCompte")}
          </Button>
        )}

        {estModeTest && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            {t("monCompte.modeDemonstrationTest")}
          </span>
        )}
      </div>

      {estVueConfigurer ? (
        /* ------------------------------------------------------------- */
        /* VUE ÉCRAN DE CONFIGURATION DU FORFAIT (STYLE ANTHROPIC/CLAUDE) */
        /* ------------------------------------------------------------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* COLONNE GAUCHE (7 cols) : Sélecteur de formule et Mode de paiement */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
                {t("monCompte.configurezVotreForfait")}
              </h1>
            </div>

            {/* SÉLECTEUR RADIO MENSUEL / ANNUEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option Mensuel */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setDuree(1);
                  router.replace(
                    `/mon-compte/abonnement?vue=configurer&plan=${planSelectionne}&duree=1`,
                    { scroll: false },
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setDuree(1);
                    router.replace(
                      `/mon-compte/abonnement?vue=configurer&plan=${planSelectionne}&duree=1`,
                      { scroll: false },
                    );
                  }
                }}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  duree === 1
                    ? "border-sky-500/80 bg-sky-500/5 dark:bg-sky-500/10 ring-1 ring-sky-500/30 shadow-xs"
                    : "border-border/80 dark:border-border/60 hover:border-foreground/30 bg-card/60"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      duree === 1
                        ? "border-sky-500"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {duree === 1 && (
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">
                    {planSelectionne === "premium"
                      ? t("monCompte.formulePremiumMensuel")
                      : t("monCompte.formuleStandardMensuel")}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-heading text-foreground tabular-nums">
                    {formatMontant(
                      montantActuel(planSelectionne, 1),
                      statut.tarifs.devise,
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("monCompte.factureMensuellement")}
                  </div>
                </div>
              </div>

              {/* Option Annuel */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setDuree(12);
                  router.replace(
                    `/mon-compte/abonnement?vue=configurer&plan=${planSelectionne}&duree=12`,
                    { scroll: false },
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setDuree(12);
                    router.replace(
                      `/mon-compte/abonnement?vue=configurer&plan=${planSelectionne}&duree=12`,
                      { scroll: false },
                    );
                  }
                }}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  duree === 12
                    ? "border-sky-500/80 bg-sky-500/5 dark:bg-sky-500/10 ring-1 ring-sky-500/30 shadow-xs"
                    : "border-border/80 dark:border-border/60 hover:border-foreground/30 bg-card/60"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      duree === 12
                        ? "border-sky-500"
                        : "border-muted-foreground/40"
                    }`}
                  >
                    {duree === 12 && (
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    )}
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    {t("monCompte.economisez17")}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">
                    {planSelectionne === "premium"
                      ? t("monCompte.formulePremiumAnnuel")
                      : t("monCompte.formuleStandardAnnuel")}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-heading text-foreground tabular-nums">
                    {formatMontant(
                      montantActuel(planSelectionne, 12),
                      statut.tarifs.devise,
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("monCompte.factureAnnuellement")}
                  </div>
                </div>
              </div>
            </div>

            {/* Commutateur de formule (Standard vs Premium) */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground font-medium">
                {t("monCompte.formuleLabel")}
              </span>
              <div className="inline-flex items-center rounded-full bg-muted/60 border border-border/60 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setPlanSelectionne("standard");
                    router.replace(
                      `/mon-compte/abonnement?vue=configurer&plan=standard&duree=${duree}`,
                      { scroll: false },
                    );
                  }}
                  className={`rounded-full px-3 py-1 font-medium transition-all cursor-pointer ${
                    planSelectionne === "standard"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Standard 
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPlanSelectionne("premium");
                    router.replace(
                      `/mon-compte/abonnement?vue=configurer&plan=premium&duree=${duree}`,
                      { scroll: false },
                    );
                  }}
                  className={`rounded-full px-3 py-1 font-medium transition-all cursor-pointer ${
                    planSelectionne === "premium"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Premium 
                </button>
              </div>
            </div>

            {/* Section Mode de paiement */}
            <div className="space-y-3 pt-3">
              <h2 className="text-sm font-bold text-foreground">
                {t("monCompte.modalModePaiementTitre")}
              </h2>

              <div className="rounded-2xl border border-border/80 dark:border-border/60 bg-card/60 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  {moyenPaiement === "carte" ? (
                    <div className="flex items-center gap-3">
                      <IconeCarteBancaire className="h-6 w-9 rounded-xs shadow-xs shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {statut?.carte_info
                            ? statut.carte_info
                            : `${t("monCompte.carteBancaire")} (${t("monCompte.visaMastercard")})`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t("monCompte.paiementSecuriseSaaspay3d")}
                        </div>
                      </div>
                    </div>
                  ) : moyenPaiement === "orange_money" ? (
                    <div className="flex items-center gap-3">
                      <IconeOrangeMoney className="h-7 w-7 rounded-md shadow-xs shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {t("monCompte.orangeMoney")}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {telephonePaiement
                            ? t("monCompte.debitSurLeNumero", { tel: telephonePaiement })
                            : t("monCompte.numeroARenseigner")}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <IconeMtnMomo className="h-7 w-7 rounded-md shadow-xs shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          {t("monCompte.mtnMomo")}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {telephonePaiement
                            ? t("monCompte.debitSurLeNumero", { tel: telephonePaiement })
                            : t("monCompte.numeroARenseigner")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPushDirectEnCours(false);
                    setModalOuvert(true);
                  }}
                  className="p-2.5 rounded-xl border border-border/70 hover:border-foreground/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shrink-0"
                  title={t("monCompte.modifierMoyenPaiement")}
                  aria-label={t("monCompte.modifierMoyenPaiement")}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              {/* <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                Cliquez sur le crayon pour modifier votre opérateur ou saisir le
                numéro de débit.
              </p> */}
            </div>
          </div>

          {/* COLONNE DROITE (5 cols) : Carte Récapitulatif Claude Serif */}
          <div className="lg:col-span-5 lg:sticky lg:top-6">
            <div className="rounded-3xl border border-border/80 dark:border-border/60 bg-card/90 backdrop-blur-xs p-6 sm:p-7 shadow-xl space-y-5">
              {/* Titre Serif style Claude */}
              <div className="border-b border-border/60 pb-4">
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-foreground tracking-tight">
                  {planSelectionne === "premium"
                    ? t("monCompte.titreForfaitPremium")
                    : t("monCompte.titreForfaitStandard")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {planSelectionne === "premium"
                    ? t("monCompte.descForfaitPremiumCourt")
                    : t("monCompte.descForfaitStandardCourt")}
                </p>
              </div>

              {/* Détail du tarif */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>
                    {planSelectionne === "premium" ? "Premium" : "Standard"}{" "}
                    {duree === 12 ? t("monCompte.periodeAnnuel") : t("monCompte.periodeMensuel")}
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatMontant(
                      montantActuel(planSelectionne, duree),
                      statut.tarifs.devise,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{t("monCompte.sousTotal")}</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatMontant(
                      montantActuel(planSelectionne, duree),
                      statut.tarifs.devise,
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{t("monCompte.taxesEtFraisReseau")}</span>
                  <span className="text-xs text-muted-foreground italic">
                    {t("monCompte.inclusSelonReseau")}
                  </span>
                </div>

                <hr className="border-border/60 pt-1" />

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs font-bold text-foreground">
                    {t("monCompte.totalDuAujourdhui")}
                  </span>
                  <span className="text-xl font-extrabold font-heading text-foreground tabular-nums">
                    {formatMontant(
                      montantActuel(planSelectionne, duree),
                      statut.tarifs.devise,
                    )}
                  </span>
                </div>
              </div>

              {/* Encart réassurance / renouvellement */}
              <div className="rounded-2xl bg-muted/60 border border-border/60 p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground leading-relaxed space-y-1.5">
                    {moyenPaiement === "carte" ? (
                      <p>
                        {t("monCompte.renouvellementCarteNotice", {
                          date: formatDateCourte(dateProlongee.toISOString()),
                          montant: formatMontant(
                            montantActuel(planSelectionne, duree),
                            statut.tarifs.devise,
                          ),
                          periode: duree === 12 ? t("monCompte.an") : t("monCompte.mois"),
                        })}
                      </p>
                    ) : (
                      <p>
                        {t("monCompte.nonRenouvellementNotice", {
                          date: formatDateCourte(dateProlongee.toISOString()),
                        })}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground/80 italic">
                      {t("monCompte.fraisOperateurAvertissement")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Case à cocher CGU */}
              <div className="flex items-start gap-3 pt-1">
                <input
                  id="accord-cgu"
                  type="checkbox"
                  checked={conditionsAcceptees}
                  onChange={(e) => setConditionsAcceptees(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer shrink-0"
                />
                <label
                  htmlFor="accord-cgu"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
                >
                  {moyenPaiement === "carte"
                    ? t("monCompte.accordCguCartePre")
                    : t("monCompte.accordCguMobilePre")}
                  <Link
                    href="/legal/cgu"
                    target="_blank"
                    className="underline hover:text-foreground font-medium"
                  >
                    {t("monCompte.conditionsUtilisationLien")}
                  </Link>
                  {t("monCompte.accordCguSuffixePoint")}
                </label>
              </div>

              {/* Bouton S'abonner */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={
                    !conditionsAcceptees ||
                    initialisationEnCours ||
                    rateLimitPaiement.estBloque
                  }
                  onClick={validerSouscriptionDepuisConfiguration}
                  className={`w-full rounded-2xl py-3.5 px-6 text-sm font-semibold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                    !conditionsAcceptees ||
                    initialisationEnCours ||
                    rateLimitPaiement.estBloque
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                      : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                  }`}
                >
                  {initialisationEnCours ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("monCompte.boutonInitialisation")}</span>
                    </>
                  ) : (
                    <span>{t("monCompte.sAbonner")}</span>
                  )}
                </button>

                <p className="text-[11px] text-center text-muted-foreground">
                  {t("monCompte.paiementChiffreSansEngagement")}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Titre éditorial épuré (style Claude) */}
          <div className="text-center pt-2 sm:pt-4 space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-foreground tracking-tight">
                {/* Des forfaits qui évoluent avec vous */}
                {t("monCompte.desForfaitsQuiEvoluent")}
            </h1>
          </div>

          {/* 3. Sélecteur Mensuel / Annuel (remplace Particulier / Entreprise de Claude) */}
          <div className="flex justify-center mt-6 mb-6">
            <div className="inline-flex items-center rounded-full bg-muted/70 border border-border/50 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setDuree(1)}
                className={`rounded-full px-5 py-2 transition-all font-medium cursor-pointer ${
                  duree === 1
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("monCompte.mensuelSansEngagement")}
              </button>
              <button
                type="button"
                onClick={() => setDuree(12)}
                className={`rounded-full px-5 py-2 transition-all font-medium cursor-pointer flex items-center gap-1.5 ${
                  duree === 12
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{t("monCompte.annuelTitre")}</span>
                <span className="text-sky-600 dark:text-sky-400 font-semibold">
                  · {t("monCompte.economisez17")}
                </span>
              </button>
            </div>
          </div>

          {/* 4. Bandeau discret de réassurance / statut en cours */}
          {statut.est_essai && (
            <div className="flex justify-center -mt-2 mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  {t("monCompte.essaiActifBandeau", { jours: statut.jours_restants })}
                </span>
              </div>
            </div>
          )}
          {statut.est_expire && (
            <div className="flex justify-center -mt-2 mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-4 py-1.5 text-xs font-medium text-destructive">
                <XCircle className="h-3.5 w-3.5 text-destructive" />
                <span>
                  {t("monCompte.expireBandeau")}
                </span>
              </div>
            </div>
          )}
          {!statut.est_essai && !statut.est_expire && statut.echeance && (
            <div className="flex justify-center -mt-2 mb-6">
              <div className="inline-flex items-center gap-2  px-4 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                <span>
                  {t("monCompte.actifBandeau", {
                    plan: statut.plan === "premium" ? "Premium" : "Standard",
                    date: formatDateCourte(statut.echeance),
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Alerte Rate Limiting si nécessaire */}
          {rateLimitPaiement.estBloque && (
            <div className="max-w-md mx-auto mb-6">
              <AlerteRateLimit
                secondes={rateLimitPaiement.secondes}
                message={rateLimitPaiement.message}
                compact
              />
            </div>
          )}

          {/* 5. Grille des 2 forfaits (style Claude minimaliste, épuré et élégant) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto items-stretch pt-2">
            {/* CARTE STANDARD */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-border/80 dark:border-border/60 bg-card p-6 sm:p-8 shadow-xs hover:border-foreground/25 transition-all">
              <div>
                {/* Icône minimaliste */}
                <div className="text-foreground/80 mb-4">
                  <IconeClaudeStandard className="w-9 h-9" />
                </div>

                {/* Titre & Sous-titre minimal */}
                <h2 className="text-2xl font-bold font-heading text-foreground tracking-tight">
                  Standard
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 min-h-[38px] flex items-center">
                  {t("monCompte.taglineStandard")}
                </p>

                {/* Tarif */}
                <div className="mt-5 mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight tabular-nums">
                      {formatMontant(
                        montantActuel("standard", duree),
                        statut.tarifs.devise,
                      )}
                    </span>
                    <div className="text-xs text-muted-foreground leading-tight">
                      <div>
                        {duree === 12
                          ? t("monCompte.factureAnnuellementCourt")
                          : t("monCompte.parMoisCourt")}
                      </div>
                      {duree === 12 && (
                        <div className="text-sky-600 dark:text-sky-400 font-medium pt-0.5">
                          {t("monCompte.soitMontantParMois", {
                            montant: formatMontant(
                              Math.round(statut.tarifs.standard.annuel / 12),
                              statut.tarifs.devise,
                            ),
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bouton d'action pilule (noir en light, blanc en dark, épuré) */}
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={
                      initialisationEnCours || rateLimitPaiement.estBloque
                    }
                    onClick={() => naviguerVersConfiguration("standard")}
                    className={`w-full rounded-full py-3.5 px-6 text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                      estPlanActuel("standard")
                        ? "border border-border bg-muted/40 hover:bg-muted text-foreground"
                        : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                    }`}
                  >
                    {initialisationEnCours && planSelectionne === "standard" ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t("commun.chargement")}</span>
                      </span>
                    ) : (
                      libelleBouton("standard")
                    )}
                  </button>

                  <p className="text-[11px] text-center text-muted-foreground">
                    {t("monCompte.sansEngagementAnnulation")}
                  </p>
                </div>

                {/* Séparateur fin */}
                <hr className="border-border/60 my-6" />

                {/* Inclusions */}
                <div className="space-y-3.5">
                  <p className="text-xs font-semibold text-foreground/80">
                    {t("monCompte.inclusionsStandardTitre")}
                  </p>
                  <ul className="space-y-3">
                    {caracteristiquesStandard.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CocheMinimaliste />
                        <span className="text-xs sm:text-sm text-foreground/90 font-normal leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* CARTE PREMIUM */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-border/80 dark:border-border/60 bg-card p-6 sm:p-8 shadow-xs hover:border-foreground/25 transition-all">
              <div>
                {/* Icône minimaliste */}
                <div className="text-foreground/80 mb-4">
                  <IconeClaudePremium className="w-9 h-9" />
                </div>

                {/* Titre & Sous-titre minimal */}
                <h2 className="text-2xl font-bold font-heading text-foreground tracking-tight">
                  Premium
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 min-h-[38px] flex items-center">
                  {t("monCompte.taglinePremium")}
                </p>

                {/* Tarif */}
                <div className="mt-5 mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight tabular-nums">
                      {formatMontant(
                        montantActuel("premium", duree),
                        statut.tarifs.devise,
                      )}
                    </span>
                    <div className="text-xs text-muted-foreground leading-tight">
                      <div>
                        {duree === 12
                          ? t("monCompte.factureAnnuellementCourt")
                          : t("monCompte.parMoisCourt")}
                      </div>
                      {duree === 12 && (
                        <div className="text-sky-600 dark:text-sky-400 font-medium pt-0.5">
                          {t("monCompte.soitMontantParMois", {
                            montant: formatMontant(
                              Math.round(statut.tarifs.premium.annuel / 12),
                              statut.tarifs.devise,
                            ),
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bouton d'action pilule (noir en light, blanc en dark, épuré) */}
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={
                      initialisationEnCours || rateLimitPaiement.estBloque
                    }
                    onClick={() => naviguerVersConfiguration("premium")}
                    className={`w-full rounded-full py-3.5 px-6 text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                      estPlanActuel("premium")
                        ? "border border-border bg-muted/40 hover:bg-muted text-foreground"
                        : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                    }`}
                  >
                    {initialisationEnCours && planSelectionne === "premium" ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t("commun.chargement")}</span>
                      </span>
                    ) : (
                      libelleBouton("premium")
                    )}
                  </button>

                  <p className="text-[11px] text-center text-muted-foreground">
                    {t("monCompte.sansEngagementAnnulation")}
                  </p>
                </div>

                {/* Séparateur fin */}
                <hr className="border-border/60 my-6" />

                {/* Inclusions */}
                <div className="space-y-3.5">
                  <p className="text-xs font-semibold text-foreground/80">
                    {t("monCompte.inclusionsPremiumPlus")}
                  </p>
                  <ul className="space-y-3">
                    {caracteristiquesPremium.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CocheMinimaliste />
                        <span className="text-xs sm:text-sm text-foreground/90 font-normal leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 5.b Option Renouvellement Automatique par Carte */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-border/80 dark:border-border/60 bg-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs mt-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-foreground/80" />
                <h3 className="text-sm font-bold text-foreground">
                  {t("monCompte.renouvellementAutoCarteTitre")}
                </h3>
                {statut.renouvellement_auto ? (
                  <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 border border-emerald-500/20 uppercase tracking-wide">
                    {t("monCompte.statutActiveBadge")}
                  </span>
                ) : (
                  <span className="rounded-full bg-muted text-muted-foreground text-[10px] font-semibold px-2.5 py-0.5 border border-border/60 uppercase tracking-wide">
                    {t("monCompte.statutDesactiveBadge")}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                {statut.renouvellement_auto
                  ? t("monCompte.renouvellementAutoActiveDesc", {
                      carte: statut.carte_info
                        ? t("monCompte.avecVotreCarte", { info: statut.carte_info })
                        : t("monCompte.avecVotreCarteBancaire"),
                    })
                  : t("monCompte.renouvellementAutoDesactiveDesc")}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                disabled={chargementRenouvellement}
                onClick={basculerRenouvellementAuto}
                className={`rounded-full px-5 py-2.5 text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                  statut.renouvellement_auto
                    ? "border border-border bg-muted/40 hover:bg-muted text-foreground"
                    : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                }`}
              >
                {chargementRenouvellement ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t("monCompte.miseAJourEnCours")}</span>
                  </span>
                ) : statut.renouvellement_auto ? (
                  t("monCompte.desactiverRenouvellement")
                ) : (
                  t("monCompte.activerRenouvellement")
                )}
              </button>
            </div>
          </div>

          {/* 6. Note de bas de page & Liens utiles */}
          <div className="pt-10 text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-l text-muted-foreground leading-relaxed">
              {t("monCompte.noteDiscretionPrix")}
            </p>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. MODALE "RÉGLER VOTRE ABONNEMENT" (REFONDUE ET 100% LISIBLE) */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={modalOuvert} onOpenChange={setModalOuvert}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border shadow-2xl">
          {/* En-tête fixe avec fond clair/sombre contrasté (uniquement en formulaire de saisie) */}
          {!pushDirectEnCours && (
            <DialogHeader className="bg-muted/40 px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b">
              <div className="flex items-center gap-2.5">
                <div>
                  <DialogTitle className="text-lg sm:text-xl font-heading font-bold text-foreground">
                    {t("monCompte.modalModePaiementTitre")}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {t("monCompte.modalModePaiementDesc")}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          )}

          {/* Corps défilable sans coupure avec DialogCorps */}
          <DialogCorps className="px-4 py-5 sm:px-6 sm:py-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[75vh]">
            {pushDirectEnCours ? (
              /* ÉCRAN EXACT DEMANDÉ : LOGO TELORA AVEC SPINNER CIRCULAIRE SANS ICÔNE INUTILE */
              <div className="py-2 px-2 text-center space-y-6">
                {statutPushDirect === "attente" && (
                  <div className="space-y-5">
                    {/* 1. Titre et Nom de l'opérateur */}
                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground tracking-tight">
                        {t("monCompte.enAttenteDePaiement")}
                      </h3>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {moyenPaiement === "orange_money"
                          ? t("monCompte.orangeMoney")
                          : moyenPaiement === "mtn_momo"
                            ? t("monCompte.mtnMomo")
                            : t("monCompte.carteBancaire")}
                      </p>
                    </div>

                    {/* 2. Logo Telora avec Spinner circulaire tout autour (sans icône inutile) */}
                    <div className="relative mx-auto flex items-center justify-center h-32 w-32 my-2">
                      {/* Spinner de points orbitaux en rotation fluide avec dégradé cyan / bleu Telora */}
                      <svg
                        className="absolute inset-0 h-full w-full animate-spin [animation-duration:2.5s]"
                        viewBox="0 0 120 120"
                      >
                        <defs>
                          <linearGradient
                            id="spinner-telora-cyan"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#00F5FF" />
                            <stop offset="100%" stopColor="#0088FF" />
                          </linearGradient>
                        </defs>
                        {Array.from({ length: 12 }).map((_, i) => {
                          const angle = (i * 30 * Math.PI) / 180;
                          const r = 46;
                          const cx = 60 + r * Math.cos(angle);
                          const cy = 60 + r * Math.sin(angle);
                          const dotRadius = 2.2 + (i / 11) * 3.6;
                          const opacity = 0.15 + (i / 11) * 0.85;
                          return (
                            <circle
                              key={i}
                              cx={cx}
                              cy={cy}
                              r={dotRadius}
                              fill="url(#spinner-telora-cyan)"
                              opacity={opacity}
                            />
                          );
                        })}
                      </svg>

                      {/* Emblème officiel Telora au centre exact */}
                      <div className="relative z-10 flex items-center justify-center rounded-full p-2 bg-background shadow-xs">
                        <IconeTelora size={44} />
                      </div>
                    </div>

                    {/* 3. Bouton Actualiser */}
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={verificationManuelleEnCours}
                        onClick={verifierStatutPaiementManuel}
                        className="rounded-lg border-border px-4 py-2 text-xs font-semibold text-foreground shadow-xs hover:bg-muted cursor-pointer transition-colors"
                      >
                        <RefreshCw
                          className={`mr-1.5 h-3.5 w-3.5 text-primary ${verificationManuelleEnCours ? "animate-spin" : ""}`}
                        />
                        <span>{t("monCompte.actualiser")}</span>
                      </Button>
                    </div>

                    {/* 4. Statut du Paiement */}
                    <div className="space-y-2 pt-1">
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                        {t("monCompte.statutDuPaiement")}{" "}
                        <span className="font-bold text-amber-500 uppercase tracking-wide">
                          {t("monCompte.enAttenteDePaiementMaj")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        {t("monCompte.validerDemandeSurTelephone")}
                      </p>

                      {telephonePaiement && (
                        <div className="pt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                          <span>{t("monCompte.envoyeSurLe")}</span>
                          <span className="font-semibold text-foreground font-mono">
                            {telephonePaiement}
                          </span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPushDirectEnCours(false);
                              setStatutPushDirect("attente");
                            }}
                            className="text-primary hover:underline font-medium cursor-pointer"
                          >
                            {t("monCompte.changer")}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 5. Bouton Fermer pour revenir à l'accueil / formule */}
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setPushDirectEnCours(false);
                          setStatutPushDirect("attente");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>{t("commun.fermer")}</span>
                      </Button>
                    </div>
                  </div>
                )}

                {statutPushDirect === "succes" && (
                  <div className="space-y-4 py-6">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                      <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold font-heading text-foreground">
                        {t("monCompte.paiementValideSucces")}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {t("monCompte.boutiquePreteDesc")}
                      </p>
                    </div>
                  </div>
                )}

                {statutPushDirect === "echec" && (
                  <div className="space-y-4 py-6">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                      <XCircle className="h-12 w-12" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold font-heading text-foreground">
                        {t("monCompte.echecOuDelaiExpire")}
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        {messageErreurPush ||
                          t("monCompte.transactionRefuseeDesc")}
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        className="cursor-pointer font-semibold text-xs"
                        onClick={() => {
                          setPushDirectEnCours(false);
                          setStatutPushDirect("attente");
                        }}
                      >
                        {t("monCompte.reessayerPaiement")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="cursor-pointer font-semibold text-xs"
                        onClick={() => setModalOuvert(false)}
                      >
                        {t("commun.fermer")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* FORMULAIRE ÉPURÉ : CHOISIR OU MODIFIER LE MOYEN DE PAIEMENT */
              <div className="space-y-5">
                {/* 1. Sélection de l'opérateur avec affichage direct du numéro ou carte enregistrée */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <span>{t("monCompte.modePaiementLabel")}</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* ORANGE MONEY AVEC LOGO OFFICIEL */}
                    <button
                      type="button"
                      onClick={() => choisirMoyenPaiement("orange_money")}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        moyenPaiement === "orange_money"
                          ? "border-[#FF7900] bg-[#FF7900]/10 ring-2 ring-[#FF7900]/30 shadow-xs"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      {moyenPaiement === "orange_money" && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF7900] text-white">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                      <IconeOrangeMoney className="h-8 w-8 mb-1.5 rounded-md shadow-xs" />
                      <span className="font-bold text-xs text-foreground">
                        {t("monCompte.orangeMoney")}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate max-w-full px-1">
                        {telephoneOrange || t("monCompte.nonConfigure")}
                      </span>
                    </button>

                    {/* MTN MOMO AVEC LOGO OFFICIEL */}
                    <button
                      type="button"
                      onClick={() => choisirMoyenPaiement("mtn_momo")}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        moyenPaiement === "mtn_momo"
                          ? "border-[#FFCC00] bg-[#FFCC00]/15 ring-2 ring-[#FFCC00]/40 shadow-xs"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      {moyenPaiement === "mtn_momo" && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFCC00] text-neutral-900">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                      <IconeMtnMomo className="h-8 w-8 mb-1.5 rounded-md shadow-xs" />
                      <span className="font-bold text-xs text-foreground">
                        {t("monCompte.mtnMomo")}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate max-w-full px-1">
                        {telephoneMtn || t("monCompte.nonConfigure")}
                      </span>
                    </button>

                    {/* CARTE BANCAIRE AVEC LOGOS OFFICIELS */}
                    <button
                      type="button"
                      onClick={() => choisirMoyenPaiement("carte")}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        moyenPaiement === "carte"
                          ? "border-blue-600 bg-blue-600/10 ring-2 ring-blue-600/30 shadow-xs"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      {moyenPaiement === "carte" && (
                        <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                      <IconeCarteBancaire className="h-8 w-12 mb-1.5 rounded-xs shadow-xs" />
                      <span className="font-bold text-xs text-foreground">
                        {t("monCompte.carteBancaire")}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate max-w-full px-1">
                        {statut?.carte_info
                          ? statut.carte_info.split(" ")[1] || t("monCompte.numeroEnregistreCourt")
                          : t("monCompte.visaMastercard")}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. Détail spécifique au mode sélectionné */}
                {moyenPaiement !== "carte" ? (
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>
                          {moyenPaiement === "orange_money"
                            ? t("monCompte.numeroOrangeMoneyLabel")
                            : t("monCompte.numeroMtnMomoLabel")}
                        </span>
                      </span>
                      {(moyenPaiement === "orange_money" ? telephoneOrange : telephoneMtn) && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {t("monCompte.numeroEnregistreBadge")}
                        </span>
                      )}
                    </label>

                    <ChampTelephone
                      valeur={telephonePaiement}
                      onChange={changerTelephone}
                      placeholder="ex: 699 00 00 00"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {t("monCompte.demandeDebitSurCeNumero", {
                        moyen: moyenPaiement === "orange_money"
                          ? t("monCompte.orangeMoney")
                          : t("monCompte.mtnMomo"),
                      })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    {statut?.a_carte_enregistree ? (
                      <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconeCarteBancaire className="h-6 w-9 rounded-xs shadow-xs shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-foreground">
                              {statut.carte_info || t("monCompte.carteBancaireEnregistree")}
                            </div>
                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              {t("monCompte.carteActivePrete")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{t("monCompte.paiementSecuriseCarteTitre")}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {t("monCompte.redirectionSaaspayCarteDesc")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogCorps>

          {/* Pied fixe de la modale */}
          {!pushDirectEnCours && (
            <DialogFooter className="px-4 py-3 sm:px-6 sm:py-3.5 border-t bg-muted/30 flex items-center justify-end sm:justify-end gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs cursor-pointer font-medium"
                  onClick={() => setModalOuvert(false)}
                  disabled={enregistrementMoyenEnCours}
                >
                  {t("commun.annuler")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="text-xs font-bold cursor-pointer"
                  disabled={enregistrementMoyenEnCours}
                  onClick={enregistrerMoyenPaiement}
                >
                  {enregistrementMoyenEnCours ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  <span>{t("monCompte.enregistrerCeMoyen")}</span>
                </Button>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 6. MODALE CONFIRMATION ANNULATION (RASSURANTE ET HUMAINE)     */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={modalAnnulationOuverte}
        onOpenChange={setModalAnnulationOuverte}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-heading font-bold text-foreground">
              {t("monCompte.annulerAbonnementTitre")}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {t("monCompte.accesGarantiJusquAu", {
                date: statut.echeance
                  ? formatDateCourte(statut.echeance)
                  : t("monCompte.termeDeLaPeriode"),
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/30 p-3.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>{t("monCompte.aucunPrelevementForceTitre")}</strong> : {t("monCompte.aucunPrelevementForceDesc")}
              </span>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-muted/30 p-3.5">
              <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>{t("monCompte.donneesSauvegardeesTitre")}</strong> : {t("monCompte.donneesSauvegardeesDesc")}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalAnnulationOuverte(false);
                toast.info(t("monCompte.demandeNonRenouvellementPriseEnCompte"));
              }}
              className="cursor-pointer"
            >
              {t("monCompte.confirmerArretForfait")}
            </Button>
            <Button
              type="button"
              onClick={() => setModalAnnulationOuverte(false)}
              className="cursor-pointer font-semibold"
            >
              {t("monCompte.garderMonAbonnement")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
