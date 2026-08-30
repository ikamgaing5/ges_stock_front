"use client";

/**
 * Changement d'adresse email, en deux temps.
 */

import { useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { ChampCode } from "@/components/champ-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DELAI_RENVOI = 60;

export function ChangerEmail() {
  const { utilisateur, rafraichir } = useAuth();
  const { t } = useI18n();

  const [ouvert, setOuvert] = useState(false);
  const [etape, setEtape] = useState<"saisie" | "code">("saisie");
  const [nouvelEmail, setNouvelEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [code, setCode] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [secondesAvantRenvoi, setSecondesAvantRenvoi] = useState(0);

  useEffect(() => {
    if (secondesAvantRenvoi <= 0) return;
    const minuteur = setTimeout(() => setSecondesAvantRenvoi((s) => s - 1), 1000);
    return () => clearTimeout(minuteur);
  }, [secondesAvantRenvoi]);

  function reinitialiser() {
    setOuvert(false);
    setEtape("saisie");
    setNouvelEmail("");
    setMotDePasse("");
    setCode("");
    setErreurs({});
  }

  async function demanderCode(evenement?: React.FormEvent) {
    evenement?.preventDefault();
    setErreurs({});

    const errs: Record<string, string> = {};
    if (!nouvelEmail.trim()) {
      errs.email = t("commun.emailRequis");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nouvelEmail.trim())) {
      errs.email = t("commun.emailInvalide");
    }
    if (!motDePasse) {
      errs.mot_de_passe_actuel = t("commun.motDePasseRequis");
    }

    if (Object.keys(errs).length > 0) {
      setErreurs(errs);
      return;
    }

    setEnvoiEnCours(true);

    try {
      await api.post("/mon-compte/email/code", {
        email: nouvelEmail,
        mot_de_passe_actuel: motDePasse,
      });

      setEtape("code");
      setSecondesAvantRenvoi(DELAI_RENVOI);
      toast.success(t("changerEmail.codeEnvoye"));
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        const reste = e.nombre("secondes_restantes");
        if (reste !== undefined) setSecondesAvantRenvoi(reste);
        toast.error(e.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function confirmer(codeSaisi: string) {
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      await api.put("/mon-compte/email", {
        email: nouvelEmail,
        code: codeSaisi,
      });

      await rafraichir();
      toast.success(t("changerEmail.emailModifie"));
      reinitialiser();
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("changerEmail.titre")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium">
              {utilisateur?.email}
            </span>
          </div>

          {!ouvert && (
            <Button variant="outline" size="sm" onClick={() => setOuvert(true)}>
              {t("commun.modifier")}
            </Button>
          )}
        </div>

        {ouvert && etape === "saisie" && (
          <form noValidate onSubmit={demanderCode} className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="nouvel-email">
                {t("changerEmail.nouvelEmail")}
              </Label>
              <Input
                id="nouvel-email"
                type="email"
                autoFocus
                className={`h-10 ${erreurs.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                value={nouvelEmail}
                onChange={(e) => {
                  setNouvelEmail(e.target.value);
                  if (erreurs.email) setErreurs((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="nouvelle@boutique.cm"
              />
              {erreurs.email && (
                <p className="text-xs text-destructive">{erreurs.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mdp-actuel-email">
                {t("changerEmail.motDePasseActuel")}
              </Label>
              <Input
                id="mdp-actuel-email"
                type="password"
                className={`h-10 ${erreurs.mot_de_passe_actuel ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                autoComplete="current-password"
                value={motDePasse}
                onChange={(e) => {
                  setMotDePasse(e.target.value);
                  if (erreurs.mot_de_passe_actuel) {
                    setErreurs((prev) => ({ ...prev, mot_de_passe_actuel: "" }));
                  }
                }}
              />
              {erreurs.mot_de_passe_actuel ? (
                <p className="text-xs text-destructive">
                  {erreurs.mot_de_passe_actuel}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("changerEmail.description")}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={envoiEnCours}>
                {envoiEnCours && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("changerEmail.envoyerCode")}
              </Button>
              <Button type="button" variant="ghost" onClick={reinitialiser}>
                {t("commun.annuler")}
              </Button>
            </div>
          </form>
        )}

        {ouvert && etape === "code" && (
          <div className="space-y-4 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              {t("changerEmail.instructionsCode", { email: nouvelEmail })}
            </p>

            <ChampCode
              valeur={code}
              onChange={setCode}
              onComplet={(c) => void confirmer(c)}
              erreur={Boolean(erreurs.code)}
            />

            {erreurs.code && (
              <p className="text-center text-xs text-destructive">
                {erreurs.code}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEtape("saisie");
                  setCode("");
                  setErreurs({});
                }}
              >
                {t("commun.modifier")}
              </Button>

              <button
                type="button"
                disabled={secondesAvantRenvoi > 0 || envoiEnCours}
                onClick={() => void demanderCode()}
                className="text-sm font-medium text-primary underline underline-offset-4 disabled:text-muted-foreground disabled:no-underline"
              >
                {secondesAvantRenvoi > 0
                  ? t("changerEmail.renvoyerDans", { secondes: secondesAvantRenvoi })
                  : t("changerEmail.renvoyerCode")}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
