"use client";

/** Les boutiques du propriétaire (/boutiques). */

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Store, Trash2 } from "lucide-react";
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
import { formaterTelephoneVisuel } from "@/lib/pays";
import { Switch } from "@/components/ui/switch";
import { SelectRecherche } from "@/components/ui/select-recherche";
import { SelecteurLogo } from "@/components/selecteur-logo";
import {
  nettoyerNiu,
  validerNiu,
  nettoyerRccm,
  validerRccm,
} from "@/lib/validation-legale";
import { DEVISES } from "@/lib/devises";
import type { Boutique } from "@/types";

export default function PageBoutiques() {
  const { rafraichir } = useAuth();
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
                      {boutique.logo_url ? (
                        <div className="relative w-11 h-11 rounded-lg bg-white dark:bg-neutral-800 border border-border overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={boutique.logo_url}
                            alt={boutique.nom}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Store className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{boutique.nom}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {[boutique.ville, boutique.adresse]
                            .filter(Boolean)
                            .join(" · ") || t("boutiques.adresseNonRenseignee")}
                        </p>
                      </div>
                    </div>
                    {!boutique.active && (
                      <span className="shrink-0 rounded-full bg-statut-neutre-fond px-2 py-0.5 text-xs text-statut-neutre">
                        {t("boutiques.fermee")}
                      </span>
                    )}
                  </div>

                  {boutique.niu || boutique.registre_commerce ? (
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
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
                  ) : (
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-md px-2 py-1">
                      Informations légales (NIU / RCCM) à renseigner
                    </div>
                  )}

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

function FenetreBoutique({
  boutique,
  onFermer,
  onSucces,
}: {
  boutique: Partial<Boutique> | null;
  onFermer: () => void;
  onSucces: () => void;
}) {
  const { t, lang } = useI18n();
  const modification = Boolean(boutique?.id);

  const [champs, setChamps] = useState({
    nom: "",
    ville: "",
    adresse: "",
    telephone: "",
    devise: "XAF",
    active: true,
    niu: "",
    registre_commerce: "",
  });

  const [logoFichier, setLogoFichier] = useState<File | null>(null);
  const [supprimerLogo, setSupprimerLogo] = useState(false);

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    if (!boutique) return;
    setChamps({
      nom: boutique.nom ?? "",
      ville: boutique.ville ?? "",
      adresse: boutique.adresse ?? "",
      telephone: boutique.telephone ?? "",
      devise: boutique.devise ?? "XAF",
      active: boutique.active ?? true,
      niu: boutique.niu ?? "",
      registre_commerce: boutique.registre_commerce ?? "",
    });
    setLogoFichier(null);
    setSupprimerLogo(false);
    setErreurs({});
  }, [boutique]);

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

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreurs({});

    const errs: Record<string, string> = {};
    if (!champs.nom.trim()) {
      errs.nom = t("commun.boutiqueRequise");
    }

    const testNiu = validerNiu(champs.niu, lang);
    if (!testNiu.valide && testNiu.erreur) {
      errs.niu = testNiu.erreur;
    }

    const testRccm = validerRccm(champs.registre_commerce, lang);
    if (!testRccm.valide && testRccm.erreur) {
      errs.registre_commerce = testRccm.erreur;
    }

    if (Object.keys(errs).length > 0) {
      setErreurs(errs);
      return;
    }

    setEnvoiEnCours(true);

    const formData = new FormData();
    formData.append("nom", champs.nom);
    if (champs.ville) formData.append("ville", champs.ville);
    if (champs.adresse) formData.append("adresse", champs.adresse);
    if (champs.telephone) formData.append("telephone", champs.telephone);
    formData.append("devise", champs.devise);
    formData.append("active", champs.active ? "1" : "0");
    formData.append("niu", nettoyerNiu(champs.niu));
    formData.append("registre_commerce", nettoyerRccm(champs.registre_commerce));
    if (logoFichier) {
      formData.append("logo", logoFichier);
    }
    if (supprimerLogo) {
      formData.append("supprimer_logo", "1");
    }

    try {
      if (modification) {
        await api.put(`/boutiques/${boutique!.id}`, formData);
        toast.success(lang === "en" ? "Store updated." : "Boutique mise à jour.");
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
        <form noValidate onSubmit={envoyer} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>
              {modification
                ? lang === "en"
                  ? "Edit Store"
                  : "Modifier la boutique"
                : t("boutiques.ajouterBoutique")}
            </DialogTitle>
          </DialogHeader>

          <DialogCorps>
            <div className="space-y-2">
              <Label htmlFor="b-nom">
                {t("auth.nomBoutique")}
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="b-nom"
                className={`h-10 ${erreurs.nom ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                value={champs.nom}
                onChange={(e) => modifier("nom", e.target.value)}
                placeholder="Akwa Mobile"
              />
              {erreurs.nom && (
                <p className="text-xs text-destructive">{erreurs.nom}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="b-ville">{t("auth.villeBoutique")}</Label>
                <Input
                  id="b-ville"
                  className="h-10"
                  value={champs.ville}
                  onChange={(e) => modifier("ville", e.target.value)}
                  placeholder="Douala"
                />
              </div>
              <div className="space-y-2">
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
                    lang === "en" ? "Search currency..." : "Rechercher une devise…"
                  }
                />
              </div>
            </div>

              <div className="space-y-2">
                <Label htmlFor="b-adresse">{t("boutiques.adresse")}</Label>
                <Input
                  id="b-adresse"
                  className="h-10"
                  value={champs.adresse}
                  onChange={(e) => modifier("adresse", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="b-niu">
                    {t("auth.niuBoutique")}
                    <span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  <Input
                    id="b-niu"
                    className={`h-10 font-mono uppercase ${erreurs.niu ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    value={champs.niu}
                    onChange={(e) => modifier("niu", e.target.value)}
                    placeholder="ex: M052012345678X"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "en"
                      ? "14 chars (e.g. M052012345678X or 14 digits) • M=Company, P=Individual"
                      : "14 car. (ex: M052012345678X ou 14 chiffres) • M=Société, P=Individuel"}
                  </p>
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
                    className={`h-10 font-mono uppercase ${erreurs.registre_commerce ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    value={champs.registre_commerce}
                    onChange={(e) => modifier("registre_commerce", e.target.value)}
                    onBlur={() =>
                      setChamps((p) => ({
                        ...p,
                        registre_commerce: nettoyerRccm(p.registre_commerce),
                      }))
                    }
                    placeholder="ex: RC/DLA/2023/B/1234"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {lang === "en"
                      ? "e.g. RC/DLA/2023/B/1234 • B=Company, A=Individual/ETS"
                      : "ex: RC/DLA/2023/B/1234 • B=Société, A=ETS/Individuel"}
                  </p>
                  {erreurs.registre_commerce && (
                    <p className="text-xs text-destructive">{erreurs.registre_commerce}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="b-tel">{t("monCompte.telephone")}</Label>
                <ChampTelephone
                  id="b-tel"
                  valeur={champs.telephone}
                  onChange={(val) => modifier("telephone", val)}
                />
              </div>

              <div className="pt-2 border-t border-border">
                <SelecteurLogo
                  logoActuelUrl={boutique?.logo_url}
                  fichier={logoFichier}
                  surChangementFichier={setLogoFichier}
                  supprimerLogoExistant={supprimerLogo}
                  surChangementSupprimer={setSupprimerLogo}
                  avertissementFacture={true}
                />
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
