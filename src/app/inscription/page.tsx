"use client";

/**
 * Inscription d'un propriétaire de boutique (/inscription).
 *
 * Le parcours tient en deux étapes : les coordonnées et la boutique, puis le
 * code à 6 chiffres reçu par email. Les erreurs de validation s'affichent sous
 * le champ concerné, pas dans une alerte. À partir de lg, un panneau de marque
 * fixe occupe la colonne de gauche.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  MailCheck,
  Store,
  User,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi, enregistrerToken } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { ChampCode } from "@/components/champ-code";
import { ChampTelephone } from "@/components/champ-telephone";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconeTelora } from "@/components/ui/logo-telora";
import type { Utilisateur } from "@/types";

/** Délai imposé par le serveur entre deux envois de code, en secondes. */
const DELAI_RENVOI = 60;

export default function PageInscription() {
  const router = useRouter();
  const { rafraichir } = useAuth();
  const { t, lang } = useI18n();

  const [etape, setEtape] = useState<"formulaire" | "code">("formulaire");

  const [champs, setChamps] = useState({
    name: "",
    email: "",
    telephone: "",
    password: "",
    password_confirmation: "",
    boutique_nom: "",
    boutique_ville: "",
  });

  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [afficherConfirmation, setAfficherConfirmation] = useState(false);

  const [code, setCode] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGenerale, setErreurGenerale] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [secondesAvantRenvoi, setSecondesAvantRenvoi] = useState(0);

  function modifier(champ: keyof typeof champs, valeur: string) {
    setChamps((precedent) => ({ ...precedent, [champ]: valeur }));
    if (erreurs[champ]) {
      setErreurs((precedent) => {
        const copie = { ...precedent };
        delete copie[champ];
        return copie;
      });
    }
  }

  // Score de robustesse du mot de passe, de 0 (vide) à 4.
  const forceMotDePasse = useMemo(() => {
    const p = champs.password;
    if (!p) return { score: 0, label: "", couleur: "bg-muted" };
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) {
      return {
        score: 1,
        label: lang === "en" ? "Too weak" : "Trop faible",
        couleur: "bg-rose-500",
      };
    }
    if (score === 2) {
      return {
        score: 2,
        label: lang === "en" ? "Fair" : "Moyen",
        couleur: "bg-amber-500",
      };
    }
    if (score === 3) {
      return {
        score: 3,
        label: lang === "en" ? "Good" : "Bon",
        couleur: "bg-blue-500",
      };
    }
    return {
      score: 4,
      label: lang === "en" ? "Strong" : "Solide",
      couleur: "bg-emerald-500",
    };
  }, [champs.password, lang]);

  // Compte à rebours du bouton « Renvoyer le code »
  useEffect(() => {
    if (secondesAvantRenvoi <= 0) return;
    const minuteur = setTimeout(
      () => setSecondesAvantRenvoi((s) => s - 1),
      1000,
    );
    return () => clearTimeout(minuteur);
  }, [secondesAvantRenvoi]);

  /** Étape 1 : vérification des coordonnées et envoi du code */
  async function demanderCode(evenement: React.FormEvent) {
    evenement.preventDefault();

    const errs: Record<string, string> = {};

    if (!champs.name.trim()) {
      errs.name =
        lang === "en"
          ? "Enter your name."
          : "Indiquez votre nom.";
    }

    if (!champs.email.trim()) {
      errs.email =
        lang === "en"
          ? "Please enter your email address."
          : "Votre adresse email est nécessaire pour recevoir votre code.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(champs.email.trim())) {
      errs.email =
        lang === "en"
          ? "Check this address, for example name@domain.com."
          : "Il manque quelque chose dans cette adresse, par exemple nom@domaine.com.";
    }

    if (!champs.password) {
      errs.password =
        lang === "en"
          ? "Choose a password to protect your account."
          : "Choisissez un mot de passe pour protéger l'accès à votre boutique.";
    } else if (champs.password.length < 8) {
      errs.password =
        lang === "en"
          ? "Use at least 8 characters."
          : "Il faut au moins 8 caractères.";
    }

    if (!champs.password_confirmation) {
      errs.password_confirmation =
        lang === "en"
          ? "Type the password again to confirm."
          : "Retapez le mot de passe pour confirmer.";
    } else if (champs.password !== champs.password_confirmation) {
      errs.password_confirmation =
        lang === "en"
          ? "The two passwords do not match."
          : "Les deux mots de passe sont différents.";
    }

    if (!champs.boutique_nom.trim()) {
      errs.boutique_nom =
        lang === "en"
          ? "Enter your store name."
          : "Indiquez le nom de votre boutique.";
    }

    if (Object.keys(errs).length > 0) {
      setErreurs(errs);
      return;
    }

    setErreurs({});
    setErreurGenerale(null);
    setEnvoiEnCours(true);

    try {
      await api.post("/inscription/code", {
        email: champs.email,
        name: champs.name,
      });

      setEtape("code");
      setSecondesAvantRenvoi(DELAI_RENVOI);
      toast.success(
        lang === "en"
          ? "We sent a 6-digit code to your email."
          : "Nous vous avons envoyé un code à 6 chiffres par email.",
      );
    } catch (e) {
      if (e instanceof ErreurApi) {
        const parChamp = e.parChamp();
        setErreurs(parChamp);
        if (Object.keys(parChamp).length === 0) setErreurGenerale(e.message);
      } else {
        setErreurGenerale(t("commun.erreur"));
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  /** Étape 2 : validation du code et création du compte */
  const creerLeCompte = useCallback(
    async (codeSaisi: string) => {
      setErreurs({});
      setErreurGenerale(null);
      setEnvoiEnCours(true);

      try {
        const reponse = await api.post<{ token: string; user: Utilisateur }>(
          "/inscription",
          { ...champs, code: codeSaisi },
        );

        enregistrerToken(reponse.token);
        await rafraichir();
        router.push("/merci");
      } catch (e) {
        if (e instanceof ErreurApi) {
          const parChamp = e.parChamp();
          setErreurs(parChamp);

          const horsCode = Object.keys(parChamp).filter((c) => c !== "code");
          if (horsCode.length > 0) {
            setEtape("formulaire");
            toast.error(parChamp[horsCode[0]]);
          }
        } else {
          setErreurGenerale(t("commun.erreur"));
        }
        setEnvoiEnCours(false);
      }
    },
    [champs, rafraichir, router, t],
  );

  async function renvoyerCode() {
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      await api.post("/inscription/code", {
        email: champs.email,
        name: champs.name,
      });
      setCode("");
      setSecondesAvantRenvoi(DELAI_RENVOI);
      toast.success(
        lang === "en"
          ? "We just sent you a new code."
          : "Nous venons de vous envoyer un nouveau code.",
      );
    } catch (e) {
      if (e instanceof ErreurApi) {
        toast.error(e.resume());
        const reste = e.nombre("secondes_restantes");
        if (reste !== undefined) setSecondesAvantRenvoi(reste);
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1.05fr_1.2fr]">
      {/* ------------------------------------------------------------- */}
      {/* Colonne de gauche : argumentaire et aperçu de la boutique     */}
      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* Colonne de gauche : panneau de marque, masque sous lg          */}
      {/* ------------------------------------------------------------- */}
      {/* Le formulaire est plus haut que l'écran : le panneau reste collé en
          haut sur toute la hauteur du viewport pendant que la colonne de
          droite défile. `self-start` est indispensable, sinon la grille
          étire l'aside et `sticky` n'a plus de course. */}
      <aside className="hidden flex-col justify-between bg-[#16223c] p-10 text-white lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:self-start xl:p-14">
        <div className="flex items-center gap-3">
          <IconeTelora size={32} />
          <span className="font-heading text-xl font-bold tracking-tight">
            TELORA
          </span>
        </div>

        <div className="max-w-md space-y-8">
          <div className="space-y-4">
            <h1 className="font-heading text-3xl font-semibold leading-[1.15] tracking-tight xl:text-4xl">
              {lang === "en"
                ? "Every phone accounted for, from the box to the sale."
                : "Chaque téléphone à sa place, du carton à la vente."}
            </h1>
            <p className="text-base leading-relaxed text-white/70">
              {lang === "en"
                ? "You scan the IMEI when the box arrives. Your staff sell without seeing your purchase prices. At closing, your till is already worked out."
                : "Vous scannez l'IMEI à la réception. Vos vendeuses encaissent sans voir vos prix d'achat. Le soir, votre caisse est déjà calculée."}
            </p>
          </div>

          {/* <figure className="border-t border-white/10 pt-8">
            <blockquote className="text-sm italic leading-relaxed text-white/75">
              {lang === "en"
                ? "I used to spend my Sundays recounting boxes. Now closing up takes ten minutes."
                : "Avant, je passais mes dimanches à recompter les cartons. Maintenant la fermeture me prend dix minutes."}
            </blockquote>
            <figcaption className="mt-3 text-xs text-white/55">
              {lang === "en"
                ? "Ibrahim K., shop owner in Douala"
                : "Ibrahim K., commerçant à Douala"}
            </figcaption>
          </figure> */}
        </div>

        <p className="text-xs text-white/55">
          {lang === "en"
            ? "Your data is encrypted and visible only to you."
            : "Vos données sont chiffrées et visibles par vous seul."}
        </p>
      </aside>

      {/* Bascules langue et thème fixes au défilement */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1.5 rounded-full border bg-background/85 p-1 shadow-sm backdrop-blur-md">
        <BasculeLangue />
        <BasculeTheme />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Colonne de droite : formulaire                                */}
      {/* ------------------------------------------------------------- */}
      <main className="relative flex min-h-[100dvh] flex-col items-center justify-center p-4 sm:p-8 lg:p-12">
        {/* Logo Telora pour mobile uniquement */}
        <div className="mb-6 flex items-center gap-2.5 lg:hidden">
          <IconeTelora size={32} />
          <span className="font-heading text-lg font-bold tracking-tight">
            TELORA
          </span>
        </div>

        {/* ------------------- Étape 1 : Formulaire ------------------- */}
        {etape === "formulaire" ? (
          <div className="anim-apparait w-full max-w-lg space-y-6">
            {/* Progression */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {lang === "en"
                    ? "Step 1 of 2: you and your store"
                    : "Étape 1 sur 2 : vous et votre boutique"}
                </span>
                <span>50%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-1/2 rounded-full bg-primary transition-all duration-300" />
              </div>
            </div>

            {/* Titre et accroche */}
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {lang === "en" ? "Welcome to Telora" : "Bienvenue sur Telora"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {lang === "en"
                  ? "It takes about 2 minutes. You can scan your first phones straight after."
                  : "Comptez 2 minutes. Vous pourrez enregistrer vos premiers téléphones dans la foulée."}
              </p>
            </div>

            {/* Message d'erreur générale éventuel */}
            {erreurGenerale && (
              <div
                role="alert"
                className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive"
              >
                <div className="h-2 w-2 shrink-0 rounded-full bg-destructive" />
                <span>{erreurGenerale}</span>
              </div>
            )}

            <form noValidate onSubmit={demanderCode} className="space-y-5">
              {/* SECTION 1 : VOUS */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-5 shadow-xs backdrop-blur-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                  <User className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {lang === "en" ? "1. You (store owner)" : "1. Vous (le propriétaire)"}
                  </h3>
                </div>

                <Champ
                  label={t("auth.nomComplet")}
                  erreur={erreurs.name}
                  obligatoire
                >
                  <Input
                    className={`h-10 ${
                      erreurs.name
                        ? "border-destructive focus-visible:ring-destructive/30"
                        : ""
                    }`}
                    autoComplete="name"
                    value={champs.name}
                    onChange={(e) => modifier("name", e.target.value)}
                    placeholder={
                      lang === "en" ? "e.g. David Miller" : "ex: Moussa Traoré"
                    }
                  />
                </Champ>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ
                    label={t("auth.email")}
                    erreur={erreurs.email}
                    aide={
                      lang === "en"
                        ? "We send your activation code here"
                        : "Nous y enverrons votre code d'activation"
                    }
                    obligatoire
                  >
                    <Input
                      type="email"
                      className={`h-10 ${
                        erreurs.email
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : ""
                      }`}
                      autoComplete="username"
                      value={champs.email}
                      onChange={(e) => modifier("email", e.target.value)}
                      placeholder={t("auth.emailPlaceholder")}
                    />
                  </Champ>

                  <Champ
                    label={
                      lang === "en"
                        ? "Phone number (WhatsApp / Mobile)"
                        : "Numéro de téléphone (WhatsApp / mobile)"
                    }
                    erreur={erreurs.telephone}
                    aide={
                      lang === "en"
                        ? "To secure your account"
                        : "Pour sécuriser votre compte"
                    }
                  >
                    <ChampTelephone
                      autoComplete="tel"
                      valeur={champs.telephone}
                      onChange={(val) => modifier("telephone", val)}
                      erreur={Boolean(erreurs.telephone)}
                    />
                  </Champ>
                </div>
              </div>

              {/* SECTION 2 : MOT DE PASSE */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-5 shadow-xs backdrop-blur-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                  <Lock className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {lang === "en" ? "2. Your password" : "2. Votre mot de passe"}
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ
                    label={
                      lang === "en"
                        ? "Choose a secure password"
                        : "Choisissez votre mot de passe"
                    }
                    erreur={erreurs.password}
                    obligatoire
                  >
                    <div className="relative">
                      <Input
                        type={afficherMotDePasse ? "text" : "password"}
                        className={`h-10 pr-10 ${
                          erreurs.password
                            ? "border-destructive focus-visible:ring-destructive/30"
                            : ""
                        }`}
                        autoComplete="new-password"
                        value={champs.password}
                        onChange={(e) => modifier("password", e.target.value)}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAfficherMotDePasse(!afficherMotDePasse)
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                        aria-label={
                          afficherMotDePasse
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                      >
                        {afficherMotDePasse ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Jauge de robustesse */}
                    {champs.password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex h-1.5 w-full gap-1">
                          {[1, 2, 3, 4].map((barre) => (
                            <div
                              key={barre}
                              className={`h-full flex-1 rounded-full transition-all duration-300 ${
                                barre <= forceMotDePasse.score
                                  ? forceMotDePasse.couleur
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground flex justify-between">
                          <span>
                            {lang === "en" ? "Security: " : "Sécurité : "}
                            <span className="font-medium text-foreground">
                              {forceMotDePasse.label}
                            </span>
                          </span>
                          <span>8+ car.</span>
                        </p>
                      </div>
                    )}
                  </Champ>

                  <Champ
                    label={
                      lang === "en"
                        ? "Confirm your password"
                        : "Confirmez le mot de passe"
                    }
                    erreur={erreurs.password_confirmation}
                    obligatoire
                  >
                    <div className="relative">
                      <Input
                        type={afficherConfirmation ? "text" : "password"}
                        className={`h-10 pr-10 ${
                          erreurs.password_confirmation
                            ? "border-destructive focus-visible:ring-destructive/30"
                            : ""
                        }`}
                        autoComplete="new-password"
                        value={champs.password_confirmation}
                        onChange={(e) =>
                          modifier("password_confirmation", e.target.value)
                        }
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAfficherConfirmation(!afficherConfirmation)
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                        aria-label={
                          afficherConfirmation
                            ? "Masquer la confirmation"
                            : "Afficher la confirmation"
                        }
                      >
                        {afficherConfirmation ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {champs.password &&
                      champs.password_confirmation &&
                      champs.password === champs.password_confirmation && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {lang === "en"
                            ? "Both passwords match"
                            : "Les deux mots de passe sont identiques"}
                        </p>
                      )}
                  </Champ>
                </div>
              </div>

              {/* SECTION 3 : PREMIÈRE BOUTIQUE */}
              <div className="rounded-2xl border border-border/80 bg-card/60 p-5 shadow-xs backdrop-blur-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                  <Store className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {lang === "en"
                      ? "3. Your store"
                      : "3. Votre point de vente"}
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ
                    label={
                      lang === "en"
                        ? "Store name"
                        : "Nom de votre boutique"
                    }
                    erreur={erreurs.boutique_nom}
                    aide={
                      lang === "en"
                        ? "The name your customers and staff know"
                        : "Le nom que vos clients et vendeuses connaissent"
                    }
                    obligatoire
                  >
                    <Input
                      className={`h-10 ${
                        erreurs.boutique_nom
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : ""
                      }`}
                      value={champs.boutique_nom}
                      onChange={(e) => modifier("boutique_nom", e.target.value)}
                      placeholder="ex: Akwa Télécom, Plateau Mobile..."
                    />
                  </Champ>

                  <Champ
                    label={t("auth.villeBoutique")}
                    erreur={erreurs.boutique_ville}
                    aide={
                      lang === "en"
                        ? "Where is this store located?"
                        : "Où se situe cette première boutique ?"
                    }
                  >
                    <Input
                      className="h-10"
                      value={champs.boutique_ville}
                      onChange={(e) =>
                        modifier("boutique_ville", e.target.value)
                      }
                      placeholder="ex: Douala, Abidjan, Dakar, Paris..."
                    />
                  </Champ>
                </div>
              </div>

              {/* Bouton de soumission */}
              <div className="space-y-3 pt-1">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base font-semibold shadow-md transition-all hover:shadow-lg cursor-pointer"
                  disabled={envoiEnCours}
                >
                  {envoiEnCours ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {lang === "en"
                        ? "Sending your code…"
                        : "Envoi de votre code en cours…"}
                    </>
                  ) : (
                    <>
                      <span>
                        {lang === "en"
                          ? "Create my store & receive my code"
                          : "Créer ma boutique et recevoir mon code"}
                      </span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  {lang === "en"
                    ? "Free for 14 days, no card required."
                    : "Essai gratuit de 14 jours, sans carte bancaire."}
                </p>
              </div>
            </form>

            <div className="pt-2 text-center text-sm text-muted-foreground border-t border-border/60">
              {t("auth.dejaCompte")}{" "}
              <Link
                href="/connexion"
                className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                {t("auth.seConnecter")}
              </Link>
            </div>
          </div>
        ) : (
          /* ---------------- Étape 2 : Saisie du code ---------------- */
          <div className="anim-apparait w-full max-w-md space-y-6">
            {/* Stepper à 100% */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {lang === "en"
                    ? "Step 2 of 2: confirm your email"
                    : "Étape 2 sur 2 : confirmation de votre email"}
                </span>
                <span>100%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-full rounded-full bg-primary transition-all duration-300" />
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card/80 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
                <MailCheck className="h-7 w-7" />
              </div>

              <div>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                  {lang === "en"
                    ? "Last step: check your inbox"
                    : "Dernière étape : vérifiez vos messages"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lang === "en"
                    ? "We just sent a 6-digit confirmation code to:"
                    : "Nous venons d'envoyer un code de validation à 6 chiffres à :"}
                </p>
                <div className="mt-2 inline-flex items-center rounded-lg bg-muted px-3 py-1 font-mono text-xs font-semibold text-foreground">
                  {champs.email}
                </div>
              </div>

              {erreurGenerale && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive text-left"
                >
                  {erreurGenerale}
                </div>
              )}

              <div className="space-y-5">
                <ChampCode
                  valeur={code}
                  onChange={setCode}
                  onComplet={(c) => void creerLeCompte(c)}
                  erreur={Boolean(erreurs.code)}
                />

                <div className="min-h-5 text-sm">
                  {erreurs.code ? (
                    <span className="text-destructive font-medium">
                      {erreurs.code}
                    </span>
                  ) : envoiEnCours ? (
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t("commun.validerEnCours")}
                    </span>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {lang === "en"
                        ? "If the code has not arrived within a minute, check your spam folder."
                        : "Si le code n'arrive pas dans la minute, regardez dans vos spams."}
                    </p>
                  )}
                </div>

                <Button
                  size="lg"
                  className="w-full text-base font-semibold shadow-md transition-all hover:shadow-lg cursor-pointer"
                  disabled={envoiEnCours || code.replace(/\D/g, "").length < 6}
                  onClick={() => void creerLeCompte(code)}
                >
                  {envoiEnCours ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("commun.validerEnCours")}
                    </>
                  ) : (
                    lang === "en"
                      ? "Activate my store"
                      : "Activer ma boutique"
                  )}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 pt-5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEtape("formulaire");
                    setCode("");
                    setErreurs({});
                  }}
                  className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {lang === "en"
                    ? "Change my email or details"
                    : "Corriger mon email ou mes informations"}
                </button>

                <button
                  type="button"
                  disabled={secondesAvantRenvoi > 0 || envoiEnCours}
                  onClick={() => void renvoyerCode()}
                  className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 disabled:text-muted-foreground disabled:no-underline transition-colors cursor-pointer"
                >
                  {secondesAvantRenvoi > 0
                    ? lang === "en"
                      ? `Resend code in ${secondesAvantRenvoi}s`
                      : `Renvoyer un code dans ${secondesAvantRenvoi}s`
                    : (lang === "en" ? "I didn't get it, resend" : "Je n'ai rien reçu, renvoyer un code")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Bloc de champ unifié avec label, indicateur requis, aide et erreur inline.
 */
function Champ({
  label,
  erreur,
  aide,
  obligatoire,
  children,
}: {
  label: string;
  erreur?: string;
  aide?: string;
  obligatoire?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">
        {label}
        {obligatoire && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {erreur ? (
        <p className="text-[11px] font-medium text-destructive">{erreur}</p>
      ) : aide ? (
        <p className="text-[11px] text-muted-foreground">{aide}</p>
      ) : null}
    </div>
  );
}
