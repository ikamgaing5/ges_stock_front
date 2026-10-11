"use client";

/**
 * Mot de passe oublié (/mot-de-passe-oublie).
 * Demande l'adresse e-mail et envoie un lien sécurisé valable 15 minutes.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Inbox, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useRateLimit } from "@/lib/useRateLimit";
import { AlerteRateLimit } from "@/components/ui/alerte-rate-limit";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconeTelora } from "@/components/ui/logo-telora";
import { useAntiBot } from "@/components/securite/champ-anti-bot";

const DELAI_RENVOI = 60;

export default function PageMotDePasseOublie() {
  const { t, lang } = useI18n();
  const { antiBotData, ChampAntiBot } = useAntiBot();

  const [etape, setEtape] = useState<"email" | "envoye">("email");
  const [email, setEmail] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  // Rate limiting dynamique
  const rateLimitEmail = useRateLimit();
  const rateLimitRenvoi = useRateLimit();

  useEffect(() => {
    document.title = `${t("auth.motDePasseOublieTitre")} | Telora`;
  }, [lang, t]);

  async function demanderLien(evenement?: React.FormEvent) {
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
      await api.post("/mot-de-passe/code", { email: email.trim(), ...antiBotData });
      setEtape("envoye");
      rateLimitRenvoi.demarrer(DELAI_RENVOI);
      toast.success(t("auth.lienEnvoyeEmail"));
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

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <BasculeLangue />
        <BasculeTheme />
      </div>

      <div className="flex-1 flex items-center justify-center w-full py-8">
        <div className="anim-apparait w-full max-w-md">
          {etape === "email" ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <IconeTelora size={52} />
                <div>
                  <h1 className="font-heading text-2xl font-bold tracking-tight">
                    {t("auth.motDePasseOublieTitre")}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("auth.motDePasseOublieDesc")}
                  </p>
                </div>
              </div>

              <form
                noValidate
                onSubmit={demanderLien}
                className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"
              >
                <ChampAntiBot />
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
                  className="w-full font-medium"
                  disabled={envoiEnCours || rateLimitEmail.estBloque}
                >
                  {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {rateLimitEmail.estBloque
                    ? t("auth.reessayerDans", { secondes: rateLimitEmail.secondes })
                    : envoiEnCours
                    ? t("auth.envoiLienEnCours")
                    : t("auth.envoyerLien")}
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div>
                    <h1 className="font-heading text-xl md:text-2xl font-bold tracking-tight">
                      {t("auth.emailEnvoyeTitre")}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {t("auth.emailEnvoyeDesc")}
                    </p>
                    <div className="mt-2 inline-block rounded-lg bg-muted px-3 py-1  text-sm font-semibold text-foreground">
                      {email}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl text-xs sm:text-sm">
                  <div className="flex items-start gap-2.5 text-muted-foreground">
                    <Inbox className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{t("auth.verifierSpams")}</span>
                  </div>
                </div>

                {rateLimitRenvoi.estBloque && (
                  <AlerteRateLimit
                    secondes={rateLimitRenvoi.secondes}
                    message={rateLimitRenvoi.message}
                    compact
                  />
                )}

                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={rateLimitRenvoi.estBloque || envoiEnCours}
                    onClick={() => void demanderLien()}
                  >
                    {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {rateLimitRenvoi.estBloque
                      ? t("auth.renvoyerLienDans", { secondes: rateLimitRenvoi.secondes })
                      : t("auth.renvoyerLien")}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setEtape("email");
                      setErreurs({});
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("auth.autreEmail")}
                  </Button>
                </div>
              </div>
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
