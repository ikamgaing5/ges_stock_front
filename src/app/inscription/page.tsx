"use client";

/**
 * Inscription d'un propriétaire de boutique (/inscription).
 *
 * Deux étapes :
 *   1. le formulaire ; à la validation, un code à 6 chiffres part par email
 *   2. la saisie de ce code, qui déclenche la création du compte
 *
 * Le compte n'existe qu'à la fin : tant que le code n'est pas confirmé,
 * rien n'est enregistré. C'est ce qui garantit que l'adresse saisie
 * appartient bien à la personne.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, MailCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi, enregistrerToken } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { BasculeTheme } from "@/components/bascule-theme";
import { ChampCode } from "@/components/champ-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Utilisateur } from "@/types";

const argumentaire = [
  "Chaque appareil suivi par son IMEI, de l'arrivage à la vente",
  "Plusieurs boutiques, un seul compte",
  "Vos vendeuses ne voient que leur point de vente",
];

/** Délai imposé par le serveur entre deux envois de code, en secondes. */
const DELAI_RENVOI = 60;

export default function PageInscription() {
  const router = useRouter();
  const { rafraichir } = useAuth();

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

    if (champs.password !== champs.password_confirmation) {
      setErreurs({ password_confirmation: "Les deux mots de passe diffèrent." });
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
      toast.success("Code envoyé. Regardez votre boîte mail.");
    } catch (e) {
      if (e instanceof ErreurApi) {
        const parChamp = e.parChamp();
        setErreurs(parChamp);
        if (Object.keys(parChamp).length === 0) setErreurGenerale(e.message);
      } else {
        setErreurGenerale("Une erreur inattendue est survenue.");
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
        router.push("/");
      } catch (e) {
        if (e instanceof ErreurApi) {
          const parChamp = e.parChamp();
          setErreurs(parChamp);

          // Une erreur sur un champ du formulaire (email déjà pris, par
          // exemple) ne se corrige pas depuis l'écran du code : on revient
          // en arrière plutôt que de laisser la personne bloquée.
          const horsCode = Object.keys(parChamp).filter((c) => c !== "code");
          if (horsCode.length > 0) {
            setEtape("formulaire");
            toast.error(parChamp[horsCode[0]]);
          }
        } else {
          setErreurGenerale("Une erreur inattendue est survenue.");
        }
        setEnvoiEnCours(false);
      }
    },
    [champs, rafraichir, router],
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
      toast.success("Nouveau code envoyé.");
    } catch (e) {
      if (e instanceof ErreurApi) {
        toast.error(e.resume());
        // Le serveur indique le temps restant quand on insiste trop tôt.
        const reste = e.nombre("secondes_restantes");
        if (reste !== undefined) setSecondesAvantRenvoi(reste);
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[1fr_1.1fr]">
      {/* Colonne de présentation, masquée sur petit écran */}
      <aside className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Smartphone className="h-[18px] w-[18px]" />
          </div>
          <span className="font-heading text-[15px] font-semibold">
            Parc Mobile
          </span>
        </div>

        <div className="max-w-md">
          <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight">
            Vous savez toujours où est chaque téléphone.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-primary-foreground/75">
            Un appareil, un IMEI, une ligne. Scannez à l&apos;arrivage, scannez
            à la vente.
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
          30 jours d&apos;essai, sans engagement.
        </p>
      </aside>

      <main className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="absolute top-4 right-4">
          <BasculeTheme />
        </div>

        {etape === "formulaire" ? (
          <div className="anim-apparait w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                Créer votre compte
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Votre première boutique est créée en même temps. Vous pourrez en
                ajouter d&apos;autres ensuite.
              </p>
            </div>

            <form onSubmit={demanderCode} className="space-y-5">
              <section className="space-y-4">
                <h2 className="text-sm font-medium">Vous</h2>

                <Champ label="Nom complet" erreur={erreurs.name} obligatoire>
                  <Input
                    required
                    className="h-10"
                    autoComplete="name"
                    value={champs.name}
                    onChange={(e) => modifier("name", e.target.value)}
                    placeholder="Ariane Mbarga"
                  />
                </Champ>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ
                    label="Adresse email"
                    erreur={erreurs.email}
                    aide="Un code de vérification y sera envoyé"
                    obligatoire
                  >
                    <Input
                      type="email"
                      required
                      className="h-10"
                      autoComplete="username"
                      value={champs.email}
                      onChange={(e) => modifier("email", e.target.value)}
                      placeholder="vous@boutique.cm"
                    />
                  </Champ>

                  <Champ label="Téléphone" erreur={erreurs.telephone}>
                    <Input
                      className="h-10"
                      autoComplete="tel"
                      value={champs.telephone}
                      onChange={(e) => modifier("telephone", e.target.value)}
                      placeholder="677 11 22 33"
                    />
                  </Champ>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ
                    label="Mot de passe"
                    erreur={erreurs.password}
                    aide="8 caractères minimum"
                    obligatoire
                  >
                    <Input
                      type="password"
                      required
                      minLength={8}
                      className="h-10"
                      autoComplete="new-password"
                      value={champs.password}
                      onChange={(e) => modifier("password", e.target.value)}
                    />
                  </Champ>

                  <Champ
                    label="Confirmation"
                    erreur={erreurs.password_confirmation}
                    obligatoire
                  >
                    <Input
                      type="password"
                      required
                      className="h-10"
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
                <h2 className="text-sm font-medium">Votre première boutique</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Champ
                    label="Nom de la boutique"
                    erreur={erreurs.boutique_nom}
                    obligatoire
                  >
                    <Input
                      required
                      className="h-10"
                      value={champs.boutique_nom}
                      onChange={(e) => modifier("boutique_nom", e.target.value)}
                      placeholder="Akwa Mobile"
                    />
                  </Champ>

                  <Champ label="Ville" erreur={erreurs.boutique_ville}>
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
                Continuer
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/connexion"
                className="font-medium text-primary underline underline-offset-4"
              >
                Se connecter
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
                Vérifiez votre email
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Nous avons envoyé un code à 6 chiffres à
                <br />
                <span className="font-medium text-foreground">
                  {champs.email}
                </span>
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
                    Vérification…
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Le code est valable 15 minutes.
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
                Créer mon compte
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
                  Modifier mes informations
                </button>

                <button
                  type="button"
                  disabled={secondesAvantRenvoi > 0 || envoiEnCours}
                  onClick={() => void renvoyerCode()}
                  className="font-medium text-primary underline underline-offset-4 disabled:text-muted-foreground disabled:no-underline"
                >
                  {secondesAvantRenvoi > 0
                    ? `Renvoyer dans ${secondesAvantRenvoi} s`
                    : "Renvoyer le code"}
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
