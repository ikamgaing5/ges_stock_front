"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { ChampCode } from "@/components/champ-code";
import { ErreurApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconeTelora } from "@/components/ui/logo-telora";

/** Page de connexion (/connexion). */
export default function PageConnexion() {
  const { utilisateur, chargement, connexion, connexionDeuxFacteurs } =
    useAuth();
  const { lang, t } = useI18n();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreursChamps, setErreursChamps] = useState<{
    email?: string;
    motDePasse?: string;
  }>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  // Renseigné seulement quand le compte a la double authentification.
  const [jetonDefi, setJetonDefi] = useState<string | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!chargement && utilisateur) {
      router.replace(utilisateur.role === "admin" ? "/admin" : "/");
    }
  }, [chargement, utilisateur, router]);

  useEffect(() => {
    document.title = `${jetonDefi ? t("auth.titre2faOnglet") : t("auth.titreConnexionOnglet")} | Telora`;
  }, [lang, jetonDefi, t]);

  /** Traduit dynamiquement les messages d'erreur selon la langue sélectionnée. */
  function formaterErreur(err: string | null): string | null {
    if (!err) return null;
    const errMinuscule = err.toLowerCase();
    if (
      errMinuscule.includes("email ou mot de passe incorrect") ||
      errMinuscule.includes("ces identifiants") ||
      errMinuscule.includes("credentials do not match") ||
      errMinuscule.includes("incorrect email or password")
    ) {
      return t("auth.identifiantsIncorrects");
    }
    if (
      errMinuscule.includes("désactivé") ||
      errMinuscule.includes("desactive") ||
      errMinuscule.includes("deactivated")
    ) {
      return t("auth.compteDesactive");
    }
    if (
      errMinuscule.includes("session expirée") ||
      errMinuscule.includes("session expiree") ||
      errMinuscule.includes("session expired")
    ) {
      return t("auth.sessionExpiree");
    }
    if (
      errMinuscule.includes("code incorrect") ||
      errMinuscule.includes("incorrect code")
    ) {
      return t("auth.codeIncorrect");
    }
    if (
      /sqlstate|pdoexception|connection refused|expressément refusée|syntax error/i.test(
        err,
      )
    ) {
      return t("commun.erreur");
    }
    return err;
  }

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreur(null);

    const nouvellesErreurs: { email?: string; motDePasse?: string } = {};

    if (!email.trim()) {
      nouvellesErreurs.email = t("commun.emailRequis");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nouvellesErreurs.email = t("commun.emailInvalide");
    }

    if (!motDePasse) {
      nouvellesErreurs.motDePasse = t("commun.motDePasseRequis");
    }

    if (Object.keys(nouvellesErreurs).length > 0) {
      setErreursChamps(nouvellesErreurs);
      return;
    }

    setErreursChamps({});
    setEnvoiEnCours(true);

    try {
      const resultat = await connexion(email, motDePasse);

      // Le mot de passe est bon, mais il ne suffit pas : on passe à
      // l'écran du code.
      if (resultat.deuxFacteursRequis) {
        setJetonDefi(resultat.jetonDefi!);
        setEnvoiEnCours(false);
      }
    } catch (e) {
      if (e instanceof ErreurApi) {
        const msg = e.erreurDe("email") ?? e.message;
        setErreur(msg);
      } else {
        setErreur(t("commun.erreur"));
      }
      setEnvoiEnCours(false);
    }
  }

  /** Deuxième étape : code de l'application, ou code de secours. */
  async function validerCode(codeSaisi: string) {
    setErreur(null);
    setEnvoiEnCours(true);

    try {
      await connexionDeuxFacteurs(jetonDefi!, codeSaisi);
    } catch (e) {
      if (e instanceof ErreurApi) {
        // Le défi expire au bout de cinq minutes : il faut alors
        // ressaisir le mot de passe.
        if (e.erreurDe("jeton_defi")) {
          setJetonDefi(null);
          setCode("");
          setErreur(e.erreurDe("jeton_defi")!);
        } else {
          const msg = e.erreurDe("code") ?? e.message;
          setErreur(msg);
          setCode("");
        }
      } else {
        setErreur(t("commun.erreur"));
      }
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-muted/40 p-4">
      {/* Sélecteur de langue et de thème avant même de se connecter */}
      <div className="absolute top-4 right-4 flex items-center gap-1">
        <BasculeLangue />
        <BasculeTheme />
      </div>

      <div className="flex-1 flex items-center justify-center w-full py-8">
        <div className="anim-apparait w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            {jetonDefi ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ShieldCheck className="h-6 w-6" />
              </div>
            ) : (
              <IconeTelora size={52} />
            )}
            <div>
              <h1 className="font-heading text-xl font-semibold tracking-tight">
                {jetonDefi ? t("auth.deuxFacteursTitre") : "Telora"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {jetonDefi
                  ? t("auth.deuxFacteursDesc")
                  : t("auth.connexionDesc")}
              </p>
            </div>
          </div>

          {jetonDefi ? (
            /* ------------- Deuxième étape : le code ------------- */
            <div className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
              <ChampCode
                valeur={code}
                onChange={setCode}
                onComplet={(c) => void validerCode(c)}
                erreur={Boolean(erreur)}
              />

              {erreur && (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {formaterErreur(erreur)}
                </p>
              )}

              <Button
                size="lg"
                className="w-full"
                disabled={envoiEnCours || code.replace(/\D/g, "").length < 6}
                onClick={() => void validerCode(code)}
              >
                {envoiEnCours && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {envoiEnCours
                  ? t("commun.validerEnCours")
                  : t("commun.valider")}
              </Button>

              {/* Le champ à 6 cases n'accepte que des chiffres ; un code de
                  secours contient des lettres et a donc son propre champ. */}
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="secours" className="text-xs font-normal">
                  {t("auth.codeSecoursPrompt")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="secours"
                    className="chiffres h-10 font-mono uppercase"
                    placeholder="XXXX-XXXX"
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void validerCode(e.currentTarget.value);
                      }
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setJetonDefi(null);
                  setCode("");
                  setErreur(null);
                }}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("auth.retourConnexion")}
              </button>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={envoyer}
              className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  className={`h-10 ${erreursChamps.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (erreursChamps.email) {
                      setErreursChamps((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder={t("auth.emailPlaceholder")}
                />
                {erreursChamps.email && (
                  <p className="text-xs text-destructive">{erreursChamps.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="motdepasse">{t("auth.motDePasse")}</Label>
                  <Link
                    href="/mot-de-passe-oublie"
                    className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    {t("auth.motDePasseOublieCourt")}
                  </Link>
                </div>
                <Input
                  id="motdepasse"
                  type="password"
                  autoComplete="current-password"
                  className={`h-10 ${erreursChamps.motDePasse ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  value={motDePasse}
                  onChange={(e) => {
                    setMotDePasse(e.target.value);
                    if (erreursChamps.motDePasse) {
                      setErreursChamps((prev) => ({ ...prev, motDePasse: undefined }));
                    }
                  }}
                />
                {erreursChamps.motDePasse && (
                  <p className="text-xs text-destructive">{erreursChamps.motDePasse}</p>
                )}
              </div>

              {erreur && (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {formaterErreur(erreur)}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={envoiEnCours}
              >
                {envoiEnCours && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {envoiEnCours
                  ? t("auth.connexionEnCours")
                  : t("auth.seConnecter")}
              </Button>
            </form>
          )}

          {!jetonDefi && (
            <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
              <p>
                {t("auth.gererBoutiqueQuestion")}{" "}
                <Link
                  href="/inscription"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  {t("auth.creerCompte")}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
