"use client";

/** Les boutiques du propriétaire (/boutiques). */

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Pencil, Plus, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import {
  Apparait,
  EtatErreur,
  EtatVide,
  SqueletteGrilleBoutiques,
  TitrePage,
} from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogCorps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChampTelephone } from "@/components/champ-telephone";
import { formaterTelephoneVisuel, LISTE_PAYS } from "@/lib/pays";
import { Switch } from "@/components/ui/switch";
import { SelectRecherche } from "@/components/ui/select-recherche";
import {
  nettoyerNiu,
  validerNiu,
  nettoyerRccm,
  validerRccm,
} from "@/lib/validation-legale";
import { DEVISES } from "@/lib/devises";
import type { Boutique } from "@/types";

export default function PageBoutiques() {
  const { rafraichir, utilisateur } = useAuth();
  const { t, formatNombre, lang } = useI18n();

  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enEdition, setEnEdition] = useState<Partial<Boutique> | null>(null);
  const [aSupprimer, setASupprimer] = useState<Boutique | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      const reponse = await api.get<{ data: Boutique[] }>("/boutiques");
      setBoutiques(reponse.data);
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : t("commun.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  async function supprimer() {
    if (!aSupprimer) return;
    try {
      await api.delete(`/boutiques/${aSupprimer.id}`);
      toast.success(t("boutiques.boutiqueSupprimee"));
      setASupprimer(null);
      void charger();
      void rafraichir();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    }
  }

  if (chargement) return <SqueletteGrilleBoutiques />;

  return (
    <>
      <TitrePage
        titre={t("boutiques.titre")}
        description={t("boutiques.description")}
      >
        <Button onClick={() => setEnEdition({})}>
          <Plus className="mr-2 h-4 w-4" />
          {t("boutiques.ajouterBoutique")}
        </Button>
      </TitrePage>

      {erreur ? (
        <EtatErreur message={erreur} onReessayer={() => void charger()} />
      ) : boutiques.length === 0 ? (
        <EtatVide
          icone={<Store className="h-5 w-5" />}
          titre={t("boutiques.aucuneBoutique")}
          description={t("boutiques.aucuneBoutiqueDesc")}
        >
          <Button onClick={() => setEnEdition({})}>
            <Plus className="mr-2 h-4 w-4" />
            {t("boutiques.ajouterBoutique")}
          </Button>
        </EtatVide>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {boutiques.map((boutique, index) => (
            <Apparait key={boutique.id} index={index}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-4 p-3.5 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <LogoBoutiqueAffichage logoUrl={boutique.logo_url} nom={boutique.nom} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{boutique.nom}</p>
                        <p className="truncate text-sm font-normal text-foreground/80">
                          {boutique.adresse || t("boutiques.adresseNonRenseignee")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {[
                            boutique.ville,
                            LISTE_PAYS.find((p) => p.code === boutique.pays)?.nomFr || boutique.pays,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </div>
                    {!boutique.active && (
                      <span className="shrink-0 rounded-full bg-statut-neutre-fond px-2 py-0.5 text-xs text-statut-neutre">
                        {t("boutiques.fermee")}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                    {boutique.pays && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/60 border border-border/50">
                        <span className="mr-1">
                          {LISTE_PAYS.find((p) => p.code === boutique.pays)?.drapeau || "🌐"}
                        </span>
                        {LISTE_PAYS.find((p) => p.code === boutique.pays)?.nomFr || boutique.pays}
                      </span>
                    )}
                    {boutique.niu && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/60 border border-border/50">
                        <strong className="font-medium mr-1">NIU :</strong> {boutique.niu}
                      </span>
                    )}
                    {boutique.registre_commerce && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/60 border border-border/50">
                        <strong className="font-medium mr-1">RCCM :</strong> {boutique.registre_commerce}
                      </span>
                    )}
                  </div>

                  <dl className="flex gap-6 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        {t("dashboard.enStock")}
                      </dt>
                      <dd className="chiffres mt-0.5 text-lg font-semibold">
                        {formatNombre(boutique.nb_en_stock ?? 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        {t("equipe.titre")}
                      </dt>
                      <dd className="chiffres mt-0.5 text-lg font-semibold">
                        {formatNombre(boutique.nb_employes ?? 0)}
                      </dd>
                    </div>
                  </dl>

                  {boutique.telephone && (
                    <p className="chiffres text-sm text-muted-foreground flex items-center gap-1.5">
                      <span>{formaterTelephoneVisuel(boutique.telephone)}</span>
                    </p>
                  )}

                  <div className="mt-auto flex gap-2 border-t pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEnEdition(boutique)}
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      {t("commun.modifier")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setASupprimer(boutique)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t("commun.supprimer")}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Apparait>
          ))}
        </div>
      )}

      <FenetreBoutique
        boutique={enEdition}
        onFermer={() => setEnEdition(null)}
        onSucces={() => {
          setEnEdition(null);
          void charger();
          void rafraichir();
        }}
      />

      <Dialog
        open={aSupprimer !== null}
        onOpenChange={(o) => !o && setASupprimer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lang === "en"
                ? `Delete "${aSupprimer?.nom}"?`
                : `Supprimer « ${aSupprimer?.nom} » ?`}
            </DialogTitle>
            <DialogDescription>
              {lang === "en"
                ? "A store that still contains devices cannot be deleted. Transfer them first or simply mark the store as closed."
                : "Une boutique qui contient encore des appareils ne peut pas être supprimée. Transférez-les d'abord, ou marquez simplement la boutique comme fermée."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setASupprimer(null)}>
              {t("commun.annuler")}
            </Button>
            <Button variant="destructive" onClick={() => void supprimer()}>
              {t("commun.supprimer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function LogoBoutiqueAffichage({
  logoUrl,
  nom,
  taille = "w-11 h-11",
}: {
  logoUrl?: string | null;
  nom: string;
  taille?: string;
}) {
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    setErreur(false);
  }, [logoUrl]);

  if (!logoUrl || erreur) {
    return (
      <div className={`${taille} rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0`}>
        <Store className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className={`relative ${taille} rounded-lg bg-white dark:bg-neutral-800 border border-border overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-xs`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={nom}
        className="max-h-full max-w-full object-contain"
        onError={() => setErreur(true)}
      />
    </div>
  );
}

function FenetreBoutique({
  boutique,
  onFermer,
  onSucces,
}: {
  boutique: Partial<Boutique> | null;
  onFermer: () => void;
  onSucces: () => void;
}) {
  const { utilisateur } = useAuth();
  const { t, lang } = useI18n();
  const modification = Boolean(boutique?.id);
  const nomEntreprise =
    utilisateur?.entreprise_nom || boutique?.nom || "Boutique";

  const [champs, setChamps] = useState({
    nom: nomEntreprise,
    pays: boutique?.pays ?? (utilisateur?.pays || "CM"),
    ville: "",
    adresse: "",
    telephone: "",
    devise: "XAF",
    active: true,
    niu: "",
    registre_commerce: "",
  });

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    if (!boutique) return;
    setChamps({
      nom: nomEntreprise,
      pays: boutique.pays ?? (utilisateur?.pays || "CM"),
      ville: boutique.ville ?? "",
      adresse: boutique.adresse ?? "",
      telephone: boutique.telephone ?? "",
      devise: boutique.devise ?? "XAF",
      active: boutique.active ?? true,
      niu: boutique.niu ?? "",
      registre_commerce: boutique.registre_commerce ?? "",
    });
    setErreurs({});
  }, [boutique, nomEntreprise, utilisateur?.pays]);

  function modifier<K extends keyof typeof champs>(
    champ: K,
    valeur: (typeof champs)[K],
  ) {
    let valeurAjustee = valeur;
    if (champ === "niu" && typeof valeur === "string") {
      valeurAjustee = nettoyerNiu(valeur) as (typeof champs)[K];
    } else if (champ === "registre_commerce" && typeof valeur === "string") {
      valeurAjustee = valeur.toUpperCase() as (typeof champs)[K];
    }

    setChamps((precedent) => ({ ...precedent, [champ]: valeurAjustee }));
    if (erreurs[champ as string]) {
      setErreurs((precedent) => {
        const copie = { ...precedent };
        delete copie[champ as string];
        return copie;
      });
    }
  }

  const memePays = champs.pays === (utilisateur?.pays || "CM");
  const paysActif = LISTE_PAYS.find((p) => p.code === champs.pays);
  const nomPaysChoisi =
    lang === "en" ? paysActif?.nomEn : paysActif?.nomFr || champs.pays;

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreurs({});

    const errs: Record<string, string> = {};
    if (!champs.ville.trim()) {
      errs.ville =
        lang === "en"
          ? "Store city is required."
          : "La ville du point de vente est obligatoire.";
    }
    if (!champs.adresse.trim()) {
      errs.adresse =
        lang === "en"
          ? "Store address is required."
          : "L'adresse du point de vente est obligatoire.";
    }

    if (!memePays) {
      const testNiu = validerNiu(champs.niu, lang);
      if (!testNiu.valide && testNiu.erreur) {
        errs.niu = testNiu.erreur;
      }
      const testRccm = validerRccm(champs.registre_commerce, lang);
      if (!testRccm.valide && testRccm.erreur) {
        errs.registre_commerce = testRccm.erreur;
      }
    } else {
      if (champs.niu) {
        const testNiu = validerNiu(champs.niu, lang);
        if (!testNiu.valide && testNiu.erreur) errs.niu = testNiu.erreur;
      }
      if (champs.registre_commerce) {
        const testRccm = validerRccm(champs.registre_commerce, lang);
        if (!testRccm.valide && testRccm.erreur)
          errs.registre_commerce = testRccm.erreur;
      }
    }

    if (!champs.telephone.trim()) {
      errs.telephone =
        lang === "en" ? "Phone number is required." : "Le numéro de téléphone est obligatoire.";
    }

    if (Object.keys(errs).length > 0) {
      setErreurs(errs);
      return;
    }

    setEnvoiEnCours(true);

    const formData = new FormData();
    formData.append("nom", nomEntreprise);
    formData.append("pays", champs.pays);
    formData.append("ville", champs.ville);
    formData.append("adresse", champs.adresse);
    formData.append("telephone", champs.telephone.trim());
    formData.append("devise", champs.devise);
    formData.append("active", champs.active ? "1" : "0");
    if (!memePays || champs.niu) {
      formData.append("niu", nettoyerNiu(champs.niu));
    }
    if (!memePays || champs.registre_commerce) {
      formData.append(
        "registre_commerce",
        nettoyerRccm(champs.registre_commerce),
      );
    }

    try {
      if (modification) {
        await api.put(`/boutiques/${boutique!.id}`, formData);
        toast.success(
          lang === "en" ? "Store updated." : "Boutique mise à jour.",
        );
      } else {
        await api.post("/boutiques", formData);
        toast.success(t("boutiques.boutiqueCreee"));
      }
      onSucces();
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        toast.error(e.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Dialog open={boutique !== null} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent>
        <form
          noValidate
          onSubmit={envoyer}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader>
            <DialogTitle>
              {modification
                ? lang === "en"
                  ? "Edit Store"
                  : "Modifier la boutique"
                : t("boutiques.ajouterBoutique")}
            </DialogTitle>
          </DialogHeader>

          <DialogCorps className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="b-nom">{t("auth.nomBoutique")}</Label>
              <Input
                id="b-nom"
                disabled
                value={nomEntreprise}
                className="bg-muted/50 font-medium text-foreground cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground">
                {lang === "en"
                  ? "All your stores share your enterprise name. Differentiate them with the address below."
                  : "Toutes vos boutiques portent le nom de votre entreprise. Elles sont différenciées par leur adresse."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="b-pays">
                  {lang === "en" ? "Country" : "Pays"}
                </Label>
                <SelectRecherche
                  id="b-pays"
                  options={LISTE_PAYS.map((p) => ({
                    valeur: p.code,
                    libelle: lang === "en" ? p.nomEn : p.nomFr,
                    badge: p.drapeau,
                    description: p.indicatif,
                  }))}
                  valeur={champs.pays}
                  onChange={(v) => v && modifier("pays", v)}
                  placeholder={
                    lang === "en" ? "Select country" : "Sélectionner un pays"
                  }
                  placeholderRecherche={
                    lang === "en" ? "Search country..." : "Rechercher un pays…"
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="b-devise">{t("boutiques.devise")}</Label>
                <SelectRecherche
                  id="b-devise"
                  options={DEVISES.map((d) => ({
                    valeur: d.code,
                    libelle: `${d.code} (${d.symbole})`,
                    description: lang === "en" ? d.nomEn : d.nom,
                    badge: d.symbole,
                  }))}
                  valeur={champs.devise}
                  onChange={(v) => v && modifier("devise", v)}
                  placeholder={t("boutiques.devise")}
                  placeholderRecherche={
                    lang === "en"
                      ? "Search currency..."
                      : "Rechercher une devise…"
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="b-ville">
                  {t("auth.villeBoutique")}
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                <Input
                  id="b-ville"
                  className={`h-10 ${
                    erreurs.ville
                      ? "border-destructive focus-visible:ring-destructive/30"
                      : ""
                  }`}
                  value={champs.ville}
                  onChange={(e) => modifier("ville", e.target.value)}
                  placeholder="ex: Douala"
                />
                {erreurs.ville && (
                  <p className="text-xs text-destructive">{erreurs.ville}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="b-adresse">
                  {t("boutiques.adresse")}
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                <Input
                  id="b-adresse"
                  className={`h-10 ${
                    erreurs.adresse
                      ? "border-destructive focus-visible:ring-destructive/30"
                      : ""
                  }`}
                  value={champs.adresse}
                  onChange={(e) => modifier("adresse", e.target.value)}
                  placeholder="ex: Akwa, Rue de la Joie face Total"
                />
                {erreurs.adresse && (
                  <p className="text-xs text-destructive">{erreurs.adresse}</p>
                )}
              </div>
            </div>

            {/* Identifiants légaux */}
            {memePays ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>
                    {lang === "en"
                      ? "Legal identifiers automatically inherited"
                      : "Identifiants légaux hérités de l'entreprise"}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {lang === "en"
                    ? `This store is located in your enterprise's home country (${nomPaysChoisi}). It automatically shares your enterprise NIU (${utilisateur?.niu || "—"}) and RCCM (${utilisateur?.registre_commerce || "—"}).`
                    : `Cette boutique se trouve dans le même pays que votre entreprise (${nomPaysChoisi}). Elle hérite automatiquement de votre NIU (${utilisateur?.niu || "—"}) et de votre RCCM (${utilisateur?.registre_commerce || "—"}).`}
                </p>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  {lang === "en"
                    ? `This store is located in ${nomPaysChoisi}. Please enter its local NIU and RCCM:`
                    : `Cette boutique est située en ${nomPaysChoisi}. Veuillez renseigner le NIU et le RCCM locaux :`}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="b-niu">
                      {t("auth.niuBoutique")}
                      <span className="ml-0.5 text-destructive">*</span>
                    </Label>
                    <Input
                      id="b-niu"
                      className={`h-10 font-mono uppercase ${
                        erreurs.niu
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : ""
                      }`}
                      value={champs.niu}
                      onChange={(e) => modifier("niu", e.target.value)}
                      placeholder="ex: M052012345678X"
                    />
                    {erreurs.niu && (
                      <p className="text-xs text-destructive">{erreurs.niu}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="b-rccm">
                      {t("auth.registreCommerce")}
                      <span className="ml-0.5 text-destructive">*</span>
                    </Label>
                    <Input
                      id="b-rccm"
                      className={`h-10 font-mono uppercase ${
                        erreurs.registre_commerce
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : ""
                      }`}
                      value={champs.registre_commerce}
                      onChange={(e) =>
                        modifier("registre_commerce", e.target.value)
                      }
                      placeholder="ex: RC/DLA/2023/B/1234"
                    />
                    {erreurs.registre_commerce && (
                      <p className="text-xs text-destructive">
                        {erreurs.registre_commerce}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="b-tel">
                {t("monCompte.telephone")}
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <ChampTelephone
                id="b-tel"
                valeur={champs.telephone}
                onChange={(val) => modifier("telephone", val)}
                erreur={Boolean(erreurs.telephone)}
              />
              {erreurs.telephone && (
                <p className="text-xs text-destructive">{erreurs.telephone}</p>
              )}
            </div>

            {/* Logo d'entreprise unifié */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 flex items-center gap-3">
              <LogoBoutiqueAffichage
                logoUrl={utilisateur?.logo_url}
                nom="Logo"
                taille="w-12 h-12"
              />
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-semibold text-foreground">
                  {lang === "en"
                    ? "Unified Enterprise Logo"
                    : "Logo unique de l'entreprise"}
                </p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  {lang === "en"
                    ? "All your stores share this logo on receipts and invoices. You can update it in My Account."
                    : "Toutes vos boutiques partagent ce logo sur les factures et reçus. Vous pouvez le modifier depuis Mon Compte."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="b-active"
                checked={champs.active}
                onCheckedChange={(v) => modifier("active", v)}
              />
              <Label htmlFor="b-active" className="font-normal">
                {t("boutiques.boutiqueOuverte")}
              </Label>
            </div>
          </DialogCorps>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFermer}>
              {t("commun.annuler")}
            </Button>
            <Button type="submit" disabled={envoiEnCours}>
              {envoiEnCours && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {modification
                ? t("commun.enregistrer")
                : lang === "en"
                  ? "Create store"
                  : "Créer la boutique"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
