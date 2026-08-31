"use client";

/**
 * Administration des paiements et de la passerelle CinetPay (/admin/paiements).
 *
 * Interface soignée et rédigée avec simplicité et humanité :
 * - Commutateur limpide : Mode Test (essais sans argent réel) ⇄ Mode En Direct (paiements réels CinetPay)
 * - Identifiants marchands CinetPay (Site ID, Clé API, Clé secrète de signature)
 * - Tarifs des forfaits proposés aux commerçants (Standard & Premium, mensuel & annuel en FCFA)
 * - Journal en temps réel des règlements effectués avec filtres conviviaux
 */

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Apparait, TitrePage } from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconeCarteBancaire,
  IconeMtnMomo,
  IconeOrangeMoney,
} from "@/components/icones-paiement";
import type { ConfigurationPaiementAdmin, ModePaiement, Page, Paiement } from "@/types";

export default function PageAdminPaiements() {
  const { t, lang, formatMontant, formatDate, formatNombre } = useI18n();

  // Données de configuration
  const [config, setConfig] = useState<ConfigurationPaiementAdmin | null>(null);
  const [chargementConfig, setChargementConfig] = useState(true);
  const [enregistrementConfig, setEnregistrementConfig] = useState(false);

  // Formulaire de configuration
  const [mode, setMode] = useState<ModePaiement>("test");
  const [siteId, setSiteId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [voirApiKey, setVoirApiKey] = useState(false);
  const [voirSecretKey, setVoirSecretKey] = useState(false);

  // Tarifs
  const [prixStandardMensuel, setPrixStandardMensuel] = useState(10000);
  const [prixStandardAnnuel, setPrixStandardAnnuel] = useState(100000);
  const [prixPremiumMensuel, setPrixPremiumMensuel] = useState(25000);
  const [prixPremiumAnnuel, setPrixPremiumAnnuel] = useState(250000);

  // Journal des paiements
  const [transactions, setTransactions] = useState<Page<Paiement> | null>(null);
  const [chargementTransactions, setChargementTransactions] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState<string>("");
  const [filtreMode, setFiltreMode] = useState<string>("");

  const chargerConfiguration = useCallback(async () => {
    try {
      const donnees = await api.get<ConfigurationPaiementAdmin>("/admin/paiements/configuration");
      setConfig(donnees);
      setMode(donnees.cinetpay_mode);
      setSiteId(donnees.cinetpay_site_id ?? "");
      setApiKey(donnees.cinetpay_api_key ?? "");
      setSecretKey(donnees.cinetpay_secret_key ?? "");
      setPrixStandardMensuel(donnees.tarifs.prix_standard_mensuel);
      setPrixStandardAnnuel(donnees.tarifs.prix_standard_annuel);
      setPrixPremiumMensuel(donnees.tarifs.prix_premium_mensuel);
      setPrixPremiumAnnuel(donnees.tarifs.prix_premium_annuel);
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setChargementConfig(false);
    }
  }, [t]);

  const chargerTransactions = useCallback(
    async (page = 1) => {
      setChargementTransactions(true);
      try {
        const params: Record<string, string | number> = { page };
        if (recherche.trim()) params.q = recherche.trim();
        if (filtreStatut) params.statut = filtreStatut;
        if (filtreMode) params.mode = filtreMode;

        const donnees = await api.get<Page<Paiement>>("/admin/paiements", params);
        setTransactions(donnees);
      } catch (e) {
        toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
      } finally {
        setChargementTransactions(false);
      }
    },
    [recherche, filtreStatut, filtreMode, t],
  );

  useEffect(() => {
    void chargerConfiguration();
    void chargerTransactions();
  }, [chargerConfiguration, chargerTransactions]);

  /**
   * Sauvegarde les paramètres ou bascule de mode
   */
  async function enregistrerConfiguration(nouveauMode?: ModePaiement) {
    const modeFinal = nouveauMode ?? mode;
    setEnregistrementConfig(true);

    try {
      await api.put("/admin/paiements/configuration", {
        cinetpay_mode: modeFinal,
        cinetpay_site_id: siteId,
        cinetpay_api_key: apiKey,
        cinetpay_secret_key: secretKey,
        prix_standard_mensuel: Number(prixStandardMensuel),
        prix_standard_annuel: Number(prixStandardAnnuel),
        prix_premium_mensuel: Number(prixPremiumMensuel),
        prix_premium_annuel: Number(prixPremiumAnnuel),
      });

      setMode(modeFinal);
      toast.success(
        modeFinal === "production"
          ? "Passage en Mode En Direct (Production) enregistré avec succès !"
          : "Passage en Mode Test (Sandbox) enregistré avec succès !",
      );
      await chargerConfiguration();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setEnregistrementConfig(false);
    }
  }

  if (chargementConfig || !config) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <TitrePage
          titre={
            lang === "en"
              ? "Payment Gateway & Subscriptions"
              : "Gestion des Encaissements & Passerelle CinetPay"
          }
          description={
            lang === "en"
              ? "Switch between testing and live processing, set up your CinetPay keys, and audit merchant subscriptions."
              : "Basculez facilement entre les tests et les paiements réels, configurez vos identifiants CinetPay et suivez les règlements effectués par les commerçants."
          }
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void chargerConfiguration();
            void chargerTransactions();
          }}
          className="gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{lang === "en" ? "Refresh data" : "Actualiser"}</span>
        </Button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. COMMUTATEUR GRAND FORMAT : MODE TEST ⇄ MODE PRODUCTION    */}
      {/* ------------------------------------------------------------- */}
      <Apparait index={0}>
        <Card
          className={`border-2 transition-all shadow-md ${
            mode === "production"
              ? "border-emerald-500/50 bg-emerald-500/5"
              : "border-amber-500/50 bg-amber-500/5"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-xs ${
                    mode === "production" ? "bg-emerald-600" : "bg-amber-500"
                  }`}
                >
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-heading">
                    {lang === "en" ? "Active Payment Environment" : "Environnement actuel des paiements"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {lang === "en"
                      ? "Choose whether merchant payments are simulated or processed directly by operators."
                      : "Déterminez si les règlements des commerçants sont simulés ou réellement prélevés par les opérateurs."}
                  </CardDescription>
                </div>
              </div>

              {/* Badge d'état visuel */}
              <div className="self-start sm:self-auto">
                {mode === "production" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    <span>EN DIRECT • PAIEMENTS RÉELS</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    <span>MODE TEST • SIMULATEUR SANS FRAIS</span>
                  </span>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            <div className="grid sm:grid-cols-2 gap-3.5">
              {/* Option 1 : Mode Test */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (mode !== "test") void enregistrerConfiguration("test");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    if (mode !== "test") void enregistrerConfiguration("test");
                  }
                }}
                className={`flex flex-col justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  mode === "test"
                    ? "border-amber-500 bg-background shadow-xs ring-2 ring-amber-500/20"
                    : "border-border/70 bg-muted/25 hover:border-foreground/20"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <span className="text-base">🧪</span>
                      <span>Mode Test (Essais sans argent réel)</span>
                    </span>
                    {mode === "test" && (
                      <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Idéal pour tester vous-même tout le parcours. Les souscriptions Orange Money, MTN MoMo et Carte sont simulées instantanément sans débiter un seul franc.
                  </p>
                </div>

                <div className="mt-4 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  {mode === "test" ? "✓ Activé en ce moment" : "👉 Cliquer pour basculer en Mode Test"}
                </div>
              </div>

              {/* Option 2 : Mode Production */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (mode !== "production") void enregistrerConfiguration("production");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    if (mode !== "production") void enregistrerConfiguration("production");
                  }
                }}
                className={`flex flex-col justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  mode === "production"
                    ? "border-emerald-500 bg-background shadow-xs ring-2 ring-emerald-500/20"
                    : "border-border/70 bg-muted/25 hover:border-foreground/20"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <span className="text-base">🟢</span>
                      <span>Mode En Direct (Paiements Réels)</span>
                    </span>
                    {mode === "production" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Les commerçants règlent avec leur vrai compte Orange Money, MTN MoMo ou Carte bancaire via CinetPay. Leurs boutiques sont prolongées immédiatement dès confirmation.
                  </p>
                </div>

                <div className="mt-4 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {mode === "production" ? "✓ Activé en ce moment" : "👉 Cliquer pour basculer En Direct"}
                </div>
              </div>
            </div>

            {mode === "production" && (!config.cle_api_renseignee || !config.site_id_renseigne) && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  <strong>Attention :</strong> Le mode En Direct est activé, mais votre <strong>Site ID</strong> ou votre <strong>Clé API CinetPay</strong> n&apos;est pas encore renseigné ci-dessous. Pensez à les enregistrer pour que vos commerçants puissent payer sans blocage.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </Apparait>

      {/* ------------------------------------------------------------- */}
      {/* 2. IDENTIFIANTS CINETPAY & TARIFS                             */}
      {/* ------------------------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Identifiants CinetPay */}
        <Apparait index={1}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Vos identifiants marchands CinetPay</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Ces informations vous sont fournies par CinetPay lors de l&apos;ouverture de votre compte marchand.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Site ID */}
              <div className="space-y-1.5">
                <Label htmlFor="cinetpay-site-id" className="text-xs font-medium">
                  Identifiant de site (Site ID)
                </Label>
                <Input
                  id="cinetpay-site-id"
                  placeholder="ex: 123456"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>

              {/* API Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cinetpay-api-key" className="text-xs font-medium">
                    Clé API secrète (API Key)
                  </Label>
                  <button
                    type="button"
                    onClick={() => setVoirApiKey(!voirApiKey)}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                  >
                    {voirApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{voirApiKey ? "Masquer" : "Afficher"}</span>
                  </button>
                </div>
                <Input
                  id="cinetpay-api-key"
                  type={voirApiKey ? "text" : "password"}
                  placeholder={config.cle_api_renseignee ? "•••••••••••• (déjà enregistrée)" : "ex: 1234567890abcdef..."}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>

              {/* Secret Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cinetpay-secret-key" className="text-xs font-medium">
                    Clé secrète de notification Webhook (Secret Key)
                  </Label>
                  <button
                    type="button"
                    onClick={() => setVoirSecretKey(!voirSecretKey)}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                  >
                    {voirSecretKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{voirSecretKey ? "Masquer" : "Afficher"}</span>
                  </button>
                </div>
                <Input
                  id="cinetpay-secret-key"
                  type={voirSecretKey ? "text" : "password"}
                  placeholder={config.cle_secrete_renseignee ? "•••••••••••• (déjà enregistrée)" : "Clé de signature secrète"}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => enregistrerConfiguration()}
                  disabled={enregistrementConfig}
                  className="w-full font-semibold cursor-pointer py-4"
                >
                  {enregistrementConfig && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <span>Enregistrer les identifiants CinetPay</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Apparait>

        {/* Tarification des forfaits */}
        <Apparait index={2}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <span>Tarifs proposés aux commerçants (en FCFA)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Définissez les montants qui s&apos;affichent aux gérants lorsqu&apos;ils renouvellent leur boutique.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Plan Standard (1 mois)
                  </Label>
                  <Input
                    type="number"
                    value={prixStandardMensuel}
                    onChange={(e) => setPrixStandardMensuel(Number(e.target.value))}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Plan Standard (1 an)
                  </Label>
                  <Input
                    type="number"
                    value={prixStandardAnnuel}
                    onChange={(e) => setPrixStandardAnnuel(Number(e.target.value))}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Plan Premium (1 mois)
                  </Label>
                  <Input
                    type="number"
                    value={prixPremiumMensuel}
                    onChange={(e) => setPrixPremiumMensuel(Number(e.target.value))}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Plan Premium (1 an)
                  </Label>
                  <Input
                    type="number"
                    value={prixPremiumAnnuel}
                    onChange={(e) => setPrixPremiumAnnuel(Number(e.target.value))}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-muted/40 p-3.5 text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">💡 Recommandation pour le marché :</strong> 10 000 FCFA/mois pour le Plan Standard et 25 000 FCFA/mois pour le Plan Premium sont des prix très bien acceptés par les commerçants. Les forfaits annuels offrent 2 mois gratuits, ce qui sécurise votre trésorerie.
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => enregistrerConfiguration()}
                  disabled={enregistrementConfig}
                  className="w-full font-semibold cursor-pointer py-4"
                >
                  {enregistrementConfig && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <span>Mettre à jour les tarifs</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Apparait>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. JOURNAL DES RÈGLEMENTS EN TEMPS RÉEL                       */}
      {/* ------------------------------------------------------------- */}
      <Apparait index={3}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>Derniers règlements reçus</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Suivez en direct les souscriptions effectuées par les gérants de boutiques.
                </CardDescription>
              </div>

              {/* Total encaissé */}
              <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-3.5 py-2 text-xs">
                <span className="text-muted-foreground">Total encaissé :</span>
                <span className="font-bold font-mono text-primary text-sm">
                  {formatMontant(config.statistiques.total_montant, config.statistiques.devise)}
                </span>
                <span className="text-muted-foreground">
                  ({formatNombre(config.statistiques.total_valides)} {config.statistiques.total_valides > 1 ? "règlements" : "règlement"})
                </span>
              </div>
            </div>

            {/* Barre de recherche et filtres conviviaux */}
            <div className="flex flex-col sm:flex-row gap-2 pt-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom de commerçant, email ou référence..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void chargerTransactions(1);
                  }}
                  className="pl-8 text-xs h-9"
                />
              </div>

              {/* Filtre Environnement */}
              <select
                aria-label="Filtre par environnement"
                value={filtreMode}
                onChange={(e) => {
                  setFiltreMode(e.target.value);
                  setTimeout(() => void chargerTransactions(1), 50);
                }}
                className="h-9 rounded-lg border bg-background px-3 text-xs text-foreground cursor-pointer"
              >
                <option value="">Tous les environnements</option>
                <option value="test">Mode Test uniquement</option>
                <option value="production">Mode Production (Réel) uniquement</option>
              </select>

              {/* Filtre Statut */}
              <select
                aria-label="Filtre par statut de transaction"
                value={filtreStatut}
                onChange={(e) => {
                  setFiltreStatut(e.target.value);
                  setTimeout(() => void chargerTransactions(1), 50);
                }}
                className="h-9 rounded-lg border bg-background px-3 text-xs text-foreground cursor-pointer"
              >
                <option value="">Tous les statuts</option>
                <option value="valide">Validés (Actifs)</option>
                <option value="en_attente">En attente de paiement</option>
                <option value="echec">Échoués / Refusés</option>
              </select>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => void chargerTransactions(1)}
                className="h-9 text-xs cursor-pointer"
              >
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                <span>Filtrer</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-1">
            {chargementTransactions ? (
              <div className="flex min-h-[150px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !transactions || transactions.data.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                Aucun règlement enregistré pour le moment avec ces critères.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b bg-muted/30 text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Date & Heure</th>
                      <th className="py-2.5 px-3 font-semibold">Référence</th>
                      <th className="py-2.5 px-3 font-semibold">Commerçant</th>
                      <th className="py-2.5 px-3 font-semibold">Forfait</th>
                      <th className="py-2.5 px-3 font-semibold">Montant</th>
                      <th className="py-2.5 px-3 font-semibold">Moyen</th>
                      <th className="py-2.5 px-3 font-semibold">Environnement</th>
                      <th className="py-2.5 px-3 font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactions.data.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground font-mono">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-foreground whitespace-nowrap">
                          {tx.reference}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-foreground">
                            {tx.user?.name ?? "—"}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {tx.user?.email ?? "—"}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="uppercase font-semibold">
                            {tx.plan === "premium" ? "Premium" : "Standard"}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            ({tx.duree_mois === 12 ? "1 an" : "1 mois"})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-semibold text-foreground">
                          {formatMontant(tx.montant, tx.devise)}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {tx.moyen_paiement === "orange_money" ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                              <IconeOrangeMoney className="h-4 w-4 rounded-xs" />
                              <span>Orange Money</span>
                            </span>
                          ) : tx.moyen_paiement === "mtn_momo" ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                              <IconeMtnMomo className="h-4 w-4 rounded-xs" />
                              <span>MTN MoMo</span>
                            </span>
                          ) : tx.moyen_paiement === "carte" ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                              <IconeCarteBancaire className="h-4 w-6 rounded-xs" />
                              <span>Carte Bancaire</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {tx.mode === "production" ? (
                            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              EN DIRECT
                            </span>
                          ) : (
                            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                              TEST
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {tx.statut === "valide" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Validé</span>
                            </span>
                          ) : tx.statut === "en_attente" ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                              <Clock className="h-3.5 w-3.5" />
                              <span>En attente</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-destructive font-medium">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Refusé</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </Apparait>
    </div>
  );
}
