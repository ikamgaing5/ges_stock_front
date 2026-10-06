"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Crown,
  ExternalLink,
  Eye,
  FileText,
  Info,
  Loader2,
  Lock,
  Plus,
  Receipt,
  ShieldCheck,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/components/auth-provider";
import { couleursAbonnements } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChampTelephone } from "@/components/champ-telephone";
import {
  Dialog,
  DialogContent,
  DialogCorps,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconeCarteBancaires,
  IconeMastercard,
  IconeMtnMomo,
  IconeOrangeMoney,
  IconeVisa,
} from "@/components/icones-paiement";
import {
  validerLuhn,
  detecterMarqueCarte,
  validerNumeroCarte,
  validerNomTitulaire,
  validerDateExpiration,
  validerCvv,
  validerTelephoneMobileMoney,
} from "@/lib/validation-carte";
import { ModalFactureAbonnement } from "./modal-facture-abonnement";
import { ModalPreuveOperateur } from "./modal-preuve-operateur";
import type {
  FacturationStatutEtPreferences,
  FactureAbonnementItem,
  InfoStatutAbonnement,
  ModePaiementItem,
  PreferencesModePaiement,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MenuPaiement() {
  const { utilisateur, rafraichir } = useAuth();
  const { t, formatMontant, formatDateCourte, libelleAbonnement } = useI18n();

  // Données de facturation
  const [chargement, setChargement] = useState(true);
  const [statutAbonnement, setStatutAbonnement] =
    useState<InfoStatutAbonnement | null>(null);
  const [preferences, setPreferences] =
    useState<PreferencesModePaiement | null>(null);
  const [modesPaiement, setModesPaiement] = useState<ModePaiementItem[]>([]);
  const [factures, setFactures] = useState<FactureAbonnementItem[]>([]);

  // Modales principales
  const [modalAbonnementOuverte, setModalAbonnementOuverte] = useState(false);
  const [modalModePaiementOuverte, setModalModePaiementOuverte] =
    useState(false);
  const [modalHistoriqueOuverte, setModalHistoriqueOuverte] = useState(false);

  // Formulaire d'ajout d'un mode de paiement
  const [formulaireAjoutVisible, setFormulaireAjoutVisible] = useState(false);
  const [nouveauType, setNouveauType] = useState<"mobile_money" | "carte">("carte");
  const [nouveauNumeroCarte, setNouveauNumeroCarte] = useState("");
  const [nouveauTitulaire, setNouveauTitulaire] = useState("");
  const [nouvelleExpiration, setNouvelleExpiration] = useState("");
  const [nouveauCvv, setNouveauCvv] = useState("");
  const [nouvelleMarque, setNouvelleMarque] = useState<"visa" | "mastercard">("visa");
  const [nouvelOperateur, setNouvelOperateur] = useState<"orange_money" | "mtn_momo">("orange_money");
  const [nouveauTelephone, setNouveauTelephone] = useState("");
  const [nouveauParDefaut, setNouveauParDefaut] = useState(false);

  // Suivi des interactions et validations dynamiques
  const [champsTouches, setChampsTouches] = useState({
    carteNumero: false,
    carteTitulaire: false,
    carteExpiration: false,
    carteCvv: false,
    telephone: false,
  });

  const [carteVerificationServeur, setCarteVerificationServeur] = useState<{
    enCours: boolean;
    valide: boolean | null;
    erreur?: string;
    marque?: "visa" | "mastercard" | "autre" | null;
  }>({
    enCours: false,
    valide: null,
  });

  function marquerTouche(champ: keyof typeof champsTouches) {
    setChampsTouches((prev) => (prev[champ] ? prev : { ...prev, [champ]: true }));
  }

  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);
  const [actionIdEnCours, setActionIdEnCours] = useState<number | null>(null);

  // Modales de consultation des factures et preuves
  const [referenceFactureSelectionnee, setReferenceFactureSelectionnee] =
    useState<string | null>(null);
  const [modalFactureDetailOuverte, setModalFactureDetailOuverte] =
    useState(false);

  const [facturePreuveSelectionnee, setFacturePreuveSelectionnee] =
    useState<FactureAbonnementItem | null>(null);
  const [modalPreuveDetailOuverte, setModalPreuveDetailOuverte] =
    useState(false);

  // Validations dynamiques des champs en temps réel
  const validationNumero = validerNumeroCarte(nouveauNumeroCarte);
  const validationTitulaire = validerNomTitulaire(nouveauTitulaire);
  const validationExpiration = validerDateExpiration(nouvelleExpiration);
  const validationCvv = validerCvv(nouveauCvv);
  const validationTelephone = validerTelephoneMobileMoney(
    nouveauTelephone,
    nouvelOperateur,
  );

  // Formatage intelligent numéro carte & vérification dynamique (Luhn + limite de 3 comptes)
  function gererChangementNumeroCarte(val: string) {
    const chiffres = val.replace(/\D/g, "").slice(0, 16);
    const formate = chiffres.replace(/(\d{4})(?=\d)/g, "$1 ");
    setNouveauNumeroCarte(formate);
    marquerTouche("carteNumero");

    const marqueDetectee = detecterMarqueCarte(chiffres);
    if (marqueDetectee === "visa" || marqueDetectee === "mastercard") {
      setNouvelleMarque(marqueDetectee);
    }

    if (chiffres.length < 16) {
      setCarteVerificationServeur({ enCours: false, valide: null });
      return;
    }

    // Dès que 16 chiffres sont atteints : test Luhn instantané côté client
    if (!validerLuhn(chiffres)) {
      setCarteVerificationServeur({
        enCours: false,
        valide: false,
        erreur:
          "Numéro de carte bancaire invalide (clé de contrôle de sécurité erronée).",
      });
      return;
    }

    // Vérification dynamique instantanée côté serveur (règle max 3 fois et unicité)
    setCarteVerificationServeur({ enCours: true, valide: null });
    api
      .post<{
        valide: boolean;
        erreur?: string;
        marque?: "visa" | "mastercard" | "autre";
      }>("/facturation/verifier-carte", {
        numero_carte: chiffres,
      })
      .then((res) => {
        if (res.valide) {
          setCarteVerificationServeur({
            enCours: false,
            valide: true,
            marque: res.marque,
          });
          if (res.marque === "visa" || res.marque === "mastercard") {
            setNouvelleMarque(res.marque);
          }
        } else {
          setCarteVerificationServeur({
            enCours: false,
            valide: false,
            erreur:
              res.erreur ||
              "Impossible d'utiliser ce mode de paiement, veuillez en choisir un autre",
          });
        }
      })
      .catch((err) => {
        setCarteVerificationServeur({
          enCours: false,
          valide: false,
          erreur:
            err instanceof ErreurApi
              ? err.resume()
              : "Erreur lors de la vérification de la carte",
        });
      });
  }

  // Formatage expiration MM/AA avec insertion automatique du slash
  function gererChangementExpiration(val: string) {
    const chiffres = val.replace(/\D/g, "").slice(0, 4);
    marquerTouche("carteExpiration");
    if (chiffres.length >= 3) {
      setNouvelleExpiration(`${chiffres.slice(0, 2)}/${chiffres.slice(2)}`);
    } else {
      setNouvelleExpiration(chiffres);
    }
  }

  // Chargement des données
  function chargerDonnees() {
    setChargement(true);
    Promise.all([
      api.get<FacturationStatutEtPreferences>(
        "/facturation/statut-et-preferences",
      ),
      api.get<FactureAbonnementItem[]>("/facturation/factures"),
    ])
      .then(([dataPrefs, dataFactures]) => {
        setStatutAbonnement(dataPrefs.abonnement);
        setPreferences(dataPrefs.mode_paiement);
        setModesPaiement(dataPrefs.modes_paiement || []);
        setFactures(dataFactures);

        if ((dataPrefs.modes_paiement || []).length === 0) {
          setFormulaireAjoutVisible(true);
        }
      })
      .catch((err) => {
        console.error("Erreur chargement paiements :", err);
      })
      .finally(() => {
        setChargement(false);
      });
  }

  useEffect(() => {
    chargerDonnees();
  }, [utilisateur]);

  // Ajouter un nouveau mode de paiement avec contrôles dynamiques complets
  async function ajouterModePaiement(e: React.FormEvent) {
    e.preventDefault();

    // Marquer l'ensemble des champs du formulaire comme touchés
    setChampsTouches({
      carteNumero: true,
      carteTitulaire: true,
      carteExpiration: true,
      carteCvv: true,
      telephone: true,
    });

    if (nouveauType === "carte") {
      const chiffres = nouveauNumeroCarte.replace(/\D/g, "");
      if (chiffres.length !== 16) {
        toast.error("Veuillez renseigner un numéro de carte valide à 16 chiffres.");
        return;
      }

      // Vérification algorithme de Luhn
      if (!validerLuhn(chiffres)) {
        toast.error("Le numéro de carte bancaire est invalide (clé de contrôle de sécurité erronée).");
        return;
      }

      // Blocage si la carte a déjà été refusée (ex: plus de 3 fois dans le système)
      if (carteVerificationServeur.valide === false && carteVerificationServeur.erreur) {
        toast.error(carteVerificationServeur.erreur);
        return;
      }

      if (!validationTitulaire.valide) {
        toast.error(validationTitulaire.erreur || "Veuillez renseigner un nom de titulaire valide.");
        return;
      }

      if (!validationExpiration.valide) {
        toast.error(validationExpiration.erreur || "La date d'expiration de la carte est invalide ou dépassée.");
        return;
      }

      if (!validationCvv.valide) {
        toast.error(validationCvv.erreur || "Le code CVC / cryptogramme visuel doit comporter 3 chiffres.");
        return;
      }
    } else {
      if (!validationTelephone.valide) {
        toast.error(validationTelephone.erreur || "Veuillez renseigner un numéro Mobile Money valide.");
        return;
      }
    }

    setSauvegardeEnCours(true);

    try {
      if (nouveauType === "carte") {
        const chiffres = nouveauNumeroCarte.replace(/\D/g, "");
        const res = await api.post<{
          message: string;
          mode_paiement: ModePaiementItem;
          modes_paiement: ModePaiementItem[];
        }>("/facturation/modes-paiement", {
          type: "carte",
          numero_carte: chiffres,
          carte_titulaire: nouveauTitulaire.trim(),
          carte_expiration: nouvelleExpiration.trim(),
          carte_cvv: nouveauCvv.trim(),
          carte_marque: nouvelleMarque,
          est_defaut: nouveauParDefaut || modesPaiement.length === 0,
        });

        toast.success(res.message || "Carte bancaire enregistrée avec succès !");
        setModesPaiement(res.modes_paiement);
        reinitialiserFormulaire();
        setFormulaireAjoutVisible(false);
        await rafraichir();
      } else {
        const res = await api.post<{
          message: string;
          mode_paiement: ModePaiementItem;
          modes_paiement: ModePaiementItem[];
        }>("/facturation/modes-paiement", {
          type: "mobile_money",
          operateur: nouvelOperateur,
          telephone: nouveauTelephone.trim(),
          est_defaut: nouveauParDefaut || modesPaiement.length === 0,
        });

        toast.success(res.message || "Compte Mobile Money enregistré avec succès !");
        setModesPaiement(res.modes_paiement);
        reinitialiserFormulaire();
        setFormulaireAjoutVisible(false);
        await rafraichir();
      }
    } catch (err) {
      if (err instanceof ErreurApi) {
        const errDetail =
          err.erreurs?.numero_carte?.[0] ||
          err.erreurs?.telephone?.[0] ||
          err.message;

        if (
          errDetail &&
          errDetail.toLowerCase().includes("impossible d'utiliser ce mode de paiement")
        ) {
          const messageRefus =
            "Impossible d'utiliser ce mode de paiement, veuillez en choisir un autre";
          setCarteVerificationServeur({
            enCours: false,
            valide: false,
            erreur: messageRefus,
          });
          toast.error(messageRefus);
          return;
        }
      }

      toast.error(
        err instanceof ErreurApi ? err.resume() : "Erreur lors de l'enregistrement.",
      );
    } finally {
      setSauvegardeEnCours(false);
    }
  }

  // Définir un mode comme par défaut
  async function definirParDefaut(id: number) {
    setActionIdEnCours(id);
    try {
      const res = await api.put<{
        message: string;
        mode_paiement: ModePaiementItem;
        modes_paiement: ModePaiementItem[];
      }>(`/facturation/modes-paiement/${id}/defaut`, {});

      toast.success(res.message || "Moyen de paiement défini par défaut.");
      setModesPaiement(res.modes_paiement);
      await rafraichir();
    } catch (err) {
      toast.error(
        err instanceof ErreurApi ? err.resume() : "Erreur lors de la mise à jour.",
      );
    } finally {
      setActionIdEnCours(null);
    }
  }

  // Supprimer un mode de paiement
  async function supprimerMode(id: number) {
    setActionIdEnCours(id);
    try {
      const res = await api.delete<{
        message: string;
        modes_paiement: ModePaiementItem[];
      }>(`/facturation/modes-paiement/${id}`);

      toast.success(res.message || "Moyen de paiement supprimé.");
      setModesPaiement(res.modes_paiement);
      if (res.modes_paiement.length === 0) {
        setFormulaireAjoutVisible(true);
      }
      await rafraichir();
    } catch (err) {
      toast.error(
        err instanceof ErreurApi ? err.resume() : "Erreur lors de la suppression.",
      );
    } finally {
      setActionIdEnCours(null);
    }
  }

  function reinitialiserFormulaire() {
    setNouveauNumeroCarte("");
    setNouveauTitulaire("");
    setNouvelleExpiration("");
    setNouveauCvv("");
    setNouvelleMarque("visa");
    setNouveauTelephone("");
    setNouveauParDefaut(false);
    setChampsTouches({
      carteNumero: false,
      carteTitulaire: false,
      carteExpiration: false,
      carteCvv: false,
      telephone: false,
    });
    setCarteVerificationServeur({
      enCours: false,
      valide: null,
    });
  }

  function ouvrirFacture(ref: string) {
    setReferenceFactureSelectionnee(ref);
    setModalFactureDetailOuverte(true);
  }

  function ouvrirPreuve(item: FactureAbonnementItem) {
    setFacturePreuveSelectionnee(item);
    setModalPreuveDetailOuverte(true);
  }

  const modeDefaut =
    modesPaiement.find((m) => m.est_defaut) || modesPaiement[0] || null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t("monCompte.paiements")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rubrique 1 : Mon abonnement & forfaits */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setModalAbonnementOuverte(true)}
              className="group w-full flex items-center justify-between p-2 sm:p-2.5 -mx-2 rounded-lg text-left hover:bg-muted/40 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center">
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-foreground block truncate">
                    Mon abonnement & forfaits
                  </span>
                  <span className="text-xs text-muted-foreground block truncate">
                    {statutAbonnement
                      ? `Plan ${statutAbonnement.plan.toUpperCase()} - ${libelleAbonnement(
                          statutAbonnement.statut || "essai",
                        )}`
                      : "Chargement du statut..."}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
            </button>
          </div>

          {/* Rubrique 2 : Modes de paiement et facturation */}
          <div className="flex items-center justify-between gap-4 border-t pt-4">
            <button
              type="button"
              onClick={() => setModalModePaiementOuverte(true)}
              className="group w-full flex items-center justify-between p-2 sm:p-2.5 -mx-2 rounded-lg text-left hover:bg-muted/40 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center">
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-foreground block truncate">
                    Modes de paiement et facturation
                  </span>
                  <span className="text-xs text-muted-foreground block truncate">
                    {modeDefaut?.type === "mobile_money" &&
                      modeDefaut.operateur === "orange_money" && (
                        <span className="inline-flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                          <IconeOrangeMoney className="h-3.5 w-3.5" /> Orange
                          Money ({modeDefaut.telephone})
                          {modesPaiement.length > 1 && (
                            <span className="text-muted-foreground text-[11px] ml-1">
                              +{modesPaiement.length - 1} autre
                              {modesPaiement.length > 2 ? "s" : ""}
                            </span>
                          )}
                        </span>
                      )}
                    {modeDefaut?.type === "mobile_money" &&
                      modeDefaut.operateur === "mtn_momo" && (
                        <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                          <IconeMtnMomo className="h-3.5 w-3.5" /> MTN MoMo (
                          {modeDefaut.telephone})
                          {modesPaiement.length > 1 && (
                            <span className="text-muted-foreground text-[11px] ml-1">
                              +{modesPaiement.length - 1} autre
                              {modesPaiement.length > 2 ? "s" : ""}
                            </span>
                          )}
                        </span>
                      )}
                    {modeDefaut?.type === "carte" && (
                      <span className="inline-flex items-center gap-1.5 text-foreground">
                        {modeDefaut.carte_marque === "mastercard" ? (
                          <IconeMastercard className="h-3.5 w-5.5 rounded-2xs inline-block" />
                        ) : (
                          <IconeVisa className="h-3.5 w-5.5 rounded-2xs inline-block" />
                        )}
                        Carte{" "}
                        {modeDefaut.carte_marque === "mastercard"
                          ? "Mastercard"
                          : "Visa"}{" "}
                        (••••{" "}
                        {modeDefaut.carte_derniers_chiffres || "Enregistrée"})
                        {modesPaiement.length > 1 && (
                          <span className="text-muted-foreground text-[11px] ml-1">
                            +{modesPaiement.length - 1} autre
                            {modesPaiement.length > 2 ? "s" : ""}
                          </span>
                        )}
                      </span>
                    )}
                    {!modeDefaut && "Configurer vos cartes ou Mobile Money"}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
            </button>
          </div>

          {/* Rubrique 3 : Historique des paiements */}
          <div className="flex items-center justify-between gap-4 border-t pt-4">
            <button
              type="button"
              onClick={() => setModalHistoriqueOuverte(true)}
              className="group w-full flex items-center justify-between p-2 sm:p-2.5 -mx-2 rounded-lg text-left hover:bg-muted/40 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center">
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-foreground block truncate">
                    Historique des paiements
                  </span>
                  <span className="text-xs text-muted-foreground block truncate">
                    {factures.length > 0
                      ? `${factures.length} facture${
                          factures.length > 1 ? "s" : ""
                        } d'abonnement disponible${factures.length > 1 ? "s" : ""}`
                      : "Consultez et téléchargez vos factures acquittées"}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* MODALE 1 : Mon abonnement & Forfaits (Élargie max-w-2xl)                  */}
      {/* ========================================================================= */}
      <Dialog
        open={modalAbonnementOuverte}
        onOpenChange={setModalAbonnementOuverte}
      >
        <DialogContent className="max-w-2xl p-0 border border-border shadow-2xl">
          <DialogHeader className="px-6 py-5 border-b bg-muted/30 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Mon abonnement & Forfaits
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Détails de votre formule actuelle et échéance de service
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setModalAbonnementOuverte(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <DialogCorps className="p-6 space-y-6">
            {statutAbonnement && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-1.5">
                    <span className="text-xs text-muted-foreground font-medium">
                      Formule souscrite
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground capitalize">
                        Plan {statutAbonnement.plan}
                      </span>
                      <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                        {statutAbonnement.est_premium
                          ? "Accès Complet"
                          : "Standard"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-4 space-y-1.5">
                    <span className="text-xs text-muted-foreground font-medium">
                      État du compte
                    </span>
                    <div>
                      <span
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          couleursAbonnements[
                            statutAbonnement.statut || "essai"
                          ],
                        ].join(" ")}
                      >
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {libelleAbonnement(statutAbonnement.statut || "essai")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/80 bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Date d&apos;échéance
                    </span>
                    <span className="font-semibold text-foreground">
                      {statutAbonnement.echeance
                        ? formatDateCourte(statutAbonnement.echeance)
                        : "Non définie"}
                    </span>
                  </div>

                  {statutAbonnement.jours_restants > 0 && (
                    <div className="flex items-center justify-between text-sm border-t pt-3">
                      <span className="text-muted-foreground">
                        Période restante
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {statutAbonnement.jours_restants} jour
                        {statutAbonnement.jours_restants > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full gap-2 font-semibold py-6 text-sm shadow-md"
                  nativeButton={false}
                  render={<Link href="/mon-compte/abonnement" />}
                  onClick={() => setModalAbonnementOuverte(false)}
                >
                  <span>Changer de formule ou prolonger</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogCorps>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODALE 2 : Modes de paiement et facturation (Élargie max-w-3xl)           */}
      {/* ========================================================================= */}
      <Dialog
        open={modalModePaiementOuverte}
        onOpenChange={setModalModePaiementOuverte}
      >
        <DialogContent className="sm:max-w-2xl w-[45vw]  p-0 border border-border shadow-2xl">
          <DialogHeader className="px-6 py-5 border-b bg-muted/30 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div> */}
              <div>
                <DialogTitle className="text-lg font-bold">
                  Modes de paiement et facturation
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Gérez vos cartes bancaires et comptes Mobile Money pour vos
                  règlements
                </p>
              </div>
            </div>
            {/* <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setModalModePaiementOuverte(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </DialogHeader>

          <DialogCorps className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Section 1 : Moyens de paiement enregistrés */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Vos moyens enregistrés ({modesPaiement.length})
                </h4>
                {!formulaireAjoutVisible && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFormulaireAjoutVisible(true)}
                    className="gap-1.5 text-xs h-8 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Ajouter un moyen</span>
                  </Button>
                )}
              </div>

              {modesPaiement.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center space-y-2 bg-muted/10">
                  <CreditCard className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm font-semibold text-foreground">
                    Aucun moyen de paiement enregistré
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Ajoutez une carte bancaire ou un compte Mobile Money pour
                    faciliter vos prochains règlements.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {modesPaiement.map((mode) => {
                    const estCarte = mode.type === "carte";
                    const estOrange = mode.operateur === "orange_money";
                    const estMtn = mode.operateur === "mtn_momo";
                    const enCours = actionIdEnCours === mode.id;

                    return (
                      <div
                        key={mode.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-3 ${
                          mode.est_defaut
                            ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20"
                            : "border-border bg-card hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-background border shadow-xs p-1">
                            {estCarte ? (
                              mode.carte_marque === "mastercard" ? (
                                <IconeMastercard className="h-6 w-9 rounded" />
                              ) : (
                                <IconeVisa className="h-6 w-9 rounded" />
                              )
                            ) : estOrange ? (
                              <IconeOrangeMoney className="h-6 w-6" />
                            ) : (
                              <IconeMtnMomo className="h-6 w-6" />
                            )}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-foreground">
                                {estCarte
                                  ? `Carte ${mode.carte_marque === "mastercard" ? "Mastercard" : "Visa"} •••• ${mode.carte_derniers_chiffres}`
                                  : estOrange
                                    ? `Orange Money (${mode.telephone})`
                                    : `MTN MoMo (${mode.telephone})`}
                              </span>
                              {mode.est_defaut && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold border border-primary/20">
                                  <Check className="h-3 w-3" />
                                  Par défaut
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground truncate">
                              {estCarte
                                ? `Expire le ${mode.carte_expiration} · Titulaire: ${mode.carte_titulaire}`
                                : "Validation directe USSD / Push automatique"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {!mode.est_defaut && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={enCours}
                              onClick={() => definirParDefaut(mode.id)}
                              className="text-xs h-8 gap-1.5 cursor-pointer hover:bg-primary/5 hover:text-primary"
                            >
                              {enCours ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              <span>Définir par défaut</span>
                            </Button>
                          )}

                          <Button
                            size="icon-sm"
                            variant="ghost"
                            disabled={enCours}
                            onClick={() => supprimerMode(mode.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Supprimer ce moyen"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2 : Formulaire d'ajout sécurisé */}
            {formulaireAjoutVisible && (
              <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    {/* <ShieldCheck className="h-4 w-4 text-primary" /> */}
                    <span className="text-sm font-bold text-foreground">
                      Ajouter un nouveau moyen de paiement
                    </span>
                  </div>
                  {modesPaiement.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setFormulaireAjoutVisible(false)}
                      className="h-7 w-7 rounded-full"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <form onSubmit={ajouterModePaiement} className="space-y-4">
                  {/* Onglets Choix du type */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNouveauType("carte")}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        nouveauType === "carte"
                          ? "border-primary bg-card ring-2 ring-primary/20 shadow-xs"
                          : "border-border bg-card/60 hover:bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-1 shrink-0">
                        <IconeVisa className="h-4.5 w-7 rounded shadow-2xs" />
                        <IconeMastercard className="h-4.5 w-7 rounded shadow-2xs" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Carte Bancaire
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Visa, Mastercard
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNouveauType("mobile_money")}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        nouveauType === "mobile_money"
                          ? "border-primary bg-card ring-2 ring-primary/20 shadow-xs"
                          : "border-border bg-card/60 hover:bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-1 shrink-0">
                        <IconeOrangeMoney className="h-5 w-5" />
                        <IconeMtnMomo className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Mobile Money
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Orange & MTN
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Formulaire Carte Bancaire */}
                  {nouveauType === "carte" && (
                    <div className="space-y-4 pt-1">
                      {/* Notice de sécurité & hachage */}
                      <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 border border-primary/15 p-3 text-xs text-muted-foreground">
                        <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">
                          <strong className="text-foreground">
                            Sécurité bancaire & non-accès :
                          </strong>{" "}
                          Vos coordonnées complètes sont vérifiées puis{" "}
                          <strong>hachées de façon irréversible</strong>. Seuls
                          les 4 derniers chiffres sont conservés pour votre
                          identification. Le code de sécurité (CVC) n&apos;est
                          jamais enregistré en base de données.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-foreground">
                            Nom sur la carte
                          </Label>
                          {champsTouches.carteTitulaire && validationTitulaire.valide && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Titulaire valide
                            </span>
                          )}
                        </div>
                        <Input
                          required
                          value={nouveauTitulaire}
                          onBlur={() => marquerTouche("carteTitulaire")}
                          onChange={(e) => {
                            setNouveauTitulaire(e.target.value.toUpperCase());
                            marquerTouche("carteTitulaire");
                          }}
                          placeholder="EX: TCHANA MARC"
                          className={`text-xs h-9 uppercase ${
                            champsTouches.carteTitulaire && !validationTitulaire.valide
                              ? "border-destructive focus-visible:ring-destructive bg-destructive/5"
                              : champsTouches.carteTitulaire && validationTitulaire.valide
                              ? "border-emerald-500/80 focus-visible:ring-emerald-500"
                              : ""
                          }`}
                        />
                        {champsTouches.carteTitulaire && !validationTitulaire.valide && (
                          <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {validationTitulaire.erreur}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-foreground">
                            Numéro complet de la carte (16 chiffres)
                          </Label>
                          {carteVerificationServeur.valide === true && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Carte valide & acceptée
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <Input
                            required
                            maxLength={19}
                            value={nouveauNumeroCarte}
                            onBlur={() => marquerTouche("carteNumero")}
                            onChange={(e) =>
                              gererChangementNumeroCarte(e.target.value)
                            }
                            placeholder="0000 0000 0000 0000"
                            className={`text-xs font-mono h-9 pr-24 tracking-wider transition-colors ${
                              (champsTouches.carteNumero &&
                                !validationNumero.valide &&
                                validationNumero.complet) ||
                              carteVerificationServeur.valide === false
                                ? "border-destructive focus-visible:ring-destructive bg-destructive/5"
                                : carteVerificationServeur.valide === true
                                ? "border-emerald-500 focus-visible:ring-emerald-500 bg-emerald-500/5"
                                : ""
                            }`}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                            {carteVerificationServeur.enCours && (
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            )}
                            {!carteVerificationServeur.enCours &&
                              carteVerificationServeur.valide === true && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              )}
                            {nouveauNumeroCarte.trim().length > 0 ? (
                              nouvelleMarque === "mastercard" ? (
                                <IconeMastercard className="h-5 w-8 rounded shadow-2xs" />
                              ) : (
                                <IconeVisa className="h-5 w-8 rounded shadow-2xs" />
                              )
                            ) : (
                              <div className="flex items-center gap-1 opacity-75">
                                <IconeVisa className="h-4.5 w-6.5 rounded shadow-2xs" />
                                <IconeMastercard className="h-4.5 w-6.5 rounded shadow-2xs" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Indicateur de vérification en arrière-plan */}
                        {carteVerificationServeur.enCours && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            Vérification de la validité de la carte en cours...
                          </p>
                        )}

                        {/* Erreur spécifique (carte présente plus de 3 fois ou invalide) */}
                        {carteVerificationServeur.valide === false &&
                          carteVerificationServeur.erreur && (
                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200 mt-1.5">
                              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                              <span>{carteVerificationServeur.erreur}</span>
                            </div>
                          )}

                        {/* Erreur standard locale lors de la frappe */}
                        {!carteVerificationServeur.enCours &&
                          carteVerificationServeur.valide === null &&
                          champsTouches.carteNumero &&
                          !validationNumero.valide && (
                            <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-1">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              {validationNumero.erreur}
                            </p>
                          )}

                        {/* Succès confirmé */}
                        {carteVerificationServeur.valide === true && (
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium mt-1">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            Numéro de carte vérifié et conforme.
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-foreground">
                              Date d&apos;expiration
                            </Label>
                            {champsTouches.carteExpiration &&
                              validationExpiration.valide && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Valide
                                </span>
                              )}
                          </div>
                          <Input
                            required
                            maxLength={5}
                            value={nouvelleExpiration}
                            onBlur={() => marquerTouche("carteExpiration")}
                            onChange={(e) =>
                              gererChangementExpiration(e.target.value)
                            }
                            placeholder="MM/AA"
                            className={`text-xs font-mono h-9 ${
                              champsTouches.carteExpiration &&
                              !validationExpiration.valide
                                ? "border-destructive focus-visible:ring-destructive bg-destructive/5"
                                : champsTouches.carteExpiration &&
                                  validationExpiration.valide
                                ? "border-emerald-500/80 focus-visible:ring-emerald-500"
                                : ""
                            }`}
                          />
                          {champsTouches.carteExpiration &&
                            !validationExpiration.valide && (
                              <p className="text-[10px] text-destructive font-medium mt-0.5 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 shrink-0" />
                                {validationExpiration.erreur}
                              </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                              <span>Code de sécurité</span>
                            </Label>
                            {champsTouches.carteCvv && validationCvv.valide && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> CVC ok
                              </span>
                            )}
                          </div>
                          <Input
                            required
                            type="password"
                            maxLength={4}
                            value={nouveauCvv}
                            onBlur={() => marquerTouche("carteCvv")}
                            onChange={(e) => {
                              setNouveauCvv(
                                e.target.value.replace(/\D/g, "").slice(0, 4),
                              );
                              marquerTouche("carteCvv");
                            }}
                            placeholder="•••"
                            className={`text-xs font-mono h-9 text-center tracking-widest ${
                              champsTouches.carteCvv && !validationCvv.valide
                                ? "border-destructive focus-visible:ring-destructive bg-destructive/5"
                                : champsTouches.carteCvv && validationCvv.valide
                                ? "border-emerald-500/80 focus-visible:ring-emerald-500"
                                : ""
                            }`}
                          />
                          {champsTouches.carteCvv && !validationCvv.valide && (
                            <p className="text-[10px] text-destructive font-medium mt-0.5 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              {validationCvv.erreur}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Formulaire Mobile Money */}
                  {nouveauType === "mobile_money" && (
                    <div className="space-y-4 pt-1">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">
                          Opérateur Mobile Money
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <label
                            className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                              nouvelOperateur === "orange_money"
                                ? "border-orange-500 bg-orange-500/10 text-orange-950 dark:text-orange-200 font-bold"
                                : "border-border bg-card hover:bg-muted/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name="nouvel_op"
                              value="orange_money"
                              checked={nouvelOperateur === "orange_money"}
                              onChange={() =>
                                setNouvelOperateur("orange_money")
                              }
                              className="sr-only"
                            />
                            <IconeOrangeMoney className="h-5 w-5" />
                            <span className="text-xs">Orange Money</span>
                          </label>

                          <label
                            className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                              nouvelOperateur === "mtn_momo"
                                ? "border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200 font-bold"
                                : "border-border bg-card hover:bg-muted/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name="nouvel_op"
                              value="mtn_momo"
                              checked={nouvelOperateur === "mtn_momo"}
                              onChange={() => setNouvelOperateur("mtn_momo")}
                              className="sr-only"
                            />
                            <IconeMtnMomo className="h-5 w-5" />
                            <span className="text-xs">MTN MoMo</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="nouveau-tel"
                            className="text-xs font-semibold text-foreground"
                          >
                            Numéro de téléphone de débit
                          </Label>
                          {champsTouches.telephone &&
                            validationTelephone.valide &&
                            !validationTelephone.avertissement && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Numéro valide
                              </span>
                            )}
                        </div>
                        <ChampTelephone
                          id="nouveau-tel"
                          valeur={nouveauTelephone}
                          erreur={champsTouches.telephone && !validationTelephone.valide}
                          onChange={(val) => {
                            setNouveauTelephone(val);
                            marquerTouche("telephone");
                          }}
                          codePaysParDefaut={utilisateur?.pays || "CM"}
                          placeholder="6 00 00 00 00"
                        />
                        {champsTouches.telephone && !validationTelephone.valide && (
                          <p className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-1">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {validationTelephone.erreur}
                          </p>
                        )}
                        {validationTelephone.avertissement && (
                          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-medium mt-1">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{validationTelephone.avertissement}</span>
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          Ce numéro recevra l&apos;invite USSD ou Push lors des
                          renouvellements d&apos;abonnement.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Option Par défaut */}
                  {modesPaiement.length > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={nouveauParDefaut}
                        onChange={(e) => setNouveauParDefaut(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-xs text-foreground font-medium">
                        Définir directement comme moyen de paiement par défaut
                      </span>
                    </label>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t">
                    {modesPaiement.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          reinitialiserFormulaire();
                          setFormulaireAjoutVisible(false);
                        }}
                        className="text-xs h-9 cursor-pointer"
                      >
                        Annuler
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={
                        sauvegardeEnCours ||
                        carteVerificationServeur.enCours ||
                        (nouveauType === "carte" &&
                          carteVerificationServeur.valide === false)
                      }
                      size="sm"
                      className="gap-2 font-semibold text-xs h-9 cursor-pointer"
                    >
                      {sauvegardeEnCours || carteVerificationServeur.enCours ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      <span>Enregistrer ce moyen</span>
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </DialogCorps>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalModePaiementOuverte(false)}
              className="text-xs ml-auto cursor-pointer"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODALE 3 : Historique des paiements (Élargie max-w-5xl)                   */}
      {/* ========================================================================= */}
      <Dialog
        open={modalHistoriqueOuverte}
        onOpenChange={setModalHistoriqueOuverte}
      >
        <DialogContent className="max-w-5xl p-0 border border-border shadow-2xl">
          <DialogHeader className="px-6 py-5 border-b bg-muted/30 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  Historique des paiements & Factures
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Consultez, imprimez et téléchargez l&apos;ensemble de vos
                  factures acquittées et reçus opérateurs
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setModalHistoriqueOuverte(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <DialogCorps className="p-0 max-h-[70vh] overflow-y-auto">
            {factures.length === 0 ? (
              <div className="py-16 px-6 text-center space-y-3">
                <FileText className="h-10 w-10 text-muted-foreground/60 mx-auto" />
                <p className="text-base font-semibold text-foreground">
                  Aucune facture d&apos;abonnement pour le moment
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Vos prochains règlements apparaîtront ici automatiquement dès
                  votre premier renouvellement de formule.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40 text-foreground font-semibold">
                      <th className="py-3.5 px-6">Date d&apos;émission</th>
                      <th className="py-3.5 px-6">Désignation</th>
                      <th className="py-3.5 px-6">Montant total</th>
                      <th className="py-3.5 px-6">Statut</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-muted-foreground">
                    {factures.map((facture) => {
                      const estPaye = facture.statut === "valide";
                      const estOrange =
                        facture.moyen_paiement === "orange_money";
                      const estMtn = facture.moyen_paiement === "mtn_momo";
                      const estCarte = facture.moyen_paiement === "carte";

                      return (
                        <tr
                          key={facture.id}
                          className="hover:bg-muted/15 transition-colors"
                        >
                          {/* 1. Date */}
                          <td className="py-4 px-6">
                            <p className="font-semibold text-foreground text-sm">
                              {formatDateCourte(facture.date)}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              {facture.numero_facture}
                            </p>
                          </td>

                          {/* 2. Désignation */}
                          <td className="py-4 px-6">
                            <span className="font-semibold text-foreground capitalize">
                              Abonnement Plan {facture.plan}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              Durée : {facture.duree_mois} mois
                            </span>
                          </td>

                          {/* 3. Total */}
                          <td className="py-4 px-6 font-mono font-bold text-foreground text-sm">
                            {formatMontant(facture.total, facture.devise)}
                          </td>

                          {/* 4. Statut */}
                          <td className="py-4 px-6">
                            {estPaye ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Payé
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                {facture.statut === "en_attente"
                                  ? "En attente"
                                  : "Échoué"}
                              </span>
                            )}
                          </td>

                          {/* 5. Actions (Voir + Lien selon mode de paiement) */}
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              {/* Voir facture officielle Telora */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => ouvrirFacture(facture.reference)}
                                className="h-8 px-3 text-xs gap-1.5 font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/40 cursor-pointer"
                                title="Consulter la facture officielle imprimable"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Facture officielle</span>
                              </Button>

                              {/* Preuve / Reçu selon mode */}
                              {estCarte ? (
                                facture.recu_url ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      window.open(facture.recu_url!, "_blank")
                                    }
                                    className="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                    title="Ouvrir le reçu bancaire externe"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>Reçu bancaire</span>
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => ouvrirPreuve(facture)}
                                    className="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                    title="Détails du débit carte"
                                  >
                                    <Info className="h-3.5 w-3.5" />
                                    <span>Détail carte</span>
                                  </Button>
                                )
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => ouvrirPreuve(facture)}
                                  className="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                  title="Preuve opérateur réseau"
                                >
                                  {estOrange && (
                                    <IconeOrangeMoney className="h-4 w-4" />
                                  )}
                                  {estMtn && (
                                    <IconeMtnMomo className="h-4 w-4" />
                                  )}
                                  {!estOrange && !estMtn && (
                                    <Info className="h-3.5 w-3.5" />
                                  )}
                                  <span>Preuve opérateur</span>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DialogCorps>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalHistoriqueOuverte(false)}
              className="text-xs ml-auto cursor-pointer"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale Facture Officielle */}
      <ModalFactureAbonnement
        reference={referenceFactureSelectionnee}
        ouvert={modalFactureDetailOuverte}
        onFermer={() => {
          setModalFactureDetailOuverte(false);
          setReferenceFactureSelectionnee(null);
        }}
      />

      {/* Modale Preuve Opérateur */}
      <ModalPreuveOperateur
        facture={facturePreuveSelectionnee}
        ouvert={modalPreuveDetailOuverte}
        onFermer={() => {
          setModalPreuveDetailOuverte(false);
          setFacturePreuveSelectionnee(null);
        }}
      />
    </>
  );
}
