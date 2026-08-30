"use client";

/**
 * Entrée de stock (/telephones/nouveau).
 *
 * Pensé pour l'arrivage : on scanne, on valide, le champ IMEI se vide et
 * reprend le focus pour l'appareil suivant. Les autres champs (modèle,
 * couleur, prix) restent remplis d'un appareil à l'autre : dans un carton,
 * ils sont presque toujours identiques.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, PackagePlus, Search } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { imeiValide } from "@/lib/imei";
import { formaterImei } from "@/lib/imei";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { convertirMontant, obtenirDevise } from "@/lib/devises";
import { ChampImei } from "@/components/champ-imei";
import { Apparait, TitrePage } from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectRecherche } from "@/components/ui/select-recherche";
import { Textarea } from "@/components/ui/textarea";
import type {
  EtatTelephone,
  Gamme,
  Marque,
  Modele,
  ResultatLookupImei,
  Telephone,
} from "@/types";

export default function PageEntreeStock() {
  const { boutiques, boutiqueActive, utilisateur, deviseBoutique } = useAuth();
  const { t, libelleEtat, lang } = useI18n();

  const estPremium = Boolean(
    utilisateur?.est_premium || utilisateur?.abonnement?.plan === "premium",
  );

  const [modeles, setModeles] = useState<Modele[]>([]);
  const [imei, setImei] = useState("");
  const [ajoutes, setAjoutes] = useState<Telephone[]>([]);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const [marques, setMarques] = useState<Marque[]>([]);
  const [gammes, setGammes] = useState<Gamme[]>([]);
  const [gammeChoisie, setGammeChoisie] = useState("");
  const [stockageChoisi, setStockageChoisi] = useState("");
  const [marqueChoisie, setMarqueChoisie] = useState("");

  const [detection, setDetection] = useState<ResultatLookupImei | null>(null);
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  const [dernierTacRecherche, setDernierTacRecherche] = useState("");
  const [importationEnCours, setImportationEnCours] = useState(false);

  // Ces champs sont conservés d'un appareil à l'autre.
  const [commun, setCommun] = useState({
    modele_id: "",
    boutique_id: boutiqueActive ? String(boutiqueActive.id) : "",
    couleur: "",
    etat: "neuf" as EtatTelephone,
    prix_achat: "",
    prix_vente: "",
    fournisseur: "",
    notes: "",
  });

  useEffect(() => {
    api
      .get<{ data: Marque[] }>("/marques")
      .then((r) => setMarques(r.data))
      .catch(() => setMarques([]));
  }, []);

  useEffect(() => {
    if (!marqueChoisie) {
      setGammes([]);
      return;
    }
    api
      .get<{ data: Gamme[] }>("/gammes", { marque_id: marqueChoisie })
      .then((r) => setGammes(r.data))
      .catch(() => setGammes([]));
  }, [marqueChoisie]);

  useEffect(() => {
    api
      .get<{ data: Modele[] }>("/modeles", { actifs_seulement: true })
      .then((r) => setModeles(r.data))
      .catch(() => setModeles([]));
  }, []);

  const modelesFiltres = useMemo(() => {
    if (!gammeChoisie) return [];
    return modeles.filter(
      (m) => m.gamme?.id === gammeChoisie || String(m.id) === commun.modele_id,
    );
  }, [modeles, gammeChoisie, commun.modele_id]);

  const modeleActuel = modeles.find((m) => String(m.id) === commun.modele_id);
  const stockagesDisponibles = modeleActuel?.stockages ?? [];

  function choisirMarque(id: string) {
    setMarqueChoisie(id);
    setGammeChoisie("");
    setCommun((p) => ({ ...p, modele_id: "" }));
    setStockageChoisi("");
  }

  function choisirGamme(id: string) {
    setGammeChoisie(id);
    setCommun((p) => ({ ...p, modele_id: "" }));
    setStockageChoisi("");
  }

  function choisirModeleAvecStockage(id: string) {
    choisirModele(id);
    setStockageChoisi("");
  }

  // Si une seule boutique est accessible, elle est choisie d'office.
  useEffect(() => {
    if (!commun.boutique_id && boutiques.length === 1) {
      setCommun((p) => ({ ...p, boutique_id: String(boutiques[0].id) }));
    }
  }, [boutiques, commun.boutique_id]);

  function modifier(champ: keyof typeof commun, valeur: string) {
    setCommun((precedent) => ({ ...precedent, [champ]: valeur }));
  }

  const boutiqueSelectionnee = boutiques.find(
    (b) => String(b.id) === String(commun.boutique_id),
  ) ?? boutiqueActive ?? boutiques[0];
  const deviseEntree = boutiqueSelectionnee?.devise ?? deviseBoutique;
  const configDeviseEntree = obtenirDevise(deviseEntree);

  /** Reprend les prix conseillés du modèle choisi, s'ils sont vides. */
  function choisirModele(id: string) {
    const modele = modeles.find((m) => String(m.id) === id);

    let pacStr = "";
    let pvcStr = "";

    if (modele?.prix_achat_conseille) {
      const pac = convertirMontant(modele.prix_achat_conseille, "XAF", deviseEntree);
      pacStr = String(configDeviseEntree.decimales === 0 ? Math.round(pac) : Number(pac.toFixed(configDeviseEntree.decimales)));
    }
    if (modele?.prix_vente_conseille) {
      const pvc = convertirMontant(modele.prix_vente_conseille, "XAF", deviseEntree);
      pvcStr = String(configDeviseEntree.decimales === 0 ? Math.round(pvc) : Number(pvc.toFixed(configDeviseEntree.decimales)));
    }

    setCommun((precedent) => ({
      ...precedent,
      modele_id: id,
      prix_achat: precedent.prix_achat || pacStr,
      prix_vente: precedent.prix_vente || pvcStr,
    }));
  }

  const appliquerSelection = useCallback(
    async (sel: {
      marque_id: string;
      gamme_id: string;
      modele_id: string;
      modele_stockage_id: string | null;
    }) => {
      setMarqueChoisie(sel.marque_id);
      try {
        const [resGammes, resModeles] = await Promise.all([
          api.get<{ data: Gamme[] }>("/gammes", { marque_id: sel.marque_id }),
          api.get<{ data: Modele[] }>("/modeles", { actifs_seulement: true }),
        ]);
        setGammes(resGammes.data);
        setModeles(resModeles.data);
        setGammeChoisie(sel.gamme_id);

        const mod = resModeles.data.find((m) => String(m.id) === sel.modele_id);
        let pacStr = "";
        let pvcStr = "";

        if (mod?.prix_achat_conseille) {
          const pac = convertirMontant(mod.prix_achat_conseille, "XAF", deviseEntree);
          pacStr = String(configDeviseEntree.decimales === 0 ? Math.round(pac) : Number(pac.toFixed(configDeviseEntree.decimales)));
        }
        if (mod?.prix_vente_conseille) {
          const pvc = convertirMontant(mod.prix_vente_conseille, "XAF", deviseEntree);
          pvcStr = String(configDeviseEntree.decimales === 0 ? Math.round(pvc) : Number(pvc.toFixed(configDeviseEntree.decimales)));
        }

        setCommun((precedent) => ({
          ...precedent,
          modele_id: sel.modele_id,
          prix_achat: precedent.prix_achat || pacStr,
          prix_vente: precedent.prix_vente || pvcStr,
        }));

        if (sel.modele_stockage_id) {
          setStockageChoisi(sel.modele_stockage_id);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [configDeviseEntree.decimales, deviseEntree],
  );

  async function importerModeleDetecte() {
    if (!detection) return;
    setImportationEnCours(true);
    try {
      const rep = await api.post<{
        data: {
          marque_id: string;
          gamme_id: string;
          modele_id: string;
          modele_stockage_id: string;
          modele: Modele;
        };
      }>("/telephones/importer-modele-tac", {
        marque: detection.marque,
        gamme: detection.gamme,
        modele: detection.modele,
        stockage_defaut: detection.stockage_defaut,
      });

      const [resMarques, resModeles] = await Promise.all([
        api.get<{ data: Marque[] }>("/marques"),
        api.get<{ data: Modele[] }>("/modeles", { actifs_seulement: true }),
      ]);
      setMarques(resMarques.data);
      setModeles(resModeles.data);

      await appliquerSelection(rep.data);
      setDetection((prev) => (prev ? { ...prev, deja_en_catalogue: true } : null));
      toast.success(
        lang === "en"
          ? `Model "${detection.modele}" created and selected!`
          : `Modèle « ${detection.modele} » créé et sélectionné !`,
      );
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setImportationEnCours(false);
    }
  }

  const nomCompletDetecte = useMemo(() => {
    if (!detection) return "";
    const marque = detection.marque ?? "";
    const gamme = detection.gamme ?? "";
    const modele = detection.modele ?? "";

    if (gamme && modele.toLowerCase().includes(gamme.toLowerCase())) {
      return `${marque} ${modele}`.trim();
    }
    if (marque && modele.toLowerCase().includes(marque.toLowerCase())) {
      return modele.trim();
    }
    return [marque, gamme, modele].filter(Boolean).join(" ");
  }, [detection]);

  const [nonTrouve, setNonTrouve] = useState(false);

  const lancerRecherche = useCallback(
    async (saisie: string) => {
      const chiffres = saisie.replace(/\D/g, "");
      if (chiffres.length < 8) return;

      if (!estPremium) {
        return;
      }

      const tac = chiffres.substring(0, 8);
      setDernierTacRecherche(tac);
      setRechercheEnCours(true);
      setNonTrouve(false);

      try {
        const res = await api.get<ResultatLookupImei>("/telephones/lookup-imei", {
          imei: chiffres,
        });

        if (res.trouve) {
          setDetection(res);
          setNonTrouve(false);
          if (res.deja_en_catalogue && res.selection) {
            await appliquerSelection(res.selection);
            toast.success(
              lang === "en"
                ? `Recognized & selected: ${res.marque} ${res.modele}`
                : `Appareil reconnu et sélectionné : ${res.marque} ${res.modele}`,
            );
          } else {
            toast.info(
              lang === "en"
                ? `Recognized: ${res.marque} ${res.modele}. Click "Add to catalog" to select it.`
                : `Appareil détecté : ${res.marque} ${res.modele}. Cliquez sur « Ajouter au catalogue » pour le sélectionner.`,
            );
          }
        } else {
          setDetection(null);
          setNonTrouve(true);
        }
      } catch (e) {
        setDetection(null);
        if (e instanceof ErreurApi) {
          toast.error(e.resume());
        }
      } finally {
        setRechercheEnCours(false);
      }
    },
    [estPremium, lang, appliquerSelection],
  );

  useEffect(() => {
    const chiffres = imei.replace(/\D/g, "");
    if (chiffres.length < 8) {
      setDetection(null);
      setNonTrouve(false);
      setDernierTacRecherche("");
      return;
    }

    const tac = chiffres.substring(0, 8);
    if (tac === dernierTacRecherche) return;

    if (estPremium) {
      void lancerRecherche(chiffres);
    }
  }, [imei, dernierTacRecherche, estPremium, lancerRecherche]);

  const enregistrer = useCallback(
    async (imeiScanne: string) => {
      if (!commun.modele_id) {
        toast.error(
          lang === "en"
            ? "Please select a model first."
            : "Choisissez d'abord le modèle.",
        );
        return;
      }

      if (!stockageChoisi) {
        toast.error(
          lang === "en"
            ? "Please select storage capacity first."
            : "Choisissez d'abord le stockage.",
        );
        return;
      }

      setErreurs({});
      setEnvoiEnCours(true);

      try {
        const reponse = await api.post<{ data: Telephone }>("/telephones", {
          modele_id: String(commun.modele_id),
          boutique_id: commun.boutique_id || undefined,
          imei: imeiScanne,
          couleur: commun.couleur || null,
          etat: commun.etat,
          modele_stockage_id: stockageChoisi,
          prix_achat: commun.prix_achat ? Number(commun.prix_achat) : null,
          prix_vente: commun.prix_vente ? Number(commun.prix_vente) : null,
          fournisseur: commun.fournisseur || null,
          notes: commun.notes || null,
        });

        setAjoutes((precedent) => [reponse.data, ...precedent]);
        setImei("");
        setDetection(null);
        setNonTrouve(false);
        setDernierTacRecherche("");
        toast.success(t("telephones.appareilCree"));
      } catch (e) {
        if (e instanceof ErreurApi) {
          setErreurs(e.parChamp());
          toast.error(e.resume());
        }
      } finally {
        setEnvoiEnCours(false);
      }
    },
    [commun, stockageChoisi, t, lang],
  );

  async function gererScanImei(valeurScanne: string) {
    setImei(valeurScanne);
    if (commun.modele_id && stockageChoisi) {
      await enregistrer(valeurScanne);
    } else if (estPremium) {
      await lancerRecherche(valeurScanne);
    } else {
      toast.error(
        lang === "en"
          ? "Please select a model first."
          : "Choisissez d'abord le modèle.",
      );
    }
  }

  const pret =
    Boolean(commun.modele_id) && Boolean(stockageChoisi) && imeiValide(imei);

  const etats: EtatTelephone[] = ["neuf", "occasion", "reconditionne"];

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        nativeButton={false}
        render={<Link href="/telephones" />}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {lang === "en" ? "Back to inventory" : "Retour au parc"}
      </Button>

      <TitrePage
        titre={t("telephones.entreeStock")}
        description={
          lang === "en"
            ? "Scan IMEI for each unit. Other fields stay populated for the next phone."
            : "Scannez l'IMEI de chaque appareil. Les autres champs restent remplis pour le suivant."
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Apparait>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {lang === "en" ? "The Device" : "L'appareil"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <ChampImei
                  valeur={imei}
                  onChange={(val) => {
                    setImei(val);
                    setNonTrouve(false);
                  }}
                  onScanValide={(valeur) => void gererScanImei(valeur)}
                  erreur={erreurs.imei}
                />
                {estPremium && imei.replace(/\D/g, "").length >= 8 && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium text-primary"
                      onClick={() => void lancerRecherche(imei)}
                      disabled={rechercheEnCours}
                    >
                      {rechercheEnCours ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Search className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {lang === "en" ? "Identify device" : "Identifier l'appareil"}
                    </Button>
                  </div>
                )}
              </div>

              {!estPremium ? (
                <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Premium :</span>
                  <span>
                    {lang === "en"
                      ? "Automatic model detection by IMEI is reserved for Premium members."
                      : "L'identification automatique du modèle par IMEI est réservée aux abonnés Premium."}
                  </span>
                </div>
              ) : rechercheEnCours ? (
                <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>
                    {lang === "en"
                      ? "Identifying device from IMEI..."
                      : "Identification du modèle en cours..."}
                  </span>
                </div>
              ) : nonTrouve ? (
                <div className="flex items-center gap-2 rounded-lg border border-muted bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
                  <span className="text-base">ℹ️</span>
                  <span>
                    {lang === "en"
                      ? "Device not recognized in TAC database for this IMEI. Please select brand and model manually below."
                      : "Modèle non répertorié dans la base TAC pour cet IMEI. Vous pouvez sélectionner la marque et le modèle manuellement ci-dessous."}
                  </span>
                </div>
              ) : detection && !detection.deja_en_catalogue ? (
                <div className="rounded-lg border border-border/80 bg-muted/30 p-3.5 text-sm">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-medium text-foreground">
                        {lang === "en" ? "Identified device:" : "Appareil identifié :"} {nomCompletDetecte}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {lang === "en"
                          ? "This model is not yet in your catalog."
                          : "Ce modèle n'est pas encore enregistré dans votre catalogue."}
                        {detection.stockage_defaut ? ` (${detection.stockage_defaut})` : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={importerModeleDetecte}
                      disabled={importationEnCours}
                      className="shrink-0"
                    >
                      {importationEnCours && (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      )}
                      {lang === "en"
                        ? "Add to catalog"
                        : "Ajouter au catalogue"}
                    </Button>
                  </div>
                </div>
              ) : detection && detection.deja_en_catalogue ? (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border/60 px-3 py-2 text-xs font-medium text-foreground">
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {lang === "en"
                      ? `Selected model: ${nomCompletDetecte}`
                      : `Modèle sélectionné : ${nomCompletDetecte}`}
                  </span>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    {t("modeles.marques")}
                    <span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  <SelectRecherche
                    options={marques.map((m) => ({
                      valeur: m.id,
                      libelle: m.nom,
                    }))}
                    valeur={marqueChoisie}
                    onChange={(v) => choisirMarque(v)}
                    placeholder={
                      lang === "en" ? "Choose brand" : "Choisir la marque"
                    }
                    placeholderRecherche={
                      lang === "en" ? "Search brand..." : "Rechercher une marque…"
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {t("modeles.gammes")}
                    <span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  <SelectRecherche
                    options={gammes.map((g) => ({
                      valeur: g.id,
                      libelle: g.nom,
                    }))}
                    valeur={gammeChoisie}
                    onChange={(v) => choisirGamme(v)}
                    disabled={!marqueChoisie}
                    placeholder={
                      marqueChoisie
                        ? lang === "en"
                          ? "Choose range"
                          : "Choisir la gamme"
                        : lang === "en"
                          ? "Choose brand first"
                          : "Choisissez d'abord la marque"
                    }
                    placeholderRecherche={
                      lang === "en" ? "Search range..." : "Rechercher une gamme…"
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  {t("telephones.modele")}
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                <SelectRecherche
                  options={modelesFiltres.map((m) => ({
                    valeur: String(m.id),
                    libelle: m.nom,
                    description: m.ram ? `RAM : ${m.ram}` : undefined,
                  }))}
                  valeur={commun.modele_id}
                  onChange={(v) => choisirModeleAvecStockage(v)}
                  disabled={!gammeChoisie}
                  placeholder={
                    gammeChoisie
                      ? lang === "en"
                        ? "Choose model"
                        : "Choisir le modèle"
                      : lang === "en"
                        ? "Choose range first"
                        : "Choisissez d'abord la gamme"
                  }
                  placeholderRecherche={
                    lang === "en" ? "Search model..." : "Rechercher un modèle…"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  {t("telephones.stockage")}
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                <SelectRecherche
                  options={stockagesDisponibles.map((s) => ({
                    valeur: s.id,
                    libelle: s.valeur,
                  }))}
                  valeur={stockageChoisi}
                  onChange={(v) => setStockageChoisi(v)}
                  disabled={!commun.modele_id}
                  placeholder={
                    commun.modele_id
                      ? lang === "en"
                        ? "Choose storage"
                        : "Choisir le stockage"
                      : lang === "en"
                        ? "Choose model first"
                        : "Choisissez d'abord le modèle"
                  }
                  placeholderRecherche={
                    lang === "en" ? "Search storage..." : "Rechercher un stockage…"
                  }
                />
                {stockagesDisponibles.length === 0 && commun.modele_id && (
                  <p className="text-xs text-muted-foreground">
                    {lang === "en"
                      ? "No storage capacity configured for this model. Add one in the catalog."
                      : "Aucun stockage configuré pour ce modèle. Ajoutez-en un depuis le catalogue."}
                  </p>
                )}
              </div>

              {boutiques.length > 1 && (
                <div className="space-y-2">
                  <Label>
                    {t("telephones.boutique")}
                    <span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  <SelectRecherche
                    options={boutiques.map((b) => ({
                      valeur: String(b.id),
                      libelle: b.nom,
                      description: b.ville ?? undefined,
                    }))}
                    valeur={commun.boutique_id}
                    onChange={(v) => modifier("boutique_id", v)}
                    erreur={Boolean(erreurs.boutique_id)}
                    placeholder={
                      lang === "en"
                        ? "Where is this unit entering?"
                        : "Où entre cet appareil ?"
                    }
                    placeholderRecherche={
                      lang === "en" ? "Search store..." : "Rechercher une boutique…"
                    }
                  />
                  {erreurs.boutique_id && (
                    <p className="text-xs text-destructive">
                      {erreurs.boutique_id}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="couleur">{t("telephones.couleur")}</Label>
                  <Input
                    id="couleur"
                    className="h-10"
                    value={commun.couleur}
                    onChange={(e) => modifier("couleur", e.target.value)}
                    placeholder={
                      lang === "en" ? "Black, Blue..." : "Noir, Bleu…"
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("commun.etat")}</Label>
                  <Select
                    items={Object.fromEntries(
                      etats.map((e) => [e, libelleEtat(e)]),
                    )}
                    value={commun.etat}
                    onValueChange={(v) =>
                      modifier("etat", (v ?? "neuf") as EtatTelephone)
                    }
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {etats.map((valeur) => (
                        <SelectItem key={valeur} value={valeur}>
                          {libelleEtat(valeur)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prix-achat">
                    {t("telephones.prixAchat")} ({deviseEntree})
                  </Label>
                  <Input
                    id="prix-achat"
                    type="number"
                    min={0}
                    className="chiffres h-10"
                    value={commun.prix_achat}
                    onChange={(e) => modifier("prix_achat", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prix-vente">
                    {t("telephones.prixVente")} ({deviseEntree})
                  </Label>
                  <Input
                    id="prix-vente"
                    type="number"
                    min={0}
                    className="chiffres h-10"
                    value={commun.prix_vente}
                    onChange={(e) => modifier("prix_vente", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fournisseur">{t("telephones.fournisseur")}</Label>
                <Input
                  id="fournisseur"
                  className="h-10"
                  value={commun.fournisseur}
                  onChange={(e) => modifier("fournisseur", e.target.value)}
                  placeholder={
                    lang === "en"
                      ? "Dubai Import, local supplier..."
                      : "Import Dubaï, grossiste local…"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("telephones.notes")}</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={commun.notes}
                  onChange={(e) => modifier("notes", e.target.value)}
                  placeholder={t("telephones.notesPlaceholder")}
                />
              </div>

              <Button
                type="button"
                size="lg"
                className="w-full"
                disabled={!pret || envoiEnCours}
                onClick={() => void enregistrer(imei)}
              >
                {envoiEnCours ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PackagePlus className="mr-2 h-4 w-4" />
                )}
                {lang === "en" ? "Add to inventory" : "Ajouter au stock"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {lang === "en"
                  ? "With a barcode scanner, saving is automatic upon scan."
                  : "Avec une douchette, l'enregistrement se fait tout seul au scan."}
              </p>
            </CardContent>
          </Card>
        </Apparait>

        {/* Ce qui vient d'être enregistré, pour vérifier d'un coup d'œil */}
        <Apparait index={1}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">
                {lang === "en"
                  ? "Registered in this session"
                  : "Enregistrés dans cette session"}
                {ajoutes.length > 0 && (
                  <span className="chiffres ml-2 text-muted-foreground">
                    {ajoutes.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ajoutes.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  {lang === "en"
                    ? "Added devices will appear here progressively."
                    : "Les appareils ajoutés apparaîtront ici au fur et à mesure."}
                </p>
              ) : (
                <ul className="divide-y">
                  {ajoutes.map((appareil, index) => (
                    <li key={appareil.id}>
                      <Link
                        href={`/telephones/${appareil.id}`}
                        className="flex items-center gap-3 py-2.5"
                        style={{ "--index": index } as React.CSSProperties}
                      >
                        <Check className="h-4 w-4 shrink-0 text-statut-ok" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {appareil.modele?.libelle}
                          </p>
                          <p className="chiffres truncate font-mono text-xs text-muted-foreground">
                            {formaterImei(appareil.imei)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Apparait>
      </div>
    </>
  );
}
