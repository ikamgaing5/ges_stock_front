"use client";

/** Mon compte (/mon-compte) : coordonnées, mot de passe, préférences, abonnement. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, HelpCircle, Loader2, Store } from "lucide-react";
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
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!utilisateur) return;
    setNom(utilisateur.name);
    setTelephone(utilisateur.telephone ?? "");
  }, [utilisateur]);

  if (!utilisateur) return <SqueletteMonCompte />;

  async function enregistrerCoordonnees(evenement: React.FormEvent) {
    evenement.preventDefault();

    if (!nom.trim()) {
      setErreurNom(t("commun.nomRequis"));
      return;
    }
    setErreurNom(null);
    setEnregistrement(true);

    try {
      await api.put("/mon-compte", { name: nom, telephone: telephone || null });
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
                  <Label htmlFor="c-tel">{t("monCompte.telephone")}</Label>
                  <ChampTelephone
                    id="c-tel"
                    valeur={telephone}
                    onChange={setTelephone}
                  />
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

        {/* Identité légale et logos des boutiques */}
        {utilisateur.role === "proprietaire" && (
          <Apparait index={2.5}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    <span>Identité légale & Logos de vos boutiques</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs shrink-0"
                    nativeButton={false}
                    render={<Link href="/boutiques" />}
                  >
                    Gérer sur Boutiques
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Le logo, le NIU et le RCCM seront imprimés sur les factures remises à vos clients.
                </p>

                <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-muted/20 overflow-hidden">
                  {utilisateur.boutiques && utilisateur.boutiques.length > 0 ? (
                    utilisateur.boutiques.map((b) => (
                      <div key={b.id} className="flex items-center justify-between p-3 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {b.logo_url ? (
                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 border border-border shrink-0 flex items-center justify-center p-1 overflow-hidden shadow-xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={b.logo_url} alt={b.nom} className="max-h-full max-w-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                              <Store className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{b.nom}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground mt-0.5">
                              <span>
                                NIU :{" "}
                                {b.niu ? (
                                  <strong className="text-foreground">{b.niu}</strong>
                                ) : (
                                  <em className="text-amber-600 dark:text-amber-400">Non renseigné</em>
                                )}
                              </span>
                              <span>•</span>
                              <span>
                                RCCM :{" "}
                                {b.registre_commerce ? (
                                  <strong className="text-foreground">{b.registre_commerce}</strong>
                                ) : (
                                  <em className="text-amber-600 dark:text-amber-400">Non renseigné</em>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs shrink-0"
                          nativeButton={false}
                          render={<Link href="/boutiques" />}
                        >
                          Modifier
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-muted-foreground">
                      Aucune boutique enregistrée.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
