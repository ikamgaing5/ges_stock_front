"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { BasculeTheme } from "@/components/bascule-theme";
import { ChampCode } from "@/components/champ-code";
import { ErreurApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconeTelora } from "@/components/ui/logo-telora";
import { PiedDePageLegal } from "@/components/layout/pied-de-page-legal";

/** Page de connexion (/connexion). */
export default function PageConnexion() {
  const { utilisateur, chargement, connexion, connexionDeuxFacteurs } =
    useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  // Renseigné seulement quand le compte a la double authentification.
  const [jetonDefi, setJetonDefi] = useState<string | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!chargement && utilisateur) {
      router.replace(utilisateur.role === "admin" ? "/admin" : "/");
    }
  }, [chargement, utilisateur, router]);

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreur(null);
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
      setErreur(
        e instanceof ErreurApi
          ? (e.erreurDe("email") ?? e.message)
          : "Une erreur inattendue est survenue.",
      );
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
          setErreur(e.erreurDe("code") ?? e.message);
          setCode("");
        }
      } else {
        setErreur("Une erreur inattendue est survenue.");
      }
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-between bg-muted/40 p-4">
      {/* Le thème doit pouvoir se changer avant même de se connecter :
          on ouvre parfois l'application dans le noir. */}
      <div className="absolute top-4 right-4">
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
                {jetonDefi ? "Vérification en deux étapes" : "Telora"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {jetonDefi
                  ? "Saisissez le code affiché par votre application d'authentification."
                  : "Connectez-vous pour gérer votre stock"}
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
                {erreur}
              </p>
            )}

            <Button
              size="lg"
              className="w-full"
              disabled={envoiEnCours || code.replace(/\D/g, "").length < 6}
              onClick={() => void validerCode(code)}
            >
              {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Valider
            </Button>

            {/* Le champ à 6 cases n'accepte que des chiffres ; un code de
                secours contient des lettres et a donc son propre champ. */}
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="secours" className="text-xs font-normal">
                Téléphone perdu ? Utilisez un code de secours
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
              Revenir à la connexion
            </button>
          </div>
        ) : (
        <form
          onSubmit={envoyer}
          className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              className="h-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@boutique.cm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="motdepasse">Mot de passe</Label>
              <Link
                href="/mot-de-passe-oublie"
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Oublié ?
              </Link>
            </div>
            <Input
              id="motdepasse"
              type="password"
              autoComplete="current-password"
              required
              className="h-10"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
            />
          </div>

          {erreur && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {erreur}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={envoiEnCours}
          >
            {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
        </form>
        )}

        {!jetonDefi && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Vous gérez une boutique de téléphones ?{" "}
            <Link
              href="/inscription"
              className="font-medium text-primary underline underline-offset-4"
            >
              Créer un compte
            </Link>
          </p>
        )}
      </div>
      </div>

      {/* <PiedDePageLegal className="mt-auto pt-6" /> */}
    </div>
  );
}
