"use client";

/**
 * Changement d'adresse email, en deux temps.
 *
 * 1. On demande la nouvelle adresse ET le mot de passe actuel. Sans ce
 *    mot de passe, quelqu'un qui trouverait un poste resté connecté
 *    pourrait détourner le compte en changeant l'adresse.
 * 2. Un code part à la NOUVELLE adresse. Le saisir prouve qu'elle
 *    appartient bien à la personne : le changement ne prend effet qu'à
 *    ce moment-là.
 */

import { useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { ChampCode } from "@/components/champ-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DELAI_RENVOI = 60;

export function ChangerEmail() {
  const { utilisateur, rafraichir } = useAuth();

  const [ouvert, setOuvert] = useState(false);
  const [etape, setEtape] = useState<"saisie" | "code">("saisie");
  const [nouvelEmail, setNouvelEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [code, setCode] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [secondesAvantRenvoi, setSecondesAvantRenvoi] = useState(0);

  useEffect(() => {
    if (secondesAvantRenvoi <= 0) return;
    const minuteur = setTimeout(() => setSecondesAvantRenvoi((s) => s - 1), 1000);
    return () => clearTimeout(minuteur);
  }, [secondesAvantRenvoi]);

  function reinitialiser() {
    setOuvert(false);
    setEtape("saisie");
    setNouvelEmail("");
    setMotDePasse("");
    setCode("");
    setErreurs({});
  }

  async function demanderCode(evenement?: React.FormEvent) {
    evenement?.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      await api.post("/mon-compte/email/code", {
        email: nouvelEmail,
        mot_de_passe_actuel: motDePasse,
      });

      setEtape("code");
      setSecondesAvantRenvoi(DELAI_RENVOI);
      toast.success(`Code envoyé à ${nouvelEmail}.`);
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

  async function confirmer(codeSaisi: string) {
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      await api.put("/mon-compte/email", {
        email: nouvelEmail,
        code: codeSaisi,
      });

      await rafraichir();
      toast.success("Adresse email modifiée.");
      reinitialiser();
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        toast.error(e.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Adresse email</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium">
              {utilisateur?.email}
            </span>
          </div>

          {!ouvert && (
            <Button variant="outline" size="sm" onClick={() => setOuvert(true)}>
              Changer
            </Button>
          )}
        </div>

        {ouvert && etape === "saisie" && (
          <form onSubmit={demanderCode} className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="nouvel-email">Nouvelle adresse</Label>
              <Input
                id="nouvel-email"
                type="email"
                required
                autoFocus
                className="h-10"
                value={nouvelEmail}
                onChange={(e) => setNouvelEmail(e.target.value)}
                placeholder="nouvelle@boutique.cm"
              />
              {erreurs.email && (
                <p className="text-xs text-destructive">{erreurs.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mdp-actuel-email">Votre mot de passe</Label>
              <Input
                id="mdp-actuel-email"
                type="password"
                required
                className="h-10"
                autoComplete="current-password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
              />
              {erreurs.mot_de_passe_actuel ? (
                <p className="text-xs text-destructive">
                  {erreurs.mot_de_passe_actuel}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Demandé pour éviter qu&apos;un poste resté ouvert permette de
                  détourner le compte.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={envoiEnCours}>
                {envoiEnCours && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Envoyer le code
              </Button>
              <Button type="button" variant="ghost" onClick={reinitialiser}>
                Annuler
              </Button>
            </div>
          </form>
        )}

        {ouvert && etape === "code" && (
          <div className="space-y-4 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Un code a été envoyé à{" "}
              <span className="font-medium text-foreground">{nouvelEmail}</span>.
              Saisissez-le pour confirmer.
            </p>

            <ChampCode
              valeur={code}
              onChange={setCode}
              onComplet={(c) => void confirmer(c)}
              erreur={Boolean(erreurs.code)}
            />

            {erreurs.code && (
              <p className="text-center text-xs text-destructive">
                {erreurs.code}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEtape("saisie");
                  setCode("");
                  setErreurs({});
                }}
              >
                Modifier l&apos;adresse
              </Button>

              <button
                type="button"
                disabled={secondesAvantRenvoi > 0 || envoiEnCours}
                onClick={() => void demanderCode()}
                className="text-sm font-medium text-primary underline underline-offset-4 disabled:text-muted-foreground disabled:no-underline"
              >
                {secondesAvantRenvoi > 0
                  ? `Renvoyer dans ${secondesAvantRenvoi} s`
                  : "Renvoyer le code"}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
