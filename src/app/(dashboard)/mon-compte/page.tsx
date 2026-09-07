"use client";

/** Mon compte (/mon-compte) : coordonnées, mot de passe, préférences, abonnement. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, CreditCard, HelpCircle, Loader2, Store } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { couleursAbonnements } from "@/lib/format";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { BasculeLangue } from "@/components/bascule-langue";
import { BasculeTheme } from "@/components/bascule-theme";
import { ChangerEmail } from "@/components/changer-email";
import { DeuxFacteurs } from "@/components/deux-facteurs";
import { Apparait, SqueletteMonCompte, TitrePage } from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChampTelephone } from "@/components/champ-telephone";
import { SelecteurDevise } from "@/components/layout/selecteur-devise";
import { SelectRecherche } from "@/components/ui/select-recherche";
import { SelecteurLogo } from "@/components/selecteur-logo";
import { LISTE_PAYS } from "@/lib/pays";
import {
  nettoyerNiu,
  validerNiu,
  nettoyerRccm,
  validerRccm,
} from "@/lib/validation-legale";
import type { Utilisateur } from "@/types";

export default function PageMonCompte() {
  const { utilisateur, rafraichir } = useAuth();
  const { t, formatDateCourte, libelleRole, libelleAbonnement, lang } = useI18n();

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [changementMdp, setChangementMdp] = useState(false);
  const [erreurNom, setErreurNom] = useState<string | null>(null);
  const [erreurTelephone, setErreurTelephone] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!utilisateur) return;
    setNom(utilisateur.name);
    setTelephone(utilisateur.telephone ?? "");
  }, [utilisateur]);

  if (!utilisateur) return <SqueletteMonCompte />;

  async function enregistrerCoordonnees(evenement: React.FormEvent) {
    evenement.preventDefault();

    let valide = true;
    if (!nom.trim()) {
      setErreurNom(t("commun.nomRequis"));
      valide = false;
    } else {
      setErreurNom(null);
    }

    if (!telephone.trim()) {
      setErreurTelephone(
        lang === "en" ? "Phone number is required." : "Le numéro de téléphone est obligatoire."
      );
      valide = false;
    } else {
      setErreurTelephone(null);
    }

    if (!valide) return;

    setEnregistrement(true);

    try {
      await api.put("/mon-compte", { name: nom, telephone: telephone.trim() });
      toast.success(t("monCompte.coordonneesMisesAJour"));
      await rafraichir();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setEnregistrement(false);
    }
  }

  async function changerMotDePasse(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreurs({});

    const errs: Record<string, string> = {};
    if (!ancien) {
      errs.mot_de_passe_actuel = t("commun.motDePasseRequis");
    }
    if (!nouveau) {
      errs.password = t("commun.motDePasseRequis");
    } else if (nouveau.length < 8) {
      errs.password =
        lang === "en" ? "8 characters minimum" : "8 caractères minimum";
    }
    if (!confirmation) {
      errs.confirmation = t("commun.confirmationRequise");
    } else if (nouveau !== confirmation) {
      errs.confirmation =
        lang === "en"
          ? "The two passwords do not match."
          : "Les deux mots de passe diffèrent.";
    }

    if (Object.keys(errs).length > 0) {
      setErreurs(errs);
      return;
    }

    setChangementMdp(true);

    try {
      await api.put("/mon-compte", {
        mot_de_passe_actuel: ancien,
        password: nouveau,
        password_confirmation: confirmation,
      });
      toast.success(t("monCompte.motDePasseMisAJour"));
      setAncien("");
      setNouveau("");
      setConfirmation("");
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        toast.error(e.resume());
      }
    } finally {
      setChangementMdp(false);
    }
  }

  const abonnement = utilisateur.abonnement;

  return (
    <div className="mx-auto max-w-2xl">
      <TitrePage
        titre={t("monCompte.titre")}
        description={`${libelleRole(utilisateur.role)} · ${utilisateur.email}`}
      />

      <div className="space-y-4 sm:space-y-6">
        {abonnement?.statut && (
          <Apparait>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("monCompte.abonnement")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    {t("monCompte.typeAbonnement")}
                  </span>
                  {abonnement.plan === "premium" || abonnement.est_premium ? (
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      {t("monCompte.planPremiumBadge")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {t("monCompte.planStandardBadge")}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    {t("commun.statut")}
                  </span>
                  <span
                    className={[
                      "rounded-full px-2.5 py-0.5 text-sm font-medium",
                      couleursAbonnements[abonnement.statut],
                    ].join(" ")}
                  >
                    {libelleAbonnement(abonnement.statut)}
                  </span>
                </div>

                {abonnement.echeance && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      {t("admin.tableauEcheance")}
                    </span>
                    <span className="text-sm font-medium">
                      {formatDateCourte(abonnement.echeance)}
                    </span>
                  </div>
                )}

                {!abonnement.utilisable && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {t("monCompte.abonnementExpire")}
                  </p>
                )}

                {/* {utilisateur?.role === "proprietaire" && (
                  <Button
                    size="sm"
                    className="w-full mt-2 font-semibold cursor-pointer"
                    nativeButton={false}
                    render={<Link href="/mon-compte/abonnement" />}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {lang === "en" ? "Manage Subscription & Plans" : "Gérer mon abonnement & forfaits"}
                  </Button>
                )} */}
              </CardContent>
            </Card>
          </Apparait>
        )}

        {/* Préférences d'affichage (Langue et Thème) */}
        <Apparait index={1}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("monCompte.preferences")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">
                    {t("monCompte.langueLabel")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("nav.changerLangue")}
                  </p>
                </div>
                <BasculeLangue afficheTexte />
              </div>

              <div className="flex items-center justify-between gap-4 border-t pt-4">
                <div>
                  <p className="text-sm font-medium">
                    {t("monCompte.themeLabel")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("nav.apparence")}
                  </p>
                </div>
                <BasculeTheme />
              </div>

              <div className="flex items-center justify-between gap-4 border-t pt-4">
                <div>
                  <p className="text-sm font-medium">
                    {t("monCompte.monnaie")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("nav.monnaie")}
                  </p>
                </div>
                <SelecteurDevise />
              </div>
            </CardContent>
          </Card>
        </Apparait>

        <Apparait index={2}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("monCompte.coordonnees")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form noValidate onSubmit={enregistrerCoordonnees} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="c-nom">{t("monCompte.nom")}</Label>
                  <Input
                    id="c-nom"
                    className={`h-10 ${erreurNom ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    value={nom}
                    onChange={(e) => {
                      setNom(e.target.value);
                      if (erreurNom) setErreurNom(null);
                    }}
                  />
                  {erreurNom && (
                    <p className="text-xs text-destructive">{erreurNom}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="c-tel">
                    {t("monCompte.telephone")}
                    <span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <ChampTelephone
                    id="c-tel"
                    valeur={telephone}
                    onChange={(val) => {
                      setTelephone(val);
                      if (erreurTelephone) setErreurTelephone(null);
                    }}
                    erreur={Boolean(erreurTelephone)}
                  />
                  {erreurTelephone && (
                    <p className="text-xs text-destructive">{erreurTelephone}</p>
                  )}
                </div>

                <Button type="submit" disabled={enregistrement}>
                  {enregistrement && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("commun.enregistrer")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Apparait>

        {/* Identité légale et logo unique de l'entreprise */}
        {utilisateur.role === "proprietaire" && (
          <Apparait index={2.5}>
            <SectionIdentiteEntreprise utilisateur={utilisateur} />
          </Apparait>
        )}

        <Apparait index={3}>
          <ChangerEmail />
        </Apparait>

        <Apparait index={4}>
          <DeuxFacteurs />
        </Apparait>

        <Apparait index={5}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("monCompte.securite")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form noValidate onSubmit={changerMotDePasse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mdp-actuel">
                    {t("monCompte.motDePasseActuel")}
                  </Label>
                  <Input
                    id="mdp-actuel"
                    type="password"
                    className={`h-10 ${erreurs.mot_de_passe_actuel ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    autoComplete="current-password"
                    value={ancien}
                    onChange={(e) => {
                      setAncien(e.target.value);
                      if (erreurs.mot_de_passe_actuel) {
                        setErreurs((prev) => ({ ...prev, mot_de_passe_actuel: "" }));
                      }
                    }}
                  />
                  {erreurs.mot_de_passe_actuel && (
                    <p className="text-xs text-destructive">
                      {erreurs.mot_de_passe_actuel}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mdp-nouveau">
                      {t("monCompte.nouveauMotDePasse")}
                    </Label>
                    <Input
                      id="mdp-nouveau"
                      type="password"
                      className={`h-10 ${erreurs.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                      autoComplete="new-password"
                      value={nouveau}
                      onChange={(e) => {
                        setNouveau(e.target.value);
                        if (erreurs.password) {
                          setErreurs((prev) => ({ ...prev, password: "" }));
                        }
                      }}
                    />
                    {erreurs.password && (
                      <p className="text-xs text-destructive">
                        {erreurs.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mdp-confirmation">
                      {t("monCompte.confirmationNouveau")}
                    </Label>
                    <Input
                      id="mdp-confirmation"
                      type="password"
                      className={`h-10 ${erreurs.confirmation ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                      autoComplete="new-password"
                      value={confirmation}
                      onChange={(e) => {
                        setConfirmation(e.target.value);
                        if (erreurs.confirmation) {
                          setErreurs((prev) => ({ ...prev, confirmation: "" }));
                        }
                      }}
                    />
                    {erreurs.confirmation && (
                      <p className="text-xs text-destructive">
                        {erreurs.confirmation}
                      </p>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={changementMdp}>
                  {changementMdp && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("monCompte.changerMotDePasse")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Apparait>

        {/* Rubrique "Avez-vous des questions ?" */}
        <Apparait index={6}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <span>{t("monCompte.questionsTitre")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("monCompte.questionsDesc")}
              </p>
              <Button
                variant="outline"
                className="gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-medium transition-all"
                nativeButton={false}
                render={<Link href="/faq" />}
              >
                <HelpCircle className="h-4 w-4" />
                {t("monCompte.questionsBouton")}
              </Button>
            </CardContent>
          </Card>
        </Apparait>
      </div>
    </div>
  );
}

function SectionIdentiteEntreprise({
  utilisateur,
}: {
  utilisateur: Utilisateur;
}) {
  const { rafraichir } = useAuth();
  const { t, lang } = useI18n();

  const [nom, setNom] = useState(utilisateur.entreprise_nom || "");
  const [pays, setPays] = useState(utilisateur.pays || "CM");
  const [niu, setNiu] = useState(utilisateur.niu || "");
  const [registreCommerce, setRegistreCommerce] = useState(
    utilisateur.registre_commerce || "",
  );
  const [logoFichier, setLogoFichier] = useState<File | null>(null);
  const [supprimerLogo, setSupprimerLogo] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  useEffect(() => {
    setNom(utilisateur.entreprise_nom || "");
    setPays(utilisateur.pays || "CM");
    setNiu(utilisateur.niu || "");
    setRegistreCommerce(utilisateur.registre_commerce || "");
    setLogoFichier(null);
    setSupprimerLogo(false);
    setErreurs({});
  }, [utilisateur]);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreurs({});

    const errs: Record<string, string> = {};
    if (!nom.trim()) {
      errs.entreprise_nom =
        lang === "en"
          ? "Enterprise name is required."
          : "Le nom de l'entreprise est obligatoire.";
    }

    const testNiu = validerNiu(niu, lang);
    if (!testNiu.valide && testNiu.erreur) errs.niu = testNiu.erreur;

    const testRccm = validerRccm(registreCommerce, lang);
    if (!testRccm.valide && testRccm.erreur)
      errs.registre_commerce = testRccm.erreur;

    if (Object.keys(errs).length > 0) {
      setErreurs(errs);
      return;
    }

    setChargement(true);
    const formData = new FormData();
    formData.append("entreprise_nom", nom);
    formData.append("pays", pays);
    formData.append("niu", nettoyerNiu(niu));
    formData.append("registre_commerce", nettoyerRccm(registreCommerce));
    if (logoFichier) {
      formData.append("logo", logoFichier);
    }
    if (supprimerLogo) {
      formData.append("supprimer_logo", "1");
    }

    try {
      await api.put("/mon-compte", formData);
      toast.success(
        lang === "en"
          ? "Enterprise identity updated."
          : "Identité de l'entreprise mise à jour.",
      );
      await rafraichir();
    } catch (err) {
      if (err instanceof ErreurApi) {
        setErreurs(err.parChamp());
        toast.error(err.resume());
      } else {
        toast.error(t("commun.erreur"));
      }
    } finally {
      setChargement(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span>
              {lang === "en"
                ? "Enterprise Identity & Unique Logo"
                : "Identité de l'entreprise & Logo unique"}
            </span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs shrink-0"
            nativeButton={false}
            render={<Link href="/boutiques" />}
          >
            {lang === "en" ? "Manage stores" : "Gérer les boutiques"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          {lang === "en"
            ? "This legal identity and logo are shared by all your points of sale in the same country and appear on your invoices/receipts."
            : "Ces informations légales et ce logo sont partagés par tous vos points de vente dans le même pays et figurent sur vos factures et reçus."}
        </p>

        <form noValidate onSubmit={enregistrer} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ent-nom">
                {lang === "en" ? "Enterprise name" : "Nom de l'entreprise"}
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="ent-nom"
                className={`h-10 ${erreurs.entreprise_nom ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                value={nom}
                onChange={(e) => {
                  setNom(e.target.value);
                  if (erreurs.entreprise_nom) {
                    setErreurs((prev) => {
                      const copy = { ...prev };
                      delete copy.entreprise_nom;
                      return copy;
                    });
                  }
                }}
                placeholder="Akwa Télécom"
              />
              {erreurs.entreprise_nom && (
                <p className="text-xs text-destructive">
                  {erreurs.entreprise_nom}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ent-pays">
                {lang === "en" ? "Home country" : "Pays principal"}
              </Label>
              <SelectRecherche
                id="ent-pays"
                options={LISTE_PAYS.map((p) => ({
                  valeur: p.code,
                  libelle: lang === "en" ? p.nomEn : p.nomFr,
                  badge: p.drapeau,
                  description: p.indicatif,
                }))}
                valeur={pays}
                onChange={(v) => {
                  if (v) {
                    setPays(v);
                    if (erreurs.pays) {
                      setErreurs((prev) => {
                        const copy = { ...prev };
                        delete copy.pays;
                        return copy;
                      });
                    }
                  }
                }}
                placeholder={
                  lang === "en" ? "Select country" : "Sélectionner un pays"
                }
                placeholderRecherche={
                  lang === "en" ? "Search country..." : "Rechercher un pays…"
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ent-niu">
                {t("auth.niuBoutique")}
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="ent-niu"
                className={`h-10 font-mono uppercase ${erreurs.niu ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                value={niu}
                onChange={(e) => {
                  setNiu(nettoyerNiu(e.target.value));
                  if (erreurs.niu) {
                    setErreurs((prev) => {
                      const copy = { ...prev };
                      delete copy.niu;
                      return copy;
                    });
                  }
                }}
                placeholder="ex: M052012345678X"
              />
              {erreurs.niu && (
                <p className="text-xs text-destructive">{erreurs.niu}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ent-rccm">
                {t("auth.registreCommerce")}
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="ent-rccm"
                className={`h-10 font-mono uppercase ${erreurs.registre_commerce ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                value={registreCommerce}
                onChange={(e) => {
                  setRegistreCommerce(e.target.value.toUpperCase());
                  if (erreurs.registre_commerce) {
                    setErreurs((prev) => {
                      const copy = { ...prev };
                      delete copy.registre_commerce;
                      return copy;
                    });
                  }
                }}
                onBlur={() =>
                  setRegistreCommerce(nettoyerRccm(registreCommerce))
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

          <div className="pt-2 border-t border-border">
            <SelecteurLogo
              logoActuelUrl={utilisateur.logo_url}
              fichier={logoFichier}
              surChangementFichier={setLogoFichier}
              supprimerLogoExistant={supprimerLogo}
              surChangementSupprimer={setSupprimerLogo}
              avertissementFacture={true}
            />
          </div>

          <Button type="submit" disabled={chargement}>
            {chargement && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("commun.enregistrer")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
