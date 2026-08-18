"use client";

/**
 * Mot de passe oublié (/mot-de-passe-oublie).
 *
 * Deux étapes, comme l'inscription : on demande l'adresse, un code part
 * par email, puis ce code accompagne le nouveau mot de passe.
 *
 * Le serveur répond la même chose que le compte existe ou non : sinon,
 * cette page deviendrait un moyen de savoir qui est inscrit.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { api, enregistrerToken, ErreurApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { BasculeTheme } from "@/components/bascule-theme";
import { ChampCode } from "@/components/champ-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Utilisateur } from "@/types";

const DELAI_RENVOI = 60;

export default function PageMotDePasseOublie() {
  const router = useRouter();
  const { rafraichir } = useAuth();

  const [etape, setEtape] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [secondesAvantRenvoi, setSecondesAvantRenvoi] = useState(0);

  useEffect(() => {
    if (secondesAvantRenvoi <= 0) return;
    const minuteur = setTimeout(() => setSecondesAvantRenvoi((s) => s - 1), 1000);
    return () => clearTimeout(minuteur);
  }, [secondesAvantRenvoi]);

  async function demanderCode(evenement?: React.FormEvent) {
    evenement?.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      await api.post("/mot-de-passe/code", { email });
      setEtape("code");
      setSecondesAvantRenvoi(DELAI_RENVOI);
      toast.success("Si un compte existe, un code vient d'être envoyé.");
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        const reste = e.nombre("secondes_restantes");
        if (reste !== undefined) setSecondesAvantRenvoi(reste);
        toast.error(e.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function reinitialiser(evenement: React.FormEvent) {
    evenement.preventDefault();

    if (motDePasse !== confirmation) {
      setErreurs({ confirmation: "Les deux mots de passe diffèrent." });
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

      // Le serveur renvoie un token : inutile de redemander de se
      // connecter juste après avoir prouvé son identité par email.
      enregistrerToken(reponse.token);
      await rafraichir();
      toast.success("Mot de passe modifié.");
      router.push("/");
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        toast.error(e.resume());
      }
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-4 right-4">
        <BasculeTheme />
      </div>

      <div className="anim-apparait w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            {etape === "email" ? (
              <KeyRound className="h-6 w-6" />
            ) : (
              <MailCheck className="h-6 w-6" />
            )}
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              {etape === "email"
                ? "Mot de passe oublié"
                : "Choisissez un nouveau mot de passe"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {etape === "email" ? (
                "Indiquez votre adresse : nous vous enverrons un code."
              ) : (
                <>
                  Code envoyé à
                  <br />
                  <span className="font-medium text-foreground">{email}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {etape === "email" ? (
          <form
            onSubmit={demanderCode}
            className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                required
                autoFocus
                className="h-10"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@boutique.cm"
              />
              {erreurs.email && (
                <p className="text-xs text-destructive">{erreurs.email}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={envoiEnCours}
            >
              {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer le code
            </Button>
          </form>
        ) : (
          <form
            onSubmit={reinitialiser}
            className="space-y-5 rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="space-y-2">
              <Label>Code reçu par email</Label>
              <ChampCode
                valeur={code}
                onChange={setCode}
                erreur={Boolean(erreurs.code)}
              />
              {erreurs.code && (
                <p className="text-center text-xs text-destructive">
                  {erreurs.code}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mdp">Nouveau mot de passe</Label>
              <Input
                id="mdp"
                type="password"
                required
                minLength={8}
                className="h-10"
                autoComplete="new-password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
              />
              {erreurs.password ? (
                <p className="text-xs text-destructive">{erreurs.password}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  8 caractères minimum
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mdp2">Confirmation</Label>
              <Input
                id="mdp2"
                type="password"
                required
                className="h-10"
                autoComplete="new-password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
              {erreurs.confirmation && (
                <p className="text-xs text-destructive">
                  {erreurs.confirmation}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={envoiEnCours || code.replace(/\D/g, "").length < 6}
            >
              {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Changer le mot de passe
            </Button>

            <div className="flex items-center justify-between gap-3 border-t pt-4 text-sm">
              <button
                type="button"
                onClick={() => {
                  setEtape("email");
                  setCode("");
                  setErreurs({});
                }}
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Autre adresse
              </button>

              <button
                type="button"
                disabled={secondesAvantRenvoi > 0 || envoiEnCours}
                onClick={() => void demanderCode()}
                className="font-medium text-primary underline underline-offset-4 disabled:text-muted-foreground disabled:no-underline"
              >
                {secondesAvantRenvoi > 0
                  ? `Renvoyer dans ${secondesAvantRenvoi} s`
                  : "Renvoyer le code"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/connexion"
            className="font-medium text-primary underline underline-offset-4"
          >
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
