"use client";

/**
 * Inscription d'un propriétaire de boutique (/inscription).
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi, enregistrerToken } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { BasculeTheme } from "@/components/bascule-theme";
import { BasculeLangue } from "@/components/bascule-langue";
import { ChampCode } from "@/components/champ-code";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChampTelephone } from "@/components/champ-telephone";
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

  // Compte à rebours du bouton « Renvoyer le code ».
  useEffect(() => {
    if (secondesAvantRenvoi <= 0) return;

    const minuteur = setTimeout(
      () => setSecondesAvantRenvoi((s) => s - 1),
      1000,
    );

    return () => clearTimeout(minuteur);
  }, [secondesAvantRenvoi]);

  /** Étape 1 : demande d'un code, sans rien créer côté serveur. */
  async function demanderCode(evenement: React.FormEvent) {
    evenement.preventDefault();

    const errs: Record<string, string> = {};

    if (!champs.name.trim()) {
      errs.name = t("commun.nomRequis");
    }

    if (!champs.email.trim()) {
      errs.email = t("commun.emailRequis");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(champs.email.trim())) {
      errs.email = t("commun.emailInvalide");
    }

    if (!champs.password) {
      errs.password = t("commun.motDePasseRequis");
    } else if (champs.password.length < 8) {
      errs.password =
        lang === "en" ? "8 characters minimum" : "8 caractères minimum";
    }

    if (!champs.password_confirmation) {
      errs.password_confirmation = t("commun.confirmationRequise");
    } else if (champs.password !== champs.password_confirmation) {
      errs.password_confirmation =
        lang === "en"
          ? "The two passwords do not match."
          : "Les deux mots de passe diffèrent.";
    }

    if (!champs.boutique_nom.trim()) {
      errs.boutique_nom = t("commun.boutiqueRequise");
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
      toast.success(t("auth.codeEnvoye"));
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

  /** Étape 2 : le code accompagne le formulaire, le compte est créé. */
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
      toast.success(t("auth.codeEnvoye"));
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

  const argumentaire =
    lang === "en"
      ? [
          "Every device tracked by IMEI, from intake to customer sale",
          "Multiple store locations under one unified account",
          "Sales associates only see their designated store location",
        ]
      : [
          "Chaque appareil suivi par son IMEI, de l'arrivage à la vente",
          "Plusieurs boutiques, un seul compte",
          "Vos vendeuses ne voient que leur point de vente",
        ];

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1fr_1.1fr]">
      {/* Colonne de présentation, masquée sur petit écran */}
      <aside className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <IconeTelora size={36} />
          <span className="font-heading text-lg font-bold tracking-tight">
            TELORA
          </span>
        </div>

        <div className="max-w-md">
          <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight">
            {lang === "en"
              ? "Always know where every single phone is."
              : "Vous savez toujours où est chaque téléphone."}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-primary-foreground/75">
            {lang === "en"
              ? "One device, one IMEI, one entry. Scan at intake, scan upon sale."
              : "Un appareil, un IMEI, une ligne. Scannez à l'arrivage, scannez à la vente."}
          </p>

          <ul className="mt-8 space-y-3">
            {argumentaire.map((texte) => (
              <li key={texte} className="flex gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground/70" />
                <span className="text-primary-foreground/85">{texte}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-primary-foreground/60">
          {lang === "en"
            ? "14-day free trial, no commitment."
            : "14 jours d'essai gratuit, sans engagement."}
        </p>
      </aside>

      <main className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <BasculeLangue />
          <BasculeTheme />
        </div>

        {etape === "formulaire" ? (
          <div className="anim-apparait w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                {t("auth.inscriptionTitre")}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t("auth.inscriptionDesc")}
              </p>
            </div>

            <form noValidate onSubmit={demanderCode} className="space-y-5">
              <section className="space-y-4">
                <h2 className="text-sm font-medium">
                  {lang === "en" ? "Personal Details" : "Vous"}
                </h2>

                <Champ
                  label={t("auth.nomComplet")}
                  erreur={erreurs.name}
                  obligatoire
                >
                  <Input
                    className={`h-10 ${erreurs.name ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    autoComplete="name"
                    value={champs.name}
                    onChange={(e) => modifier("name", e.target.value)}
                    placeholder={t("auth.nomPlaceholder")}
                  />
                </Champ>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ
                    label={t("auth.email")}
                    erreur={erreurs.email}
                    aide={
                      lang === "en"
                        ? "A code will be sent here"
                        : "Un code de vérification y sera envoyé"
                    }
                    obligatoire
                  >
                    <Input
                      type="email"
                      className={`h-10 ${erreurs.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                      autoComplete="username"
                      value={champs.email}
                      onChange={(e) => modifier("email", e.target.value)}
                      placeholder={t("auth.emailPlaceholder")}
                    />
                  </Champ>

                  <Champ
                    label={t("monCompte.telephone")}
                    erreur={erreurs.telephone}
                  >
                    <ChampTelephone
                      autoComplete="tel"
                      valeur={champs.telephone}
                      onChange={(val) => modifier("telephone", val)}
                      erreur={Boolean(erreurs.telephone)}
                    />
                  </Champ>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ
                    label={t("auth.motDePasse")}
                    erreur={erreurs.password}
                    aide={lang === "en" ? "8 characters min" : "8 caractères minimum"}
                    obligatoire
                  >
                    <Input
                      type="password"
                      className={`h-10 ${erreurs.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                      autoComplete="new-password"
                      value={champs.password}
                      onChange={(e) => modifier("password", e.target.value)}
                    />
                  </Champ>

                  <Champ
                    label={t("auth.confirmationMotDePasse")}
                    erreur={erreurs.password_confirmation}
                    obligatoire
                  >
                    <Input
                      type="password"
                      className={`h-10 ${erreurs.password_confirmation ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                      autoComplete="new-password"
                      value={champs.password_confirmation}
                      onChange={(e) =>
                        modifier("password_confirmation", e.target.value)
                      }
                    />
                  </Champ>
                </div>
              </section>

              <section className="space-y-4 border-t pt-5">
                <h2 className="text-sm font-medium">
                  {lang === "en"
                    ? "Your First Store"
                    : "Votre première boutique"}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ
                    label={t("auth.nomBoutique")}
                    erreur={erreurs.boutique_nom}
                    obligatoire
                  >
                    <Input
                      className={`h-10 ${erreurs.boutique_nom ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                      value={champs.boutique_nom}
                      onChange={(e) => modifier("boutique_nom", e.target.value)}
                      placeholder="Akwa Mobile"
                    />
                  </Champ>

                  <Champ
                    label={t("auth.villeBoutique")}
                    erreur={erreurs.boutique_ville}
                  >
                    <Input
                      className="h-10"
                      value={champs.boutique_ville}
                      onChange={(e) =>
                        modifier("boutique_ville", e.target.value)
                      }
                      placeholder="Douala"
                    />
                  </Champ>
                </div>
              </section>

              {erreurGenerale && (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {erreurGenerale}
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
                {lang === "en" ? "Continue" : "Continuer"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("auth.dejaCompte")}{" "}
              <Link
                href="/connexion"
                className="font-medium text-primary underline underline-offset-4"
              >
                {t("auth.seConnecter")}
              </Link>
            </p>
          </div>
        ) : (
          /* ---------------- Étape 2 : le code ---------------- */
          <div className="anim-apparait w-full max-w-md">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <MailCheck className="h-6 w-6" />
              </div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                {lang === "en" ? "Check your email" : "Vérifiez votre email"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t("auth.codeInstructions", { email: champs.email })}
              </p>
            </div>

            <div className="space-y-5">
              <ChampCode
                valeur={code}
                onChange={setCode}
                onComplet={(c) => void creerLeCompte(c)}
                erreur={Boolean(erreurs.code)}
              />

              <p className="min-h-5 text-center text-sm">
                {erreurs.code ? (
                  <span className="text-destructive">{erreurs.code}</span>
                ) : envoiEnCours ? (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t("commun.validerEnCours")}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {lang === "en"
                      ? "Code is valid for 15 minutes."
                      : "Le code est valable 15 minutes."}
                  </span>
                )}
              </p>

              <Button
                size="lg"
                className="w-full"
                disabled={envoiEnCours || code.replace(/\D/g, "").length < 6}
                onClick={() => void creerLeCompte(code)}
              >
                {envoiEnCours && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("auth.sInscrire")}
              </Button>

              <div className="flex items-center justify-between gap-3 border-t pt-5 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setEtape("formulaire");
                    setCode("");
                    setErreurs({});
                  }}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {lang === "en"
                    ? "Edit information"
                    : "Modifier mes informations"}
                </button>

                <button
                  type="button"
                  disabled={secondesAvantRenvoi > 0 || envoiEnCours}
                  onClick={() => void renvoyerCode()}
                  className="font-medium text-primary underline underline-offset-4 disabled:text-muted-foreground disabled:no-underline"
                >
                  {secondesAvantRenvoi > 0
                    ? `${t("auth.renvoyerCode")} (${secondesAvantRenvoi}s)`
                    : t("auth.renvoyerCode")}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

/** Libellé au-dessus, aide ou erreur en dessous. */
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
    <div className="space-y-2">
      <Label>
        {label}
        {obligatoire && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {erreur ? (
        <p className="text-xs text-destructive">{erreur}</p>
      ) : aide ? (
        <p className="text-xs text-muted-foreground">{aide}</p>
      ) : null}
    </div>
  );
}
