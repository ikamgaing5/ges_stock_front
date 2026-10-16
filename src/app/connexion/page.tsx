"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { ChampCode } from "@/components/champ-code";
import { api, ErreurApi } from "@/lib/api";
import { useRateLimit } from "@/lib/useRateLimit";
import { AlerteRateLimit } from "@/components/ui/alerte-rate-limit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconeTelora } from "@/components/ui/logo-telora";
import { useAntiBot } from "@/components/securite/champ-anti-bot";
import { cn } from "@/lib/utils";

/** Page de connexion (/connexion). */
export default function PageConnexion() {
  const { utilisateur, chargement, connexion, connexionDeuxFacteurs } =
    useAuth();
  const { lang, t } = useI18n();
  const { antiBotData, ChampAntiBot } = useAntiBot();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreursChamps, setErreursChamps] = useState<{
    email?: string;
    motDePasse?: string;
  }>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Rate limiting dynamique avec décompte en direct sur la vue
  const rateLimitLogin = useRateLimit({
    auDeblocage: () => {
      setErreur(null);
    },
  });

  const rateLimit2fa = useRateLimit({
    auDeblocage: () => {
      setErreur(null);
    },
  });

  // Renseigné seulement quand le compte a la double authentification.
  const [jetonDefi, setJetonDefi] = useState<string | null>(null);
  const [code, setCode] = useState("");

  // Activité suspecte (9 échecs récents consécutifs avec mot de passe trouvé)
  const [activiteSuspecte, setActiviteSuspecte] = useState(false);
  const [emailSuspect, setEmailSuspect] = useState("");
  const [renvoiEnCours, setRenvoiEnCours] = useState(false);
  const [countdownRenvoi, setCountdownRenvoi] = useState(0);
  const [messageRenvoi, setMessageRenvoi] = useState<string | null>(null);

  // Restauration de l'écran verrouillé si déjà déclenché dans la session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const emailMemorise = window.sessionStorage.getItem("telora_activite_suspecte_email");
      if (emailMemorise) {
        setActiviteSuspecte(true);
        setEmailSuspect(emailMemorise);
      }
    }
  }, []);

  // Décompte pour le bouton de renvoi d'e-mail
  useEffect(() => {
    if (countdownRenvoi <= 0) return;
    const intervalle = setInterval(() => {
      setCountdownRenvoi((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalle);
  }, [countdownRenvoi]);

  useEffect(() => {
    if (!chargement && utilisateur) {
      const params =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const retour = params?.get("retour");
      let cible = "/";

      if (
        retour &&
        retour.startsWith("/") &&
        !retour.startsWith("/connexion") &&
        !retour.startsWith("/inscription") &&
        !retour.startsWith("/mot-de-passe-oublie") &&
        !retour.startsWith("/merci")
      ) {
        if (utilisateur.role === "admin" && !retour.startsWith("/admin")) {
          cible = "/admin";
        } else if (
          utilisateur.role !== "admin" &&
          retour.startsWith("/admin")
        ) {
          cible = "/";
        } else {
          cible = retour;
        }
      } else {
        cible = utilisateur.role === "admin" ? "/admin" : "/";
      }

      if (typeof window !== "undefined") {
        window.location.replace(cible);
      }
    }
  }, [chargement, utilisateur]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("boutique_desactivee") === "1") {
        setErreur(t("auth.compteBoutiqueDesactive"));
      } else if (params.get("desactive") === "1") {
        setErreur(t("auth.compteDesactive"));
      } else if (params.get("inactivite") === "1") {
        setErreur(t("auth.sessionExpireeInactivite"));
      }
    }
  }, [t]);

  useEffect(() => {
    document.title = `${
      activiteSuspecte
        ? t("auth.activiteSuspecteTitre")
        : jetonDefi
          ? t("auth.titre2faOnglet")
          : t("auth.titreConnexionOnglet")
    } | Telora`;
  }, [lang, activiteSuspecte, jetonDefi, t]);

  useEffect(() => {
    const desktop =
      typeof window !== "undefined" && Boolean(window.teloraDesktop?.isDesktop);
    setIsDesktop(desktop);
    if (desktop) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, []);

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
      errMinuscule.includes("propriétaire de la boutique") ||
      errMinuscule.includes("proprietaire de la boutique") ||
      errMinuscule.includes("contact the store owner")
    ) {
      return t("auth.compteBoutiqueDesactive");
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
    if (rateLimitLogin.estBloque || envoiEnCours) return;

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
      const resultat = await connexion(email, motDePasse, antiBotData);

      // Le mot de passe est bon, mais il ne suffit pas : on passe à
      // l'écran du code.
      if (resultat.deuxFacteursRequis) {
        setJetonDefi(resultat.jetonDefi!);
        setEnvoiEnCours(false);
      }
    } catch (e) {
      if (e instanceof ErreurApi) {
        // Détection de l'activité suspecte (9 échecs récents avec mot de passe correct)
        if (e.donnees?.activite_suspecte) {
          const emailCible = (e.donnees.email as string) || email;
          setActiviteSuspecte(true);
          setEmailSuspect(emailCible);
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(
              "telora_activite_suspecte_email",
              emailCible,
            );
          }
          setEnvoiEnCours(false);
          setMotDePasse("");
          return;
        }

        const estRateLimite = rateLimitLogin.gererErreur(e);
        const msg = e.erreurDe("email") ?? e.message;
        setErreur(msg);

        // Vider le mot de passe si les identifiants sont incorrects
        if (
          msg.toLowerCase().includes("mot de passe incorrect") ||
          msg.toLowerCase().includes("credentials do not match") ||
          msg.toLowerCase().includes("incorrect email or password") ||
          msg.toLowerCase().includes("ces identifiants")
        ) {
          setMotDePasse("");
        }
        if (estRateLimite) {
          // Décompte activé automatiquement via rateLimitLogin
        }
      } else {
        setErreur(t("commun.erreur"));
        setMotDePasse("");
      }
      setEnvoiEnCours(false);
    }
  }

  /** Renvoyer l'email sécurisé de réinitialisation lors d'une suspicion */
  async function renvoyerEmailSecurite() {
    if (renvoiEnCours || countdownRenvoi > 0) return;
    setRenvoiEnCours(true);
    setMessageRenvoi(null);

    const emailCible = emailSuspect || email;

    try {
      await api.post("/mot-de-passe/code", { email: emailCible });
      setMessageRenvoi(t("auth.lienRenvoyeSucces"));
      setCountdownRenvoi(60);
      toast.success(t("auth.lienRenvoyeSucces"));
    } catch (e) {
      if (e instanceof ErreurApi) {
        toast.error(e.message || t("commun.erreur"));
      } else {
        toast.error(t("commun.erreur"));
      }
    } finally {
      setRenvoiEnCours(false);
    }
  }

  /** Deuxième étape : code de l'application, ou code de secours. */
  async function validerCode(codeSaisi: string) {
    if (rateLimit2fa.estBloque || envoiEnCours) return;

    setErreur(null);
    setEnvoiEnCours(true);

    try {
      await connexionDeuxFacteurs(jetonDefi!, codeSaisi);
    } catch (e) {
      if (e instanceof ErreurApi) {
        const estRateLimite = rateLimit2fa.gererErreur(e);
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
        // setMotDePasse("");
      }
      setEnvoiEnCours(false);
    }
  }

  return (
    <div
      className={cn(
        "page-connexion relative flex w-full flex-col items-center justify-center bg-muted/40",
        isDesktop
          ? "h-[calc(100dvh-var(--hauteur-barre-titre,0px))] max-h-[calc(100dvh-var(--hauteur-barre-titre,0px))] overflow-hidden select-none px-4 py-2"
          : "min-h-[100dvh] p-4",
      )}
    >
      {/* Sélecteur de langue et de thème avant même de se connecter */}
      {!isDesktop && (
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <BasculeLangue />
          <BasculeTheme />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center w-full py-1 sm:py-4">
        <div className="anim-apparait w-full max-w-sm">
          <div className="mb-4 sm:mb-6 flex flex-col items-center gap-2 sm:gap-2.5 text-center">
            {activiteSuspecte ? (
              // <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5 animate-pulse">
              //   <ShieldAlert className="h-7 w-7" />
              // </div>
              <></>
            ) : jetonDefi ? (
              // <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              //   <ShieldCheck className="h-6 w-6" />
              //   </div>
            <></>
            ) : (
              <IconeTelora size={isDesktop ? 44 : 52} />
            )}
            <div>
              <h1 className="font-heading text-xl font-semibold tracking-tight">
                {activiteSuspecte
                  ? t("auth.activiteSuspecteTitre")
                  : jetonDefi
                    ? t("auth.deuxFacteursTitre")
                    : "Telora"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {activiteSuspecte
                  ? t("auth.activiteSuspecteDesc")
                  : jetonDefi
                    ? t("auth.deuxFacteursDesc")
                    : t("auth.connexionDesc")}
              </p>
            </div>
          </div>

          {activiteSuspecte ? (
            /* ------------- Écran de sécurité : Activité suspecte détectée ------------- */
            <div className="space-y-5 rounded-2xl border border-destructive/20 bg-card p-6 shadow-lg shadow-destructive/5 anim-apparait text-center">
              <div className="rounded-xl border border-border/70 bg-muted/40 p-4 text-left space-y-2">
                <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                  {/* <Mail className="h-4 w-4 text-primary shrink-0" /> */}
                  <span className="truncate">{emailSuspect || email}</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t("auth.activiteSuspecteConsigne")}
                </p>
              </div>

              {messageRenvoi && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-left text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{messageRenvoi}</span>
                </div>
              )}

              <div className="space-y-2.5 pt-1">
                <Button
                  type="button"
                  variant="default"
                  size="lg"
                  className="w-full gap-2 font-medium"
                  disabled={renvoiEnCours || countdownRenvoi > 0}
                  onClick={renvoyerEmailSecurite}
                >
                  {renvoiEnCours && <Loader2 className="h-4 w-4 animate-spin" />}
                  {countdownRenvoi > 0
                    ? `${t("auth.renvoyerDans")} (${countdownRenvoi}s)`
                    : t("auth.renvoyerLienSecurite")}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setActiviteSuspecte(false);
                    setMotDePasse("");
                    setErreur(null);
                    if (typeof window !== "undefined") {
                      window.sessionStorage.removeItem("telora_activite_suspecte_email");
                    }
                  }}
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  {t("auth.retourConnexion")}
                </Button>
              </div>
            </div>
          ) : jetonDefi ? (
            /* ------------- Deuxième étape : le code ------------- */
            <div className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
              <ChampCode
                valeur={code}
                onChange={setCode}
                onComplet={(c) => void validerCode(c)}
                erreur={Boolean(erreur)}
              />

              {rateLimit2fa.estBloque ? (
                <AlerteRateLimit
                  secondes={rateLimit2fa.secondes}
                  message={erreur}
                  compact
                />
              ) : (
                erreur && (
                  <p
                    role="alert"
                    className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {formaterErreur(erreur)}
                  </p>
                )
              )}

              <Button
                size="lg"
                className="w-full"
                disabled={
                  envoiEnCours ||
                  rateLimit2fa.estBloque ||
                  code.replace(/\D/g, "").length < 6
                }
                onClick={() => void validerCode(code)}
              >
                {envoiEnCours && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {rateLimit2fa.estBloque
                  ? t("auth.reessayerDans", { secondes: rateLimit2fa.secondes })
                  : envoiEnCours
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
                    disabled={rateLimit2fa.estBloque}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !rateLimit2fa.estBloque) {
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
                  rateLimit2fa.arreter();
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
              className="space-y-3.5 sm:space-y-4 rounded-xl border bg-card p-5 sm:p-6 shadow-sm"
            >
              <ChampAntiBot />
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
                      setErreursChamps((prev) => ({
                        ...prev,
                        email: undefined,
                      }));
                    }
                  }}
                  placeholder={t("auth.emailPlaceholder")}
                />
                {erreursChamps.email && (
                  <p className="text-xs text-destructive">
                    {erreursChamps.email}
                  </p>
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
                      setErreursChamps((prev) => ({
                        ...prev,
                        motDePasse: undefined,
                      }));
                    }
                  }}
                />
                {erreursChamps.motDePasse && (
                  <p className="text-xs text-destructive">
                    {erreursChamps.motDePasse}
                  </p>
                )}
              </div>

              {rateLimitLogin.estBloque ? (
                <AlerteRateLimit
                  secondes={rateLimitLogin.secondes}
                  message={erreur}
                  compact
                />
              ) : (
                erreur && (
                  <p
                    role="alert"
                    className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {formaterErreur(erreur)}
                  </p>
                )
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={envoiEnCours || rateLimitLogin.estBloque}
              >
                {envoiEnCours && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {rateLimitLogin.estBloque
                  ? t("auth.reessayerDans", {
                      secondes: rateLimitLogin.secondes,
                    })
                  : envoiEnCours
                    ? t("auth.connexionEnCours")
                    : t("auth.seConnecter")}
              </Button>
            </form>
          )}

          {!jetonDefi && !activiteSuspecte && (
            <div className="mt-4 sm:mt-6 space-y-1.5 text-center text-xs sm:text-sm text-muted-foreground">
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
