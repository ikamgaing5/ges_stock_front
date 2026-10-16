"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { ChangerEmail } from "@/components/changer-email";
import { DeuxFacteurs } from "@/components/deux-facteurs";
import { Apparait, SqueletteMonCompte, TitrePage } from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PageMonCompteAdmin() {
  const { utilisateur, rafraichir } = useAuth();
  const { t } = useI18n();

  // Nom administrateur
  const [nom, setNom] = useState("");
  const [enregistrementNom, setEnregistrementNom] = useState(false);
  const [erreurNom, setErreurNom] = useState<string | null>(null);

  // Mot de passe
  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmationMdp, setConfirmationMdp] = useState("");
  const [changementMdp, setChangementMdp] = useState(false);
  const [erreursMdp, setErreursMdp] = useState<Record<string, string>>({});

  useEffect(() => {
    if (utilisateur) {
      setNom(utilisateur.name || "");
    }
  }, [utilisateur]);

  if (!utilisateur) return <SqueletteMonCompte />;

  async function enregistrerNom(e: React.FormEvent) {
    e.preventDefault();
    setErreurNom(null);

    if (!nom.trim()) {
      setErreurNom(t("monCompte.nomObligatoire"));
      return;
    }

    setEnregistrementNom(true);
    try {
      await api.put("/mon-compte", { name: nom.trim() });
      toast.success(t("monCompte.coordonneesEnregistrees"));
      await rafraichir();
    } catch (err) {
      if (err instanceof ErreurApi) {
        setErreurNom(err.message);
      } else {
        toast.error(t("commun.erreur"));
      }
    } finally {
      setEnregistrementNom(false);
    }
  }

  async function changerMotDePasse(e: React.FormEvent) {
    e.preventDefault();
    setErreursMdp({});

    const errs: Record<string, string> = {};
    if (!ancienMdp) {
      errs.mot_de_passe_actuel = t("validation.champRequis");
    }
    if (!nouveauMdp) {
      errs.password = t("validation.champRequis");
    } else if (nouveauMdp.length < 8) {
      errs.password = t("validation.motDePasseCourt");
    }
    if (nouveauMdp !== confirmationMdp) {
      errs.confirmation = t("validation.motsDePasseDifferents");
    }

    if (Object.keys(errs).length > 0) {
      setErreursMdp(errs);
      return;
    }

    setChangementMdp(true);
    try {
      await api.put("/mon-compte", {
        mot_de_passe_actuel: ancienMdp,
        password: nouveauMdp,
        password_confirmation: confirmationMdp,
      });

      toast.success(t("monCompte.motDePasseMisAJour"));
      setAncienMdp("");
      setNouveauMdp("");
      setConfirmationMdp("");
    } catch (err) {
      if (err instanceof ErreurApi) {
        setErreursMdp(err.parChamp());
        toast.error(err.resume());
      } else {
        toast.error(t("commun.erreur"));
      }
    } finally {
      setChangementMdp(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <TitrePage
        titre={t("nav.monCompte")}
        description={`${t("nav.administration")} · ${utilisateur.email}`}
      />

      {/* Profil de l'administrateur */}
      <Apparait index={0}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>{t("monCompte.coordonnees")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={enregistrerNom} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-nom">{t("monCompte.nom")}</Label>
                  <Input
                    id="admin-nom"
                    value={nom}
                    onChange={(e) => {
                      setNom(e.target.value);
                      if (erreurNom) setErreurNom(null);
                    }}
                    className={`h-10 ${erreurNom ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  />
                  {erreurNom && (
                    <p className="text-xs text-destructive">{erreurNom}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("commun.statut")}</Label>
                  <div className="flex h-10 items-center gap-2 px-3 rounded-lg border bg-muted/30 text-sm">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-foreground">
                      {t("nav.administration")}
                    </span>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={enregistrementNom}>
                {enregistrementNom && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("commun.enregistrer")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Apparait>

      {/* Changement d'adresse e-mail */}
      <Apparait index={1}>
        <ChangerEmail />
      </Apparait>

      {/* Changement de mot de passe */}
      <Apparait index={2}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("monCompte.securite")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form noValidate onSubmit={changerMotDePasse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-mdp-actuel">
                  {t("monCompte.motDePasseActuel")}
                </Label>
                <Input
                  id="admin-mdp-actuel"
                  type="password"
                  className={`h-10 ${erreursMdp.mot_de_passe_actuel ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  autoComplete="current-password"
                  value={ancienMdp}
                  onChange={(e) => {
                    setAncienMdp(e.target.value);
                    if (erreursMdp.mot_de_passe_actuel) {
                      setErreursMdp((prev) => ({
                        ...prev,
                        mot_de_passe_actuel: "",
                      }));
                    }
                  }}
                />
                {erreursMdp.mot_de_passe_actuel && (
                  <p className="text-xs text-destructive">
                    {erreursMdp.mot_de_passe_actuel}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="admin-mdp-nouveau">
                    {t("monCompte.nouveauMotDePasse")}
                  </Label>
                  <Input
                    id="admin-mdp-nouveau"
                    type="password"
                    className={`h-10 ${erreursMdp.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    autoComplete="new-password"
                    value={nouveauMdp}
                    onChange={(e) => {
                      setNouveauMdp(e.target.value);
                      if (erreursMdp.password) {
                        setErreursMdp((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                  />
                  {erreursMdp.password && (
                    <p className="text-xs text-destructive">
                      {erreursMdp.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-mdp-conf">
                    {t("monCompte.confirmationNouveau")}
                  </Label>
                  <Input
                    id="admin-mdp-conf"
                    type="password"
                    className={`h-10 ${erreursMdp.confirmation ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    autoComplete="new-password"
                    value={confirmationMdp}
                    onChange={(e) => {
                      setConfirmationMdp(e.target.value);
                      if (erreursMdp.confirmation) {
                        setErreursMdp((prev) => ({ ...prev, confirmation: "" }));
                      }
                    }}
                  />
                  {erreursMdp.confirmation && (
                    <p className="text-xs text-destructive">
                      {erreursMdp.confirmation}
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

      {/* Double authentification (2FA) */}
      <Apparait index={3}>
        <DeuxFacteurs />
      </Apparait>
    </div>
  );
}
