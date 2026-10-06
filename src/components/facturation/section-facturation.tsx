"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Info,
  Loader2,
  Receipt,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/components/auth-provider";
import { couleursAbonnements } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChampTelephone } from "@/components/champ-telephone";
import {
  IconeCarteBancaires,
  IconeMtnMomo,
  IconeOrangeMoney,
} from "@/components/icones-paiement";
import { ModalFactureAbonnement } from "./modal-facture-abonnement";
import { ModalPreuveOperateur } from "./modal-preuve-operateur";
import type {
  FactureAbonnementItem,
  FacturationStatutEtPreferences,
  InfoStatutAbonnement,
  PreferencesModePaiement,
} from "@/types";

export function SectionFacturation() {
  const { utilisateur, rafraichir } = useAuth();
  const { t, formatMontant, formatDateCourte, libelleAbonnement, lang } =
    useI18n();

  // Données chargées
  const [chargement, setChargement] = useState(true);
  const [statutAbonnement, setStatutAbonnement] =
    useState<InfoStatutAbonnement | null>(null);
  const [preferences, setPreferences] =
    useState<PreferencesModePaiement | null>(null);
  const [factures, setFactures] = useState<FactureAbonnementItem[]>([]);

  // Formulaire Mode de Paiement
  const [typeMoyen, setTypeMoyen] = useState<"mobile_money" | "carte">(
    "mobile_money"
  );
  const [operateurMobile, setOperateurMobile] = useState<
    "orange_money" | "mtn_momo"
  >("orange_money");
  const [telephonePaiement, setTelephonePaiement] = useState("");
  const [carteTitulaire, setCarteTitulaire] = useState("");
  const [carteDerniersChiffres, setCarteDerniersChiffres] = useState("");
  const [carteExpiration, setCarteExpiration] = useState("");
  const [carteMarque, setCarteMarque] = useState<"visa" | "mastercard">(
    "visa"
  );
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);

  // Modales
  const [referenceFactureSelectionnee, setReferenceFactureSelectionnee] =
    useState<string | null>(null);
  const [modalFactureOuverte, setModalFactureOuverte] = useState(false);

  const [facturePreuveSelectionnee, setFacturePreuveSelectionnee] =
    useState<FactureAbonnementItem | null>(null);
  const [modalPreuveOuverte, setModalPreuveOuverte] = useState(false);

  // Chargement des données
  useEffect(() => {
    let actif = true;
    setChargement(true);

    Promise.all([
      api.get<FacturationStatutEtPreferences>("/facturation/statut-et-preferences"),
      api.get<FactureAbonnementItem[]>("/facturation/factures"),
    ])
      .then(([dataPrefs, dataFactures]) => {
        if (!actif) return;

        setStatutAbonnement(dataPrefs.abonnement);
        setPreferences(dataPrefs.mode_paiement);
        setFactures(dataFactures);

        // Initialisation des champs du formulaire
        const pref = dataPrefs.mode_paiement;
        if (pref.moyen_prefere === "carte") {
          setTypeMoyen("carte");
          setCarteTitulaire(pref.carte_titulaire || "");
          setCarteDerniersChiffres(pref.carte_derniers_chiffres || "");
          setCarteExpiration(pref.carte_expiration || "");
          setCarteMarque(pref.carte_marque || "visa");
        } else {
          setTypeMoyen("mobile_money");
          if (pref.moyen_prefere === "mtn_momo") {
            setOperateurMobile("mtn_momo");
          } else {
            setOperateurMobile("orange_money");
          }
          setTelephonePaiement(
            pref.telephone_paiement || utilisateur?.telephone || ""
          );
        }
      })
      .catch((err) => {
        console.error("Erreur chargement facturation :", err);
      })
      .finally(() => {
        if (actif) setChargement(false);
      });

    return () => {
      actif = false;
    };
  }, [utilisateur]);

  // Sauvegarde des préférences
  async function enregistrerModePaiement(e: React.FormEvent) {
    e.preventDefault();
    setSauvegardeEnCours(true);

    try {
      const payload: {
        moyen_paiement_prefere: "orange_money" | "mtn_momo" | "carte";
        telephone_paiement?: string;
        carte_titulaire?: string;
        carte_derniers_chiffres?: string;
        carte_expiration?: string;
        carte_marque?: "visa" | "mastercard";
      } = {
        moyen_paiement_prefere:
          typeMoyen === "mobile_money" ? operateurMobile : "carte",
      };

      if (typeMoyen === "mobile_money") {
        if (!telephonePaiement.trim()) {
          toast.error("Veuillez renseigner votre numéro Mobile Money.");
          setSauvegardeEnCours(false);
          return;
        }
        payload.telephone_paiement = telephonePaiement.trim();
      } else {
        payload.carte_titulaire = carteTitulaire.trim();
        payload.carte_derniers_chiffres = carteDerniersChiffres.trim();
        payload.carte_expiration = carteExpiration.trim();
        payload.carte_marque = carteMarque;
      }

      const res = await api.put<{
        message: string;
        mode_paiement: PreferencesModePaiement;
      }>("/facturation/mode-paiement", payload);

      setPreferences(res.mode_paiement);
      toast.success(res.message || "Mode de paiement mis à jour avec succès !");
      await rafraichir();
    } catch (err) {
      toast.error(
        err instanceof ErreurApi ? err.resume() : "Erreur lors de l'enregistrement."
      );
    } finally {
      setSauvegardeEnCours(false);
    }
  }

  function ouvrirFacture(ref: string) {
    setReferenceFactureSelectionnee(ref);
    setModalFactureOuverte(true);
  }

  function ouvrirPreuve(item: FactureAbonnementItem) {
    setFacturePreuveSelectionnee(item);
    setModalPreuveOuverte(true);
  }

  return (
    <div className="space-y-6">
      {/* 1. Carte Forfait & Statut */}
      <Card className="border-border/80 shadow-2xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Mon Forfait & Statut de l&apos;Abonnement</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Détails de votre souscription actuelle à la plateforme Telora.
              </p>
            </div>

            <Button
              size="sm"
              className="gap-2 shrink-0 font-semibold"
              nativeButton={false}
              render={<Link href="/mon-compte/abonnement" />}
            >
              <span>Changer ou renouveler mon forfait</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {chargement ? (
            <div className="py-6 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : statutAbonnement ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border bg-muted/20 p-4 space-y-1.5">
                <span className="text-xs text-muted-foreground">Formule active</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground capitalize">
                    Plan {statutAbonnement.plan}
                  </span>
                  {statutAbonnement.plan === "premium" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                      Multi-boutiques
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border bg-muted/20 p-4 space-y-1.5">
                <span className="text-xs text-muted-foreground">État du compte</span>
                <div>
                  <span
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      couleursAbonnements[statutAbonnement.statut || "essai"],
                    ].join(" ")}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {libelleAbonnement(statutAbonnement.statut || "essai")}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/20 p-4 space-y-1.5">
                <span className="text-xs text-muted-foreground">Prochaine échéance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-foreground">
                    {statutAbonnement.echeance
                      ? formatDateCourte(statutAbonnement.echeance)
                      : "Non définie"}
                  </span>
                  {statutAbonnement.jours_restants > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({statutAbonnement.jours_restants} jours)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* 2. Carte Mode de Paiement Préféré */}
      <Card className="border-border/80 shadow-2xs">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Mode de Paiement Préféré</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enregistrez votre moyen habituel pour renouveler vos abonnements en 1 clic.
              </p>
            </div>

            {preferences?.moyen_prefere && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mode enregistré actif</span>
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={enregistrerModePaiement} className="space-y-5">
            {/* Sélecteur de méthode (Tabs visuels) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTypeMoyen("mobile_money")}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  typeMoyen === "mobile_money"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border/80 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <IconeOrangeMoney className="h-7 w-7" />
                  <IconeMtnMomo className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Mobile Money</p>
                  <p className="text-xs text-muted-foreground">
                    Orange Money & MTN MoMo
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTypeMoyen("carte")}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  typeMoyen === "carte"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border/80 hover:bg-muted/50"
                }`}
              >
                <IconeCarteBancaires className="h-7 w-11 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-foreground">Carte Bancaire</p>
                  <p className="text-xs text-muted-foreground">
                    Visa & Mastercard sécurisées
                  </p>
                </div>
              </button>
            </div>

            {/* Formulaire Mobile Money */}
            {typeMoyen === "mobile_money" && (
              <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Opérateur Mobile Money par défaut
                  </Label>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    <label
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                        operateurMobile === "orange_money"
                          ? "border-orange-500 bg-orange-500/10 text-orange-950 dark:text-orange-200 font-bold"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="operateur"
                        value="orange_money"
                        checked={operateurMobile === "orange_money"}
                        onChange={() => setOperateurMobile("orange_money")}
                        className="sr-only"
                      />
                      <IconeOrangeMoney className="h-5 w-5" />
                      <span className="text-xs">Orange Money</span>
                    </label>

                    <label
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                        operateurMobile === "mtn_momo"
                          ? "border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200 font-bold"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="operateur"
                        value="mtn_momo"
                        checked={operateurMobile === "mtn_momo"}
                        onChange={() => setOperateurMobile("mtn_momo")}
                        className="sr-only"
                      />
                      <IconeMtnMomo className="h-5 w-5" />
                      <span className="text-xs">MTN MoMo</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 max-w-md">
                  <Label htmlFor="tel-paiement" className="text-xs font-semibold text-foreground">
                    Numéro de téléphone de débit
                  </Label>
                  <ChampTelephone
                    id="tel-paiement"
                    valeur={telephonePaiement}
                    onChange={setTelephonePaiement}
                    codePaysParDefaut={utilisateur?.pays || "CM"}
                    placeholder="6 00 00 00 00"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Ce numéro recevra la notification USSD ou le push pour valider chaque abonnement.
                  </p>
                </div>
              </div>
            )}

            {/* Formulaire Carte Bancaire */}
            {typeMoyen === "carte" && (
              <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="carte-titulaire" className="text-xs font-semibold text-foreground">
                      Nom sur la carte
                    </Label>
                    <Input
                      id="carte-titulaire"
                      value={carteTitulaire}
                      onChange={(e) => setCarteTitulaire(e.target.value)}
                      placeholder="Ex: TCHANA MARC"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="carte-marque" className="text-xs font-semibold text-foreground">
                      Réseau de la carte
                    </Label>
                    <div className="flex gap-3">
                      <label
                        className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium cursor-pointer ${
                          carteMarque === "visa"
                            ? "border-primary bg-primary/10 font-bold"
                            : "border-border bg-card"
                        }`}
                      >
                        <input
                          type="radio"
                          name="marque"
                          value="visa"
                          checked={carteMarque === "visa"}
                          onChange={() => setCarteMarque("visa")}
                          className="sr-only"
                        />
                        <span>Visa</span>
                      </label>
                      <label
                        className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium cursor-pointer ${
                          carteMarque === "mastercard"
                            ? "border-primary bg-primary/10 font-bold"
                            : "border-border bg-card"
                        }`}
                      >
                        <input
                          type="radio"
                          name="marque"
                          value="mastercard"
                          checked={carteMarque === "mastercard"}
                          onChange={() => setCarteMarque("mastercard")}
                          className="sr-only"
                        />
                        <span>Mastercard</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="carte-chiffres" className="text-xs font-semibold text-foreground">
                      4 derniers chiffres (pour identification)
                    </Label>
                    <Input
                      id="carte-chiffres"
                      maxLength={4}
                      value={carteDerniersChiffres}
                      onChange={(e) =>
                        setCarteDerniersChiffres(
                          e.target.value.replace(/\D/g, "").slice(0, 4)
                        )
                      }
                      placeholder="Ex: 4821"
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="carte-exp" className="text-xs font-semibold text-foreground">
                      Date d&apos;expiration
                    </Label>
                    <Input
                      id="carte-exp"
                      maxLength={5}
                      value={carteExpiration}
                      onChange={(e) => setCarteExpiration(e.target.value)}
                      placeholder="MM/AA (Ex: 08/28)"
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    Vos coordonnées bancaires complètes sont traitées par la passerelle certifiée PCI-DSS CinetPay.
                  </span>
                </p>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={sauvegardeEnCours}
                size="sm"
                className="gap-2 font-semibold"
              >
                {sauvegardeEnCours ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Enregistrer mon mode de paiement</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 3. Carte Historique des Factures d'Abonnement */}
      <Card className="border-border/80 shadow-2xs">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            <span>Historique des Factures d&apos;Abonnement</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Téléchargez ou visualisez les factures officielles et preuves de paiement de vos forfaits.
          </p>
        </CardHeader>

        <CardContent className="pt-4 p-0 sm:p-0">
          {factures.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <FileText className="h-8 w-8 text-muted-foreground/60 mx-auto" />
              <p className="text-sm font-semibold text-foreground">
                Aucune facture d&apos;abonnement pour le moment
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Vos règlements d&apos;abonnements apparaîtront ici avec leur reçu officiel dès la première souscription.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 text-foreground font-semibold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-muted-foreground">
                  {factures.map((facture) => {
                    const estPaye = facture.statut === "valide";
                    const estOrange = facture.moyen_paiement === "orange_money";
                    const estMtn = facture.moyen_paiement === "mtn_momo";
                    const estCarte = facture.moyen_paiement === "carte";

                    return (
                      <tr key={facture.id} className="hover:bg-muted/15 transition-colors">
                        {/* Colonne Date */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-foreground">
                            {formatDateCourte(facture.date)}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {facture.numero_facture}
                          </p>
                        </td>

                        {/* Colonne Total */}
                        <td className="py-3.5 px-4 font-mono font-bold text-foreground text-sm">
                          {formatMontant(facture.total, facture.devise)}
                          <span className="block text-[11px] font-sans font-normal text-muted-foreground">
                            Plan {facture.plan} ({facture.duree_mois} mois)
                          </span>
                        </td>

                        {/* Colonne Statut */}
                        <td className="py-3.5 px-4">
                          {estPaye ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Payé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              {facture.statut === "en_attente" ? "En attente" : "Échoué"}
                            </span>
                          )}
                        </td>

                        {/* Colonne Actions (Voir + Lien selon mode de paiement) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Action 1 : Voir la facture officielle */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => ouvrirFacture(facture.reference)}
                              className="h-8 px-2.5 text-xs gap-1.5 font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/40 cursor-pointer"
                              title="Consulter la facture officielle Telora"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Voir</span>
                            </Button>

                            {/* Action 2 : Preuve / Reçu selon le mode de paiement */}
                            {estCarte ? (
                              facture.recu_url ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    window.open(facture.recu_url!, "_blank")
                                  }
                                  className="h-8 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                  title="Ouvrir le reçu bancaire externe"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  <span className="hidden sm:inline">Reçu carte</span>
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => ouvrirPreuve(facture)}
                                  className="h-8 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                  title="Détails du débit carte"
                                >
                                  <Info className="h-3 w-3" />
                                  <span className="hidden sm:inline">Détail carte</span>
                                </Button>
                              )
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => ouvrirPreuve(facture)}
                                className="h-8 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Voir la preuve de transaction réseau de l'opérateur"
                              >
                                {estOrange && <IconeOrangeMoney className="h-3.5 w-3.5" />}
                                {estMtn && <IconeMtnMomo className="h-3.5 w-3.5" />}
                                {!estOrange && !estMtn && <Info className="h-3 w-3" />}
                                <span className="hidden sm:inline">Preuve opérateur</span>
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
        </CardContent>
      </Card>

      {/* Modale de facture officielle */}
      <ModalFactureAbonnement
        reference={referenceFactureSelectionnee}
        ouvert={modalFactureOuverte}
        onFermer={() => {
          setModalFactureOuverte(false);
          setReferenceFactureSelectionnee(null);
        }}
      />

      {/* Modale de preuve opérateur */}
      <ModalPreuveOperateur
        facture={facturePreuveSelectionnee}
        ouvert={modalPreuveOuverte}
        onFermer={() => {
          setModalPreuveOuverte(false);
          setFacturePreuveSelectionnee(null);
        }}
      />
    </div>
  );
}
