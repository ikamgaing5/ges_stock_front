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
import { useSearchParams } from "next/navigation";
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
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  Store,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { Apparait, TitrePage } from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function PageAbonnement() {
  const { utilisateur, rafraichir } = useAuth();
  const { t, lang, formatMontant, formatDateCourte } = useI18n();
  const searchParams = useSearchParams();

  const [statut, setStatut] = useState<StatutAbonnementComplet | null>(null);
  const [chargement, setChargement] = useState(true);

  // Choix de la formule
  const [duree, setDuree] = useState<1 | 12>(1); // 1 mois ou 12 mois
  const [planSelectionne, setPlanSelectionne] = useState<PlanAbonnement>("standard");
  const [moyenPaiement, setMoyenPaiement] = useState<MoyenPaiement>("orange_money");
  const [telephonePaiement, setTelephonePaiement] = useState("");

  // Modale de paiement
  const [modalOuvert, setModalOuvert] = useState(false);
  const [session, setSession] = useState<SessionPaiementReponse | null>(null);
  const [initialisationEnCours, setInitialisationEnCours] = useState(false);
  const [simulationEnCours, setSimulationEnCours] = useState(false);

  const chargerStatut = useCallback(async () => {
    try {
      const data = await api.get<StatutAbonnementComplet>("/abonnements/statut");
      setStatut(data);
      if (data.plan) {
        setPlanSelectionne(data.plan);
      }
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void chargerStatut();
    if (utilisateur?.telephone) {
      setTelephonePaiement(utilisateur.telephone);
    }
  }, [chargerStatut, utilisateur]);

  // Retour de passerelle CinetPay externe
  useEffect(() => {
    if (searchParams.get("statut") === "retour") {
      void chargerStatut();
      void rafraichir();
      toast.info(
        lang === "en"
          ? "Confirming your subscription with the network..."
          : "Confirmation de votre abonnement auprès de l'opérateur…",
      );
    }
  }, [searchParams, chargerStatut, rafraichir, lang]);

  // Calcul du tarif
  const montantActuel = (plan: PlanAbonnement, d: 1 | 12) => {
    if (!statut) return 0;
    const tPlan = statut.tarifs[plan];
    return d === 12 ? tPlan.annuel : tPlan.mensuel;
  };

  /**
   * Initialise la session de règlement
   */
  async function ouvrirModalPaiement(planChoisi: PlanAbonnement) {
    setPlanSelectionne(planChoisi);
    setInitialisationEnCours(true);

    try {
      const reponse = await api.post<SessionPaiementReponse>("/paiements/initialiser", {
        plan: planChoisi,
        duree_mois: duree,
        moyen_souhaite: moyenPaiement,
        return_url: window.location.origin + "/mon-compte/abonnement?statut=retour",
      });

      setSession(reponse);
      setModalOuvert(true);
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setInitialisationEnCours(false);
    }
  }

  /**
   * Simulation en mode test pour vérifier le parcours sans débourser d'argent
   */
  async function validerSimulationTest(succes: boolean) {
    if (!session) return;
    setSimulationEnCours(true);

    try {
      if (succes) {
        await api.post("/paiements/simuler-succes", {
          reference: session.reference,
          moyen_paiement: moyenPaiement,
        });

        toast.success(
          lang === "en"
            ? "Your subscription is now active! Your store is fully unlocked."
            : "Votre abonnement est activé ! Votre boutique reste ouverte sans interruption.",
        );

        setModalOuvert(false);
        setSession(null);
        await rafraichir();
        await chargerStatut();
      } else {
        await api.post("/paiements/simuler-echec", {
          reference: session.reference,
        });

        toast.error(
          lang === "en"
            ? "Payment simulation declined (test mode)."
            : "Simulation d'échec effectuée (mode test).",
        );
      }
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setSimulationEnCours(false);
    }
  }

  if (chargement || !statut) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const estModeTest = statut.mode_paiement === "test";

  // Date future estimée après prolongation
  const dateActuelle = statut.echeance && !statut.est_expire ? new Date(statut.echeance) : new Date();
  const dateProlongee = new Date(dateActuelle);
  dateProlongee.setMonth(dateProlongee.getMonth() + duree);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* ------------------------------------------------------------- */}
      {/* Navigation et Titre chaleureux                                */}
      {/* ------------------------------------------------------------- */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          nativeButton={false}
          render={<Link href="/mon-compte" />}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {lang === "en" ? "Back to my account" : "Retour à mon compte"}
        </Button>

        <TitrePage
          titre={
            lang === "en"
              ? "Keep your store running smoothly"
              : "Choisissez votre formule pour travailler l'esprit tranquille"
          }
          description={
            lang === "en"
              ? "Simple, predictable plans designed for phone retailers. Pay easily using Orange Money, MTN MoMo or your bank card."
              : "Fini les cahiers froissés, les doutes en fin de journée et les téléphones égarés. Choisissez votre forfait et réglez facilement par Orange Money, MTN MoMo ou Carte bancaire."
          }
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. Bandeau d'état actuel : humain, clair et bienveillant       */}
      {/* ------------------------------------------------------------- */}
      <Apparait index={0}>
        <Card
          className={`border shadow-xs ${
            statut.est_expire
              ? "border-destructive/40 bg-destructive/5"
              : statut.est_essai
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-emerald-500/30 bg-emerald-500/5"
          }`}
        >
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6">
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  statut.est_expire
                    ? "bg-destructive text-white"
                    : statut.est_essai
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-600 text-white"
                }`}
              >
                {statut.est_expire ? (
                  <XCircle className="h-6 w-6" />
                ) : statut.est_essai ? (
                  <Clock className="h-6 w-6" />
                ) : (
                  <ShieldCheck className="h-6 w-6" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading font-semibold text-foreground text-base">
                    {statut.est_expire
                      ? lang === "en"
                        ? "Your trial has concluded"
                        : "Votre période d'essai gratuit est terminée"
                      : statut.est_essai
                        ? lang === "en"
                          ? `Free Trial Period (${statut.jours_restants} days left)`
                          : `Période d'essai offerte (${statut.jours_restants} ${statut.jours_restants > 1 ? "jours restants" : "jour restant"})`
                        : lang === "en"
                          ? `Your shop is active (${statut.plan === "premium" ? "Premium Plan" : "Standard Plan"})`
                          : `Votre boutique est active et en règle (${statut.plan === "premium" ? "Formule Premium" : "Formule Standard"})`}
                  </h3>

                  {statut.est_premium && (
                    <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary uppercase">
                      Multi-Boutiques
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {statut.est_expire
                    ? lang === "en"
                      ? "Your 14 days of free testing have ended. Choose your plan below so your sales team can keep scanning and selling phones peacefully."
                      : "Vos 14 jours d'essai gratuits sont arrivés à leur terme. Choisissez votre formule ci-dessous pour que vos vendeuses continuent d'enregistrer les ventes au comptoir sans interruption."
                    : statut.est_essai
                      ? lang === "en"
                        ? "Take all the time you need to scan your incoming stock and record your sales. No payment or credit card is required during your trial."
                        : "Prenez tout votre temps pour scanner vos cartons d'arrivage, tester avec vos vendeuses et vérifier vos clôtures de caisse. Aucun paiement n'est exigé avant la fin de vos 14 jours."
                      : lang === "en"
                        ? `Everything is covered until ${statut.echeance ? formatDateCourte(statut.echeance) : "—"}. You can extend anytime with no penalty.`
                        : `Tout fonctionne sans souci jusqu'au ${statut.echeance ? formatDateCourte(statut.echeance) : "—"} (${statut.jours_restants} jours restants). Vous pouvez prolonger à tout moment pour être serein.`}
                </p>
              </div>
            </div>

            {/* Indicateur d'environnement */}
            <div className="shrink-0 self-start sm:self-center">
              {estModeTest ? (
                <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>{lang === "en" ? "Testing Environment" : "Mode Test (Sans frais)"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{lang === "en" ? "Direct Orange & MTN" : "Paiements Sécurisés"}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Apparait>

      {/* ------------------------------------------------------------- */}
      {/* 2. Bascule Mensuel / Annuel (2 mois offerts)                  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col items-center justify-center gap-2 pt-2">
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {lang === "en" ? "How often would you like to pay?" : "À quel rythme préférez-vous régler ?"}
        </p>

        <div className="inline-flex items-center rounded-xl border bg-muted/40 p-1.5 text-sm shadow-xs">
          <button
            type="button"
            onClick={() => setDuree(1)}
            className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              duree === 1
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang === "en" ? "Every month (flexible)" : "Au mois le mois (sans engagement)"}
          </button>

          <button
            type="button"
            onClick={() => setDuree(12)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              duree === 12
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{lang === "en" ? "1 Full Year" : "Pour toute l'année"}</span>
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              {lang === "en" ? "2 months free" : "2 mois offerts "}
            </span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Les Formules : Standard (1 boutique) vs Premium (multi)   */}
      {/* ------------------------------------------------------------- */}
      <div className="grid gap-6 md:grid-cols-2 pt-2">
        {/* FORMULE STANDARD */}
        <Apparait index={1}>
          <Card
            className={`flex flex-col justify-between border-2 transition-all ${
              planSelectionne === "standard"
                ? "border-primary shadow-lg"
                : "border-border hover:border-foreground/25"
            }`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-heading font-bold text-foreground">
                    {lang === "en" ? "Standard Plan" : "Formule Standard"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "en"
                      ? "For a single store wanting order and zero phone loss"
                      : "Idéal pour sécuriser 1 magasin et en finir avec les pertes"}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Store className="h-5 w-5" />
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-foreground">
                    {formatMontant(montantActuel("standard", duree), statut.tarifs.devise)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {duree === 12
                      ? lang === "en"
                        ? "/ year (12 months)"
                        : " / an (12 mois complets)"
                      : lang === "en"
                        ? "/ month"
                        : " / mois"}
                  </span>
                </div>
                {duree === 12 && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    {lang === "en"
                      ? "Pay 10 months, your store is covered for 12 months!"
                      : "Vous payez 10 mois, votre magasin est ouvert et tranquille pendant 1 an !"}
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>1 Boutique physique complète</strong> : votre point de vente principal.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Scannage IMEI illimité</strong> : enregistrez chaque carton en 3 secondes avec votre douchette ou téléphone.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Gestion de caisse & ventes</strong> : sachez exactement combien d&apos;espèces vous devez trouver dans le tiroir à 19h.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Comptes vendeuses protégés</strong> : elles enregistrent les ventes sans jamais voir vos prix d&apos;achat confidentiels.
                  </span>
                </div>
              </div>

              {/* Moyens de paiement acceptés avec logos officiels */}
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-medium">Paiement accepté par :</span>
                <div className="flex items-center gap-2">
                  <IconeOrangeMoney className="h-5 w-5 rounded-sm shadow-xs" />
                  <IconeMtnMomo className="h-5 w-5 rounded-sm shadow-xs" />
                  <IconeCarteBancaire className="h-5 w-8 rounded-sm shadow-xs" />
                </div>
              </div>

              <Button
                type="button"
                variant={planSelectionne === "standard" ? "default" : "outline"}
                className="w-full font-semibold cursor-pointer py-5 text-sm"
                disabled={initialisationEnCours}
                onClick={() => ouvrirModalPaiement("standard")}
              >
                {initialisationEnCours && planSelectionne === "standard" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                {lang === "en" ? "Activate Standard Plan" : "Activer la Formule Standard"}
              </Button>
            </CardContent>
          </Card>
        </Apparait>

        {/* FORMULE PREMIUM */}
        <Apparait index={2}>
          <Card
            className={`flex flex-col justify-between border-2 relative overflow-hidden transition-all ${
              planSelectionne === "premium"
                ? "border-primary shadow-xl bg-primary/5"
                : "border-border hover:border-foreground/25"
            }`}
          >
            <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-3.5 py-1 text-[10px] font-bold text-primary-foreground uppercase tracking-wide">
              {lang === "en" ? "Multi-store favorite" : "Le préféré des multi-boutiques"}
            </div>

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-heading font-bold text-foreground">
                    {lang === "en" ? "Premium Plan" : "Formule Premium"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "en"
                      ? "For merchants running 2, 3 or more shops"
                      : "Pour les commerçants qui ont 2 boutiques ou plus (Akwa, Yaoundé, etc.)"}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Store className="h-5 w-5" />
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-foreground">
                    {formatMontant(montantActuel("premium", duree), statut.tarifs.devise)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {duree === 12
                      ? lang === "en"
                        ? "/ year (12 months)"
                        : " / an (12 mois complets)"
                      : lang === "en"
                        ? "/ month"
                        : " / mois"}
                  </span>
                </div>
                {duree === 12 && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    {lang === "en"
                      ? "Pay 10 months, your stores are covered for 12 months!"
                      : "Vous payez 10 mois, toutes vos boutiques sont couvertes pendant 1 an !"}
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5 font-semibold text-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Boutiques et magasins illimités</strong> : pilotez tous vos points de vente sur votre téléphone.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Transferts inter-boutiques tracés</strong> : sachez qui a envoyé quel carton et quelle boutique l&apos;a reçu.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Bénéfice net réel par boutique</strong> : suivez vos vraies marges après déduction de vos dépenses.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Exports Excel & comptabilité</strong> : pour vos bilans ou vos associés en fin de mois.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Assistance WhatsApp prioritaire</strong> : notre équipe répond directement à vos urgences du quotidien.
                  </span>
                </div>
              </div>

              {/* Moyens de paiement acceptés avec logos officiels */}
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-medium">Paiement accepté par :</span>
                <div className="flex items-center gap-2">
                  <IconeOrangeMoney className="h-5 w-5 rounded-sm shadow-xs" />
                  <IconeMtnMomo className="h-5 w-5 rounded-sm shadow-xs" />
                  <IconeCarteBancaire className="h-5 w-8 rounded-sm shadow-xs" />
                </div>
              </div>

              <Button
                type="button"
                variant="default"
                className="w-full font-semibold shadow-md cursor-pointer py-5 text-sm"
                disabled={initialisationEnCours}
                onClick={() => ouvrirModalPaiement("premium")}
              >
                {initialisationEnCours && planSelectionne === "premium" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                {lang === "en" ? "Activate Premium Plan" : "Activer la Formule Premium"}
              </Button>
            </CardContent>
          </Card>
        </Apparait>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Réassurance humaine : pas de piège ni d'engagement forcé   */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border bg-muted/20 p-5 mt-6 grid sm:grid-cols-3 gap-4 text-xs sm:text-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Aucun prélèvement surprise</h4>
            <p className="text-muted-foreground mt-0.5 leading-relaxed text-xs">
              Vous gardez la main. C&apos;est vous qui confirmez chaque règlement avec votre code secret Mobile Money.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Vos stocks restent intacts</h4>
            <p className="text-muted-foreground mt-0.5 leading-relaxed text-xs">
              Même si votre forfait expire, vos appareils enregistrés et vos numéros IMEI restent sauvegardés en sécurité.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Une question avant de payer ?</h4>
            <p className="text-muted-foreground mt-0.5 leading-relaxed text-xs">
              Notre équipe d&apos;assistance est à votre écoute pour vous guider selon la taille de votre magasin.
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. MODALE "RÉGLER VOTRE ABONNEMENT" (REFONDUE ET 100% LISIBLE) */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={modalOuvert} onOpenChange={setModalOuvert}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden border shadow-2xl">
          {/* En-tête fixe avec fond clair/sombre contrasté et typographie nette */}
          <DialogHeader className="bg-muted/40 px-6 pt-6 pb-4 border-b">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-heading font-bold text-foreground">
                  Régler votre abonnement
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Activation instantanée et sécurisée de votre boutique.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Corps défilable sans coupure avec DialogCorps */}
          {session && (
            <DialogCorps className="px-6 py-5 space-y-5 overflow-y-auto max-h-[65vh]">
              {/* Carte récapitulative haute visibilité */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-primary tracking-wider">
                    {session.plan === "premium" ? "Formule Premium (Multi-Boutiques)" : "Formule Standard"}
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    Durée : {session.duree_mois === 12 ? "1 an complet (12 mois)" : "1 mois"}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Boutique active jusqu&apos;au {formatDateCourte(dateProlongee.toISOString())}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Montant à régler</span>
                  <span className="text-2xl font-bold font-mono text-foreground">
                    {formatMontant(session.montant, session.devise)}
                  </span>
                </div>
              </div>

              {/* Étape 1 : Choix de l'opérateur avec LOGOS OFFICIELS */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <span>1. Choisissez votre moyen de paiement :</span>
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* ORANGE MONEY AVEC LOGO OFFICIEL */}
                  <button
                    type="button"
                    onClick={() => setMoyenPaiement("orange_money")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      moyenPaiement === "orange_money"
                        ? "border-[#FF7900] bg-[#FF7900]/10 ring-2 ring-[#FF7900]/30 shadow-xs"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <IconeOrangeMoney className="h-8 w-8 mb-2 rounded-md shadow-xs" />
                    <span className="font-bold text-xs text-foreground">Orange Money</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">Push ou #150#</span>
                  </button>

                  {/* MTN MOMO AVEC LOGO OFFICIEL */}
                  <button
                    type="button"
                    onClick={() => setMoyenPaiement("mtn_momo")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      moyenPaiement === "mtn_momo"
                        ? "border-[#FFCC00] bg-[#FFCC00]/15 ring-2 ring-[#FFCC00]/40 shadow-xs"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <IconeMtnMomo className="h-8 w-8 mb-2 rounded-md shadow-xs" />
                    <span className="font-bold text-xs text-foreground">MTN MoMo</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">Invite sur l&apos;écran</span>
                  </button>

                  {/* CARTE BANCAIRE AVEC LOGOS OFFICIELS */}
                  <button
                    type="button"
                    onClick={() => setMoyenPaiement("carte")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      moyenPaiement === "carte"
                        ? "border-blue-600 bg-blue-600/10 ring-2 ring-blue-600/30 shadow-xs"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <IconeCarteBancaire className="h-8 w-12 mb-2 rounded-sm shadow-xs" />
                    <span className="font-bold text-xs text-foreground">Carte Bancaire</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">Visa / Mastercard</span>
                  </button>
                </div>
              </div>

              {/* Étape 2 : Numéro pour le débit Mobile Money */}
              {moyenPaiement !== "carte" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>2. Sur quel numéro envoyer la demande de débit ?</span>
                  </label>

                  <ChampTelephone
                    valeur={telephonePaiement}
                    onChange={setTelephonePaiement}
                    placeholder="ex: 699 00 00 00"
                  />
                  <p className="text-xs text-muted-foreground">
                    C&apos;est sur ce numéro {moyenPaiement === "orange_money" ? "Orange Money" : "MTN MoMo"} que vous validerez avec votre code secret.
                  </p>
                </div>
              )}

              {/* Explications claires pas à pas */}
              <div className="rounded-xl border bg-muted/40 p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <Info className="h-4 w-4 text-primary shrink-0" />
                  <span>Comment valider votre règlement :</span>
                </div>

                {moyenPaiement === "orange_money" && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    1. Cliquez sur le bouton ci-dessous.<br />
                    2. Un message Orange s&apos;affiche sur votre téléphone pour taper votre code secret (ou composez <strong>#150#</strong>).<br />
                    3. Dès validation, votre boutique est activée automatiquement !
                  </p>
                )}

                {moyenPaiement === "mtn_momo" && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    1. Cliquez sur le bouton ci-dessous.<br />
                    2. Une notification apparaît sur l&apos;écran de votre téléphone MTN pour confirmer avec votre code PIN.<br />
                    3. Dès confirmation, votre stock reste accessible sans coupure !
                  </p>
                )}

                {moyenPaiement === "carte" && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Vous allez être dirigé vers le formulaire sécurisé pour renseigner les numéros de votre carte Visa ou Mastercard (UBA ou toute banque locale/internationale) avec validation par SMS 3D-Secure.
                  </p>
                )}
              </div>

              {/* MODE TEST OU MODE PRODUCTION */}
              {session.mode === "test" ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Mode Démonstration & Test actif</span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      Aucun argent ne sera débité de votre compte. Cliquez sur le bouton vert ci-dessous pour tester l&apos;activation instantanée de votre abonnement.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 cursor-pointer shadow-md text-sm"
                      disabled={simulationEnCours}
                      onClick={() => validerSimulationTest(true)}
                    >
                      {simulationEnCours ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      <span>
                        Valider le paiement de test ({moyenPaiement === "orange_money" ? "Orange Money" : moyenPaiement === "mtn_momo" ? "MTN MoMo" : "Carte"})
                      </span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                      disabled={simulationEnCours}
                      onClick={() => validerSimulationTest(false)}
                    >
                      Simuler un refus ou échec de test
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    className="w-full font-bold py-6 shadow-lg cursor-pointer text-sm sm:text-base"
                    onClick={() => {
                      window.location.href = session.payment_url;
                    }}
                  >
                    <span>
                      Payer {formatMontant(session.montant, session.devise)} avec{" "}
                      {moyenPaiement === "orange_money"
                        ? "Orange Money"
                        : moyenPaiement === "mtn_momo"
                          ? "MTN MoMo"
                          : "ma Carte"}
                    </span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Paiement chiffré SSL • Votre reçu est disponible dès validation
                  </p>
                </div>
              )}
            </DialogCorps>
          )}

          {/* Pied fixe de la modale */}
          <DialogFooter className="px-6 py-3 border-t bg-muted/30 flex items-center justify-between sm:justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Paiement certifié CinetPay</span>
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs cursor-pointer font-medium"
              onClick={() => setModalOuvert(false)}
              disabled={simulationEnCours}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
