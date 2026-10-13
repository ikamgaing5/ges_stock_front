"use client";

/**
 * Réinitialisation du mot de passe via lien sécurisé (/mot-de-passe-oublie/reinitialiser).
 * Valide le token de 15 minutes avant d'autoriser la saisie du nouveau mot de passe.
 */

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { api, enregistrerToken, ErreurApi } from "@/lib/api";
import { useRateLimit } from "@/lib/useRateLimit";
import { AlerteRateLimit } from "@/components/ui/alerte-rate-limit";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { useI18n } from "@/lib/i18n";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconeTelora } from "@/components/ui/logo-telora";
import { useAntiBot } from "@/components/securite/champ-anti-bot";
import type { Utilisateur } from "@/types";

function ContenuReinitialisation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useI18n();
  const { antiBotData, ChampAntiBot } = useAntiBot();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [statut, setStatut] = useState<"chargement" | "valide" | "invalide" | "succes">(
    "chargement",
  );
  const [messageErreur, setMessageErreur] = useState<string>("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [afficherConfirmation, setAfficherConfirmation] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [soumissionEnCours, setSoumissionEnCours] = useState(false);

  const rateLimit = useRateLimit();

  useEffect(() => {
    document.title = `${t("auth.nouveauMotDePasseTitre")} | Telora`;
  }, [lang, t]);

  // Vérifier la validité du token dès le chargement de la page
  useEffect(() => {
    let estMonte = true;

    async function verifierToken() {
      if (!token || !email) {
        if (estMonte) {
          setStatut("invalide");
          setMessageErreur(t("auth.lienExpireOuInvalide"));
        }
        return;
      }

      try {
        await api.post("/mot-de-passe/verifier-token", { email, token });
        if (estMonte) {
          setStatut("valide");
        }
      } catch (e) {
        if (estMonte) {
          setStatut("invalide");
          if (e instanceof ErreurApi) {
            setMessageErreur(e.message || t("auth.lienExpireOuInvalide"));
          } else {
            setMessageErreur(t("auth.lienExpireOuInvalide"));
          }
        }
      }
    }

    void verifierToken();

    return () => {
      estMonte = false;
    };
  }, [email, token, t]);

  // Évaluation de la force du mot de passe
  const forceMdp = useMemo(() => {
    const p = motDePasse;
    if (!p) return { score: 0, label: "", couleur: "bg-muted" };

    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) {
      return {
        score: 1,
        label: t("auth.tropFaible"),
        couleur: "bg-rose-500",
      };
    }
    if (score === 2) {
      return {
        score: 2,
        label: t("auth.moyen"),
        couleur: "bg-amber-500",
      };
    }
    if (score === 3) {
      return {
        score: 3,
        label: t("auth.bon"),
        couleur: "bg-blue-500",
      };
    }
    return {
      score: 4,
      label: t("auth.solide"),
      couleur: "bg-emerald-500",
    };
  }, [motDePasse, t]);

  async function reinitialiser(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (rateLimit.estBloque || soumissionEnCours) return;

    const errs: Record<string, string> = {};
    if (!motDePasse) {
      errs.password = t("commun.motDePasseRequis");
    } else if (motDePasse.length < 8) {
      errs.password =
        lang === "en"
          ? "Password must be at least 8 characters long."
          : "Le mot de passe doit comporter au moins 8 caractères.";
    }

    if (!confirmation) {
      errs.confirmation = t("commun.confirmationRequise");
    } else if (motDePasse !== confirmation) {
      errs.confirmation = t("auth.motsDePasseDifferents");
    }

    if (Object.keys(errs).length > 0) {
      setErreurs(errs);
      return;
    }

    setErreurs({});
    setSoumissionEnCours(true);

    try {
      const reponse = await api.post<{
        message: string;
        token?: string;
        user?: Utilisateur;
      }>("/mot-de-passe/reinitialiser", {
        email,
        token,
        password: motDePasse,
        password_confirmation: confirmation,
        ...antiBotData,
      });

      if (reponse.token) {
        enregistrerToken(reponse.token);
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("telora_activite_suspecte_email");
      }

      setStatut("succes");
      toast.success(t("auth.motDePasseReinitialiseSucces"));

      // Redirection automatique après 2 secondes
      setTimeout(() => {
        if (typeof window !== "undefined") {
          if (reponse.token && reponse.user) {
            window.location.replace(reponse.user.role === "admin" ? "/admin" : "/");
          } else {
            router.push("/connexion");
          }
        }
      }, 1800);
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        rateLimit.gererErreur(e);
        toast.error(e.resume());
      }
      setSoumissionEnCours(false);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <BasculeLangue />
        <BasculeTheme />
      </div>

      <div className="flex-1 flex items-center justify-center w-full py-8">
        <div className="anim-apparait w-full max-w-md">
          {statut === "chargement" && (
            <div className="rounded-2xl border bg-card p-8 shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-semibold">
                  {t("auth.verificationLienEnCours")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("commun.chargementEnCours")}
                </p>
              </div>
            </div>
          )}

          {statut === "invalide" && (
            <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-inner">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-destructive">
                    {t("auth.lienExpireOuInvalide")}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {messageErreur ||
                      (lang === "en"
                        ? "For security reasons, reset links expire after 15 minutes and can only be used once."
                        : "Pour des raisons de sécurité, les liens de réinitialisation expirent au bout de 15 minutes et ne peuvent être utilisés qu'une seule fois.")}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/mot-de-passe-oublie"
                  className={buttonVariants({ size: "lg", className: "w-full" })}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t("auth.faireNouvelleDemande")}
                </Link>

                <Link
                  href="/connexion"
                  className={buttonVariants({ variant: "outline", className: "w-full" })}
                >
                  {t("auth.retourConnexion")}
                </Link>
              </div>
            </div>
          )}

          {statut === "valide" && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                  <KeyRound className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="font-heading text-2xl font-bold tracking-tight">
                    {t("auth.nouveauMotDePasseTitre")}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("auth.nouveauMotDePasseDesc")}
                  </p>
                  {email && (
                    <div className="mt-2 inline-block rounded-md bg-muted px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                      {email}
                    </div>
                  )}
                </div>
              </div>

              <form
                noValidate
                onSubmit={reinitialiser}
                className="space-y-5 rounded-2xl border bg-card p-6 md:p-8 shadow-sm"
              >
                <ChampAntiBot />

                {/* Champ Nouveau mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="mdp">{t("auth.nouveauMotDePasse")}</Label>
                  <div className="relative">
                    <Input
                      id="mdp"
                      type={afficherMdp ? "text" : "password"}
                      autoFocus
                      className={`h-10 pr-10 ${erreurs.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                      autoComplete="new-password"
                      value={motDePasse}
                      onChange={(e) => {
                        setMotDePasse(e.target.value);
                        if (erreurs.password) setErreurs((prev) => ({ ...prev, password: "" }));
                      }}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setAfficherMdp((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {afficherMdp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {erreurs.password ? (
                    <p className="text-xs text-destructive">{erreurs.password}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {t("auth.huitCaracteresMin")}
                    </p>
                  )}

                  {/* Indicateur visuel de force */}
                  {motDePasse.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex gap-1.5 h-1.5">
                        {[1, 2, 3, 4].map((index) => (
                          <div
                            key={index}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              index <= forceMdp.score ? forceMdp.couleur : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Force : {forceMdp.label}</span>
                        <span>Min. 8 caractères</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Champ Confirmation du mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="mdp2">{t("auth.confirmationMotDePasse")}</Label>
                  <div className="relative">
                    <Input
                      id="mdp2"
                      type={afficherConfirmation ? "text" : "password"}
                      className={`h-10 pr-10 ${erreurs.confirmation ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                      autoComplete="new-password"
                      value={confirmation}
                      onChange={(e) => {
                        setConfirmation(e.target.value);
                        if (erreurs.confirmation)
                          setErreurs((prev) => ({ ...prev, confirmation: "" }));
                      }}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setAfficherConfirmation((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {afficherConfirmation ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {erreurs.confirmation && (
                    <p className="text-xs text-destructive">{erreurs.confirmation}</p>
                  )}
                </div>

                {rateLimit.estBloque && (
                  <AlerteRateLimit
                    secondes={rateLimit.secondes}
                    message={rateLimit.message}
                    compact
                  />
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-medium"
                  disabled={soumissionEnCours || rateLimit.estBloque}
                >
                  {soumissionEnCours ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("auth.reinitialiserEnCours")}
                    </>
                  ) : rateLimit.estBloque ? (
                    t("auth.reessayerDans", { secondes: rateLimit.secondes })
                  ) : (
                    t("monCompte.changerMotDePasse")
                  )}
                </Button>
              </form>
            </div>
          )}

          {statut === "succes" && (
            <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-inner mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h1 className="font-heading text-xl md:text-2xl font-bold tracking-tight">
                  {t("auth.motDePasseReinitialiseSucces")}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {lang === "en"
                    ? "Your password has been securely updated. Redirecting you..."
                    : "Votre mot de passe a été mis à jour avec succès. Redirection en cours..."}
                </p>
              </div>
              <Link
                href="/"
                className={buttonVariants({ size: "lg", className: "w-full" })}
              >
                {lang === "en" ? "Continue to Telora" : "Continuer vers Telora"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href="/connexion"
              className="font-medium text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              {t("auth.retourConnexion")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PageReinitialiserMotDePasse() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-muted/40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ContenuReinitialisation />
    </Suspense>
  );
}
