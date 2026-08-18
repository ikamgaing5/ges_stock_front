"use client";

/**
 * Activation de la double authentification, dans « Mon compte ».
 *
 * Trois écrans :
 *   1. inactive  : un bouton, et le mot de passe pour commencer
 *   2. QR code   : à scanner, puis un premier code pour confirmer
 *   3. codes de secours : affichés UNE SEULE FOIS
 *
 * L'activation n'est effective qu'après le premier code : sans cette
 * confirmation, un QR code mal scanné enfermerait la personne dehors.
 */

import { useState } from "react";
import {
  Copy,
  Download,
  Loader2,
  ShieldCheck,
  ShieldOff,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { ChampCode } from "@/components/champ-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Preparation = { secret: string; qr_code: string; uri: string };

export function DeuxFacteurs() {
  const { utilisateur, rafraichir } = useAuth();

  const [etape, setEtape] = useState<"repos" | "mot_de_passe" | "qr" | "codes">(
    "repos",
  );
  const [motDePasse, setMotDePasse] = useState("");
  const [preparation, setPreparation] = useState<Preparation | null>(null);
  const [code, setCode] = useState("");
  const [codesSecours, setCodesSecours] = useState<string[]>([]);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [confirmeDesactivation, setConfirmeDesactivation] = useState(false);

  const actif = utilisateur?.deux_facteurs?.actif ?? false;
  const restants = utilisateur?.deux_facteurs?.codes_secours_restants ?? 0;

  function revenirAuRepos() {
    setEtape("repos");
    setMotDePasse("");
    setPreparation(null);
    setCode("");
    setCodesSecours([]);
    setErreurs({});
    setConfirmeDesactivation(false);
  }

  async function preparer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      setPreparation(
        await api.post<Preparation>("/mon-compte/2fa", {
          mot_de_passe_actuel: motDePasse,
        }),
      );
      setEtape("qr");
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
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
      const reponse = await api.post<{ codes_secours: string[] }>(
        "/mon-compte/2fa/confirmer",
        { code: codeSaisi },
      );

      setCodesSecours(reponse.codes_secours);
      setEtape("codes");
      await rafraichir();
      toast.success("Double authentification activée.");
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        setCode("");
        toast.error(e.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function desactiver(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      await api.delete("/mon-compte/2fa", {
        mot_de_passe_actuel: motDePasse,
      });
      await rafraichir();
      toast.success("Double authentification désactivée.");
      revenirAuRepos();
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        toast.error(e.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  async function regenerer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      const reponse = await api.post<{ codes_secours: string[] }>(
        "/mon-compte/2fa/codes-secours",
        { mot_de_passe_actuel: motDePasse },
      );

      setCodesSecours(reponse.codes_secours);
      setEtape("codes");
      await rafraichir();
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        toast.error(e.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  function copierCodes() {
    void navigator.clipboard.writeText(codesSecours.join("\n"));
    toast.success("Codes copiés.");
  }

  function telechargerCodes() {
    // Un fichier texte : la personne le range où elle veut, hors du
    // téléphone qui porte l'application d'authentification.
    const contenu = [
      "Codes de secours Parc Mobile",
      `Compte : ${utilisateur?.email}`,
      "",
      "Chaque code ne fonctionne qu'une seule fois.",
      "Rangez-les ailleurs que sur le téléphone qui génère les codes.",
      "",
      ...codesSecours,
    ].join("\n");

    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(new Blob([contenu], { type: "text/plain" }));
    lien.download = "codes-secours-parc-mobile.txt";
    lien.click();
    URL.revokeObjectURL(lien.href);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {actif ? (
            <ShieldCheck className="h-4 w-4 text-statut-ok" />
          ) : (
            <ShieldOff className="h-4 w-4 text-muted-foreground" />
          )}
          Double authentification
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ---------------- Écran des codes de secours ---------------- */}
        {etape === "codes" ? (
          <div className="space-y-4">
            <div className="flex gap-2.5 rounded-lg bg-statut-attente-fond px-3 py-2.5 text-sm text-statut-attente">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Notez ces codes maintenant : ils ne seront plus jamais
                affichés. Ils sont la seule façon de vous connecter si vous
                perdez votre téléphone.
              </p>
            </div>

            <ul className="grid grid-cols-2 gap-2 rounded-lg border p-3">
              {codesSecours.map((c) => (
                <li
                  key={c}
                  className="chiffres text-center font-mono text-sm tracking-wider"
                >
                  {c}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copierCodes}>
                <Copy className="mr-2 h-3.5 w-3.5" />
                Copier
              </Button>
              <Button variant="outline" size="sm" onClick={telechargerCodes}>
                <Download className="mr-2 h-3.5 w-3.5" />
                Télécharger
              </Button>
              <Button size="sm" onClick={revenirAuRepos}>
                J&apos;ai noté mes codes
              </Button>
            </div>
          </div>
        ) : etape === "qr" && preparation ? (
          /* ---------------- Écran du QR code ---------------- */
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scannez ce QR code avec Google Authenticator, Authy, ou toute
              autre application d&apos;authentification.
            </p>

            <div className="flex justify-center">
              <div
                className="rounded-lg bg-white p-3"
                // Le SVG vient de notre propre serveur, généré à partir du
                // secret : aucun contenu extérieur n'est injecté ici.
                dangerouslySetInnerHTML={{ __html: preparation.qr_code }}
              />
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground">
                Impossible de scanner ? Saisir la clé à la main
              </summary>
              <p className="chiffres mt-2 rounded-lg border bg-muted/40 p-2.5 text-center font-mono text-xs break-all">
                {preparation.secret}
              </p>
            </details>

            <div className="space-y-2 border-t pt-4">
              <Label>Saisissez le code affiché par l&apos;application</Label>
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
            </div>

            <div className="flex gap-2">
              <Button
                disabled={envoiEnCours || code.replace(/\D/g, "").length < 6}
                onClick={() => void confirmer(code)}
              >
                {envoiEnCours && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Activer
              </Button>
              <Button variant="ghost" onClick={revenirAuRepos}>
                Annuler
              </Button>
            </div>
          </div>
        ) : etape === "mot_de_passe" ? (
          /* ---------------- Demande du mot de passe ---------------- */
          <form
            onSubmit={
              actif ? (confirmeDesactivation ? desactiver : regenerer) : preparer
            }
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="mdp-2fa">Votre mot de passe</Label>
              <Input
                id="mdp-2fa"
                type="password"
                required
                autoFocus
                className="h-10"
                autoComplete="current-password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
              />
              {erreurs.mot_de_passe_actuel && (
                <p className="text-xs text-destructive">
                  {erreurs.mot_de_passe_actuel}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                variant={confirmeDesactivation ? "destructive" : "default"}
                disabled={envoiEnCours}
              >
                {envoiEnCours && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {confirmeDesactivation
                  ? "Désactiver"
                  : actif
                    ? "Générer de nouveaux codes"
                    : "Continuer"}
              </Button>
              <Button type="button" variant="ghost" onClick={revenirAuRepos}>
                Annuler
              </Button>
            </div>
          </form>
        ) : (
          /* ---------------- Écran de repos ---------------- */
          <div className="space-y-4">
            {actif ? (
              <>
                <p className="text-sm">
                  <span className="font-medium text-statut-ok">Active.</span>{" "}
                  Un code de votre application est demandé à chaque connexion.
                </p>

                <p className="text-sm text-muted-foreground">
                  {restants > 0 ? (
                    <>
                      {restants} code(s) de secours restant(s).
                      {restants <= 2 && (
                        <span className="text-statut-attente">
                          {" "}
                          Pensez à en générer de nouveaux.
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-statut-alerte">
                      Plus aucun code de secours. Si vous perdez votre
                      téléphone, vous ne pourrez plus vous connecter.
                    </span>
                  )}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConfirmeDesactivation(false);
                      setEtape("mot_de_passe");
                    }}
                  >
                    Nouveaux codes de secours
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConfirmeDesactivation(true);
                      setEtape("mot_de_passe");
                    }}
                  >
                    <ShieldOff className="mr-2 h-3.5 w-3.5" />
                    Désactiver
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  En plus du mot de passe, un code à 6 chiffres généré par
                  votre téléphone sera demandé à chaque connexion. Même
                  quelqu&apos;un qui connaîtrait votre mot de passe ne
                  pourrait pas entrer.
                </p>

                <Button size="sm" onClick={() => setEtape("mot_de_passe")}>
                  <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                  Activer
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
