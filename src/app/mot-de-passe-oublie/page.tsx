"use client";

/**
 * Mot de passe oublié (/mot-de-passe-oublie).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { api, enregistrerToken, ErreurApi } from "@/lib/api";
import { useRateLimit } from "@/lib/useRateLimit";
import { AlerteRateLimit } from "@/components/ui/alerte-rate-limit";
import { useAuth } from "@/components/auth-provider";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { ChampCode } from "@/components/champ-code";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconeTelora } from "@/components/ui/logo-telora";
import type { Utilisateur } from "@/types";

const DELAI_RENVOI = 60;

export default function PageMotDePasseOublie() {
  const router = useRouter();
  const { rafraichir } = useAuth();
  const { t, lang } = useI18n();

  const [etape, setEtape] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  // Rate limiting dynamique
  const rateLimitEmail = useRateLimit();
  const rateLimitRenvoi = useRateLimit();
  const rateLimitReset = useRateLimit();

  useEffect(() => {
    document.title = `${t("auth.motDePasseOublieTitre")} | Telora`;
  }, [lang, t]);

  async function demanderCode(evenement?: React.FormEvent) {
    evenement?.preventDefault();
    if (rateLimitEmail.estBloque || rateLimitRenvoi.estBloque || envoiEnCours) {
      return;
    }

    setErreurs({});

    if (!email.trim()) {
      setErreurs({ email: t("commun.emailRequis") });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErreurs({ email: t("commun.emailInvalide") });
      return;
    }

    setEnvoiEnCours(true);

    try {
      await api.post("/mot-de-passe/code", { email });
      setEtape("code");
      rateLimitRenvoi.demarrer(DELAI_RENVOI);
      toast.success(t("auth.codeEnvoyeEmail"));
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        const sec = e.secondesRestantes(DELAI_RENVOI);
        rateLimitEmail.demarrer(sec, e.message);
        rateLimitRenvoi.demarrer(sec, e.message);
        toast.error(e.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function reinitialiser(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (rateLimitReset.estBloque || envoiEnCours) return;

    const errs: Record<string, string> = {};
    if (!code || code.replace(/\D/g, "").length < 6) {
      errs.code = t("commun.codeRequis");
    }
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
    setEnvoiEnCours(true);

    try {
      const reponse = await api.post<{ token: string; user: Utilisateur }>(
        "/mot-de-passe/reinitialiser",
        {
          email,
          code,
          password: motDePasse,
          password_confirmation: confirmation,
        },
      );

      enregistrerToken(reponse.token);
      await rafraichir();
      toast.success(t("auth.motDePasseReinitialise"));
      router.push("/");
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        rateLimitReset.gererErreur(e);
        toast.error(e.resume());
      }
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <BasculeLangue />
        <BasculeTheme />
      </div>

      <div className="flex-1 flex items-center justify-center w-full py-8">
        <div className="anim-apparait w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          {etape === "email" ? (
            <IconeTelora size={52} />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MailCheck className="h-6 w-6" />
            </div>
          )}
          <div>
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              {etape === "email"
                ? t("auth.motDePasseOublieTitre")
                : t("auth.reinitialiserMotDePasse")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {etape === "email"
                ? t("auth.motDePasseOublieDesc")
                : t("auth.codeInstructions", { email })}
            </p>
          </div>
        </div>

        {etape === "email" ? (
          <form
            noValidate
            onSubmit={demanderCode}
            className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                autoFocus
                className={`h-10 ${erreurs.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (erreurs.email) setErreurs((prev) => ({ ...prev, email: "" }));
                }}
                placeholder={t("auth.emailPlaceholder")}
              />
              {erreurs.email && (
                <p className="text-xs text-destructive">{erreurs.email}</p>
              )}
            </div>

            {rateLimitEmail.estBloque && (
              <AlerteRateLimit
                secondes={rateLimitEmail.secondes}
                message={rateLimitEmail.message}
                compact
              />
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={envoiEnCours || rateLimitEmail.estBloque}
            >
              {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {rateLimitEmail.estBloque
                ? t("auth.reessayerDans", { secondes: rateLimitEmail.secondes })
                : t("auth.envoyerCode")}
            </Button>
          </form>
        ) : (
          <form
            noValidate
            onSubmit={reinitialiser}
            className="space-y-5 rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="space-y-2">
              <Label>{t("auth.codeVerification")}</Label>
              <ChampCode
                valeur={code}
                onChange={(c) => {
                  setCode(c);
                  if (erreurs.code) setErreurs((prev) => ({ ...prev, code: "" }));
                }}
                erreur={Boolean(erreurs.code)}
              />
              {erreurs.code && (
                <p className="text-center text-xs text-destructive">
                  {erreurs.code}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mdp">{t("auth.nouveauMotDePasse")}</Label>
              <Input
                id="mdp"
                type="password"
                className={`h-10 ${erreurs.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                autoComplete="new-password"
                value={motDePasse}
                onChange={(e) => {
                  setMotDePasse(e.target.value);
                  if (erreurs.password) setErreurs((prev) => ({ ...prev, password: "" }));
                }}
              />
              {erreurs.password ? (
                <p className="text-xs text-destructive">{erreurs.password}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("auth.huitCaracteresMin")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mdp2">{t("auth.confirmationMotDePasse")}</Label>
              <Input
                id="mdp2"
                type="password"
                className={`h-10 ${erreurs.confirmation ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                autoComplete="new-password"
                value={confirmation}
                onChange={(e) => {
                  setConfirmation(e.target.value);
                  if (erreurs.confirmation) setErreurs((prev) => ({ ...prev, confirmation: "" }));
                }}
              />
              {erreurs.confirmation && (
                <p className="text-xs text-destructive">
                  {erreurs.confirmation}
                </p>
              )}
            </div>

            {rateLimitReset.estBloque && (
              <AlerteRateLimit
                secondes={rateLimitReset.secondes}
                message={rateLimitReset.message}
                compact
              />
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={
                envoiEnCours ||
                rateLimitReset.estBloque ||
                code.replace(/\D/g, "").length < 6
              }
            >
              {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {rateLimitReset.estBloque
                ? t("auth.reessayerDans", { secondes: rateLimitReset.secondes })
                : t("monCompte.changerMotDePasse")}
            </Button>

            <div className="flex items-center justify-between gap-3 border-t pt-4 text-sm">
              <button
                type="button"
                onClick={() => {
                  setEtape("email");
                  setCode("");
                  setErreurs({});
                  rateLimitReset.arreter();
                }}
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("auth.autreEmail")}
              </button>

              <button
                type="button"
                disabled={rateLimitRenvoi.estBloque || envoiEnCours}
                onClick={() => void demanderCode()}
                className="font-medium text-primary underline underline-offset-4 disabled:text-muted-foreground disabled:no-underline"
              >
                {rateLimitRenvoi.estBloque
                  ? `${t("auth.renvoyerCode")} (${rateLimitRenvoi.secondes}s)`
                  : t("auth.renvoyerCode")}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/connexion"
            className="font-medium text-primary underline underline-offset-4"
          >
            {t("auth.retourConnexion")}
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
