"use client";

/** Mon compte (/mon-compte) : coordonnées, mot de passe, abonnement. */

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import {
  couleursAbonnements,
  formaterDateCourte,
  libellesAbonnements,
  libellesRoles,
} from "@/lib/format";
import { useAuth } from "@/components/auth-provider";
import { ChangerEmail } from "@/components/changer-email";
import { DeuxFacteurs } from "@/components/deux-facteurs";
import { Apparait, TitrePage } from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PageMonCompte() {
  const { utilisateur, rafraichir } = useAuth();

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [changementMdp, setChangementMdp] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!utilisateur) return;
    setNom(utilisateur.name);
    setTelephone(utilisateur.telephone ?? "");
  }, [utilisateur]);

  if (!utilisateur) return null;

  async function enregistrerCoordonnees(evenement: React.FormEvent) {
    evenement.preventDefault();
    setEnregistrement(true);

    try {
      await api.put("/mon-compte", { name: nom, telephone: telephone || null });
      toast.success("Coordonnées mises à jour.");
      await rafraichir();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : "Erreur inconnue.");
    } finally {
      setEnregistrement(false);
    }
  }

  async function changerMotDePasse(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreurs({});
    setChangementMdp(true);

    try {
      await api.put("/mon-compte", {
        mot_de_passe_actuel: ancien,
        password: nouveau,
        password_confirmation: confirmation,
      });
      toast.success("Mot de passe modifié.");
      setAncien("");
      setNouveau("");
      setConfirmation("");
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        toast.error(e.resume());
      }
    } finally {
      setChangementMdp(false);
    }
  }

  const abonnement = utilisateur.abonnement;

  return (
    <div className="mx-auto max-w-2xl">
      <TitrePage
        titre="Mon compte"
        description={`${libellesRoles[utilisateur.role]} · ${utilisateur.email}`}
      />

      <div className="space-y-6">
        {abonnement?.statut && (
          <Apparait>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Abonnement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  <span
                    className={[
                      "rounded-full px-2.5 py-0.5 text-sm font-medium",
                      couleursAbonnements[abonnement.statut],
                    ].join(" ")}
                  >
                    {libellesAbonnements[abonnement.statut]}
                  </span>
                </div>

                {abonnement.echeance && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      Échéance
                    </span>
                    <span className="text-sm font-medium">
                      {formaterDateCourte(abonnement.echeance)}
                    </span>
                  </div>
                )}

                {!abonnement.utilisable && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    L&apos;accès aux données est suspendu. Vos informations sont
                    conservées : contactez-nous pour réactiver le compte.
                  </p>
                )}
              </CardContent>
            </Card>
          </Apparait>
        )}

        <Apparait index={1}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coordonnées</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={enregistrerCoordonnees} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="c-nom">Nom complet</Label>
                  <Input
                    id="c-nom"
                    required
                    className="h-10"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="c-tel">Téléphone</Label>
                  <Input
                    id="c-tel"
                    className="h-10"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={enregistrement}>
                  {enregistrement && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Enregistrer
                </Button>
              </form>
            </CardContent>
          </Card>
        </Apparait>

        <Apparait index={2}>
          <ChangerEmail />
        </Apparait>

        <Apparait index={3}>
          <DeuxFacteurs />
        </Apparait>

        <Apparait index={4}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mot de passe</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={changerMotDePasse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mdp-actuel">Mot de passe actuel</Label>
                  <Input
                    id="mdp-actuel"
                    type="password"
                    required
                    className="h-10"
                    autoComplete="current-password"
                    value={ancien}
                    onChange={(e) => setAncien(e.target.value)}
                  />
                  {erreurs.mot_de_passe_actuel && (
                    <p className="text-xs text-destructive">
                      {erreurs.mot_de_passe_actuel}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mdp-nouveau">Nouveau mot de passe</Label>
                    <Input
                      id="mdp-nouveau"
                      type="password"
                      required
                      minLength={8}
                      className="h-10"
                      autoComplete="new-password"
                      value={nouveau}
                      onChange={(e) => setNouveau(e.target.value)}
                    />
                    {erreurs.password && (
                      <p className="text-xs text-destructive">
                        {erreurs.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mdp-confirmation">Confirmation</Label>
                    <Input
                      id="mdp-confirmation"
                      type="password"
                      required
                      className="h-10"
                      autoComplete="new-password"
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={changementMdp}>
                  {changementMdp && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Changer le mot de passe
                </Button>
              </form>
            </CardContent>
          </Card>
        </Apparait>
      </div>
    </div>
  );
}
