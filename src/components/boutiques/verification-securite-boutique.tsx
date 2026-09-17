"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  RotateCw,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogCorps,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChampCode } from "@/components/champ-code";

type ModeAffichage = "modal" | "carte";

export function VerificationSecuriteBoutique({
  ouvert = true,
  onFermer,
  onSucces,
  mode = "modal",
}: {
  ouvert?: boolean;
  onFermer?: () => void;
  onSucces: (token: string) => void;
  mode?: ModeAffichage;
}) {
  const { t } = useI18n();
  const { utilisateur } = useAuth();

  const [methode, setMethode] = useState<"mot_de_passe" | "code">("mot_de_passe");
  const [motDePasse, setMotDePasse] = useState("");
  const [afficherMdp, setAfficherMdp] = useState(false);

  const [code, setCode] = useState("");
  const [codeDemande, setCodeDemande] = useState(false);
  const [compteARebours, setCompteARebours] = useState(0);

  const [chargementEnvoiCode, setChargementEnvoiCode] = useState(false);
  const [chargementValidation, setChargementValidation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Décompte de renvoi de code par email
  useEffect(() => {
    if (compteARebours <= 0) return;
    const timer = setInterval(() => {
      setCompteARebours((actuel) => Math.max(0, actuel - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [compteARebours]);

  async function demanderCode() {
    setErreur(null);
    setChargementEnvoiCode(true);
    try {
      const res = await api.post<{
        message: string;
        email: string;
        delai_renvoi_secondes: number;
      }>("/boutiques/demander-code");

      setCodeDemande(true);
      setCompteARebours(res.delai_renvoi_secondes || 60);
      toast.success(res.message || t("boutiques.codeEnvoyeA", { email: res.email }));
    } catch (e) {
      const msg = e instanceof ErreurApi ? e.resume() : t("commun.erreur");
      setErreur(msg);
      toast.error(msg);
    } finally {
      setChargementEnvoiCode(false);
    }
  }

  async function valider(evenement?: React.FormEvent) {
    if (evenement) evenement.preventDefault();
    setErreur(null);

    if (methode === "mot_de_passe") {
      if (!motDePasse.trim()) {
        setErreur("Veuillez saisir votre mot de passe.");
        return;
      }
    } else {
      const codeNettoye = code.replace(/\D/g, "");
      if (codeNettoye.length !== 8) {
        setErreur("Le code doit comporter 8 chiffres.");
        return;
      }
    }

    setChargementValidation(true);
    try {
      const payload =
        methode === "mot_de_passe"
          ? { methode: "mot_de_passe", mot_de_passe: motDePasse }
          : { methode: "code", code: code.replace(/\D/g, "") };

      const res = await api.post<{
        message: string;
        token_verification: string;
        expire_dans_secondes: number;
      }>("/boutiques/verifier-acces", payload);

      // Mémorisation du jeton de vérification
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("telora_boutique_token", res.token_verification);
      }

      toast.success(res.message || t("boutiques.accesDeverrouille"));
      onSucces(res.token_verification);
    } catch (e) {
      if (e instanceof ErreurApi) {
        const parChamp = e.parChamp();
        setErreur(parChamp.mot_de_passe || parChamp.code || e.resume());
      } else {
        setErreur(t("commun.erreur"));
      }
    } finally {
      setChargementValidation(false);
    }
  }

  const contenuFormulaire = (
    <div className="space-y-5">
      {/* Sélecteur de méthode (Tabs) */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-1.5 border border-border/40">
        <button
          type="button"
          onClick={() => {
            setMethode("mot_de_passe");
            setErreur(null);
          }}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            methode === "mot_de_passe"
              ? "bg-card text-foreground shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span>{t("boutiques.methodeMotDePasse")}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMethode("code");
            setErreur(null);
          }}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            methode === "code"
              ? "bg-card text-foreground shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Mail className="h-4 w-4 text-primary" />
          <span>{t("boutiques.methodeCodeEmail")}</span>
        </button>
      </div>

      {erreur && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
          <span>{erreur}</span>
        </div>
      )}

      {methode === "mot_de_passe" ? (
        <form onSubmit={valider} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verif-boutique-mot-de-passe">
              {t("boutiques.motDePasseLabel")}
            </Label>
            <div className="relative">
              <Input
                id="verif-boutique-mot-de-passe"
                type={afficherMdp ? "text" : "password"}
                placeholder={t("boutiques.motDePassePlaceholder")}
                value={motDePasse}
                onChange={(e) => {
                  setMotDePasse(e.target.value);
                  if (erreur) setErreur(null);
                }}
                autoFocus
                className="pr-10 h-11"
              />
              <button
                type="button"
                onClick={() => setAfficherMdp((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {afficherMdp ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">Afficher/Masquer le mot de passe</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Entrez le mot de passe de votre compte ({utilisateur?.email}) pour confirmer votre identité.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold"
            disabled={chargementValidation || !motDePasse.trim()}
          >
            {chargementValidation && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("boutiques.confirmerMotDePasse")}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          {codeDemande ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <span>{t("boutiques.codeEnvoyeA", { email: utilisateur?.email ?? "" })}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t("boutiques.infoValidite15Min")}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">
                    {t("boutiques.entrezCode8Chiffres")}
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setCodeDemande(false);
                      setCode("");
                      setErreur(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>{t("boutiques.retourVueEnvoi")}</span>
                  </button>
                </div>

                <ChampCode
                  valeur={code}
                  onChange={(c) => {
                    setCode(c);
                    if (erreur) setErreur(null);
                  }}
                  onComplet={() => {
                    void valider();
                  }}
                  longueur={8}
                  autoFocus
                  erreur={Boolean(erreur)}
                />

                <div className="flex items-center justify-between pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={compteARebours > 0 || chargementEnvoiCode}
                    onClick={() => void demanderCode()}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {chargementEnvoiCode ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {compteARebours > 0
                      ? t("boutiques.renvoyerCodeDans", { secondes: compteARebours })
                      : "Renvoyer un nouveau code"}
                  </Button>

                  <Button
                    type="button"
                    onClick={() => void valider()}
                    disabled={chargementValidation || code.replace(/\D/g, "").length !== 8}
                    className="h-9 px-4 text-xs font-semibold"
                  >
                    {chargementValidation ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    {t("boutiques.validerCode")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">
                      {t("boutiques.infoCodeEmailTitre")}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t("boutiques.infoCodeEmailDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/80 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Destinataire :</span>
                  <span className="font-semibold text-foreground truncate">
                    {utilisateur?.email}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span>{t("boutiques.infoValidite15Min")}</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => void demanderCode()}
                disabled={chargementEnvoiCode}
                className="w-full h-11 text-sm font-semibold shadow-sm"
              >
                {chargementEnvoiCode ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                <span>{t("boutiques.envoyerCodeBtn")}</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (mode === "carte") {
    return (
      <Card className="mx-auto max-w-lg border-border/80 shadow-md">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <h3 className="font-heading text-lg font-bold text-foreground">
              {t("boutiques.verificationRequiseTitre")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("boutiques.verificationRequiseDesc")}
            </p>
          </div>

          {contenuFormulaire}
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={ouvert} onOpenChange={(ouvert) => !ouvert && onFermer?.()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div>
              <DialogTitle className="text-base font-bold">
                {t("boutiques.verificationRequiseTitre")}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {t("boutiques.verificationRequiseDesc")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogCorps className="pt-2">
          {contenuFormulaire}
        </DialogCorps>
      </DialogContent>
    </Dialog>
  );
}
