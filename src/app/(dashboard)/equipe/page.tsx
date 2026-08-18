"use client";

/**
 * L'équipe (/equipe).
 *
 * Le rattachement aux boutiques est le point important : c'est lui qui
 * détermine le stock que chaque personne pourra voir.
 */

import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useListe } from "@/lib/useListe";
import { descriptionsRoles, libellesRoles } from "@/lib/format";
import { useAuth } from "@/components/auth-provider";
import { permissions } from "@/lib/permissions";
import {
  Apparait,
  EtatErreur,
  EtatVide,
  SquelettesTableau,
  TitrePage,
} from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogCorps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Role, Utilisateur } from "@/types";

export default function PageEquipe() {
  const { utilisateur: moi } = useAuth();

  const [enEdition, setEnEdition] = useState<Partial<Utilisateur> | null>(null);
  const [aSupprimer, setASupprimer] = useState<Utilisateur | null>(null);

  const { donnees, chargement, erreur, recharger } = useListe(
    (signal) =>
      api.get<{ data: Utilisateur[] }>("/employes", undefined, signal),
    [],
  );

  const equipe = donnees?.data ?? [];

  async function supprimer() {
    if (!aSupprimer) return;
    try {
      await api.delete(`/employes/${aSupprimer.id}`);
      toast.success("Compte supprimé.");
      setASupprimer(null);
      recharger();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : "Erreur inconnue.");
    }
  }

  const peutGerer = moi && permissions.gererEmployes(moi.role);

  return (
    <>
      <TitrePage
        titre="Équipe"
        description="Vos vendeuses et secrétaires, et les boutiques auxquelles elles ont accès."
      >
        {peutGerer && (
          <Button onClick={() => setEnEdition({})}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une personne
          </Button>
        )}
      </TitrePage>

      {erreur ? (
        <EtatErreur message={erreur} onReessayer={recharger} />
      ) : chargement ? (
        <SquelettesTableau lignes={3} />
      ) : equipe.length === 0 ? (
        <EtatVide
          icone={<Users className="h-5 w-5" />}
          titre="Personne pour le moment"
          description="Créez un compte pour chaque vendeuse et rattachez-la à ses boutiques."
        >
          {peutGerer && (
            <Button onClick={() => setEnEdition({})}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une personne
            </Button>
          )}
        </EtatVide>
      ) : (
        <Apparait>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Personne</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Boutiques</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Téléphone
                      </TableHead>
                      <TableHead>Accès</TableHead>
                      {peutGerer && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipe.map((personne) => (
                      <TableRow key={personne.id}>
                        <TableCell>
                          <p className="font-medium">{personne.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {personne.email}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p>{libellesRoles[personne.role]}</p>
                          <p className="text-xs text-muted-foreground">
                            {descriptionsRoles[personne.role]}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(personne.boutiques_rattachees ?? []).map(
                              (boutique) => (
                                <span
                                  key={boutique.id}
                                  className="rounded-full bg-muted px-2 py-0.5 text-xs"
                                >
                                  {boutique.nom}
                                </span>
                              ),
                            )}
                            {(personne.boutiques_rattachees ?? []).length ===
                              0 && (
                              <span className="text-xs text-statut-alerte">
                                Aucune boutique
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          {personne.telephone ?? "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              personne.actif
                                ? "text-sm text-statut-ok"
                                : "text-sm text-muted-foreground"
                            }
                          >
                            {personne.actif ? "Actif" : "Désactivé"}
                          </span>
                        </TableCell>
                        {peutGerer && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setEnEdition(personne)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setASupprimer(personne)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Supprimer</span>
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </Apparait>
      )}

      <FenetreEmploye
        cible={enEdition}
        onFermer={() => setEnEdition(null)}
        onSucces={() => {
          setEnEdition(null);
          recharger();
        }}
      />

      <Dialog
        open={aSupprimer !== null}
        onOpenChange={(o) => !o && setASupprimer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Supprimer le compte de {aSupprimer?.name} ?
            </DialogTitle>
            <DialogDescription>
              Cette personne ne pourra plus se connecter. Les mouvements
              qu&apos;elle a enregistrés restent dans l&apos;historique.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setASupprimer(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => void supprimer()}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* -------------------------------------------------------------------------- */

function FenetreEmploye({
  cible,
  onFermer,
  onSucces,
}: {
  cible: Partial<Utilisateur> | null;
  onFermer: () => void;
  onSucces: () => void;
}) {
  const { boutiques } = useAuth();
  const modification = Boolean(cible?.id);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState<Role>("vendeuse");
  const [telephone, setTelephone] = useState("");
  const [actif, setActif] = useState(true);
  const [choisies, setChoisies] = useState<number[]>([]);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    if (!cible) return;
    setNom(cible.name ?? "");
    setEmail(cible.email ?? "");
    setMotDePasse("");
    setRole((cible.role as Role) ?? "vendeuse");
    setTelephone(cible.telephone ?? "");
    setActif(cible.actif ?? true);
    setChoisies((cible.boutiques_rattachees ?? []).map((b) => b.id));
    setErreurs({});
  }, [cible]);

  function basculerBoutique(id: number) {
    setChoisies((precedent) =>
      precedent.includes(id)
        ? precedent.filter((valeur) => valeur !== id)
        : [...precedent, id],
    );
  }

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    // const corps: Record<string, unknown> = {
    //   name: nom,
    //   email,
    //   role,
    //   telephone: telephone || null,
    //   actif,
    //   boutiques: choisies,
    // };

    const corps: Record<string, unknown> = modification
      ? {
          name: nom,
          email,
          role,
          telephone: telephone || null,
          actif,
          boutiques: choisies,
          ...(motDePasse ? { password: motDePasse } : {}),
        }
      : { email, role, boutiques: choisies };

    if (motDePasse) corps.password = motDePasse;

    try {
      if (modification) {
        await api.put(`/employes/${cible!.id}`, corps);
        toast.success("Compte mis à jour.");
      } else {
        await api.post("/employes", {
          email,
          role,
          boutiques: choisies,
        });
        toast.success("Invitation envoyée.");
      }
      onSucces();
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
    <Dialog open={cible !== null} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={envoyer} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>
              {modification ? "Modifier le compte" : "Nouvelle personne"}
            </DialogTitle>
            <DialogDescription>
              {modification
                ? "Laissez le mot de passe vide pour ne pas le changer."
                : "Un email d'invitation sera envoyé pour qu'elle configure son compte."}
            </DialogDescription>
          </DialogHeader>

          <DialogCorps>
            {/* <div className="space-y-2">
              <Label htmlFor="e-nom">
                Nom complet<span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="e-nom"
                required
                className="h-10"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
              {erreurs.name && (
                <p className="text-xs text-destructive">{erreurs.name}</p>
              )}
            </div> */}

            {modification && (
              <div className="space-y-2">
                <Label htmlFor="e-nom">
                  Nom complet<span className="ml-0.5 text-destructive">*</span>
                </Label>
                <Input
                  id="e-nom"
                  required
                  className="h-10"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
                {erreurs.name && (
                  <p className="text-xs text-destructive">{erreurs.name}</p>
                )}
              </div>
            )}

            <div className="grid gap-4 ">
              <div className="space-y-2">
                <Label htmlFor="e-email">
                  Email<span className="ml-0.5 text-destructive">*</span>
                </Label>
                <Input
                  id="e-email"
                  type="email"
                  required
                  className="h-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {erreurs.email && (
                  <p className="text-xs text-destructive">{erreurs.email}</p>
                )}
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="e-tel">Téléphone</Label>
                <Input
                  id="e-tel"
                  className="h-10"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                />
              </div> */}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="e-mdp">
                Mot de passe
                {!modification && (
                  <span className="ml-0.5 text-destructive">*</span>
                )}
              </Label>
              <Input
                id="e-mdp"
                type="password"
                required={!modification}
                minLength={8}
                className="h-10"
                autoComplete="new-password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder={modification ? "Inchangé" : "8 caractères minimum"}
              />
              {erreurs.password && (
                <p className="text-xs text-destructive">{erreurs.password}</p>
              )}
            </div> */}

            {/* Le rôle : deux cartes plutôt qu'une liste déroulante, pour que
                la différence entre vendeuse et secrétaire soit lisible. */}
            <div className="space-y-2">
              <Label>Rôle</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["vendeuse", "secretaire"] as const).map((valeur) => (
                  <button
                    key={valeur}
                    type="button"
                    onClick={() => setRole(valeur)}
                    className={[
                      "rounded-lg border px-3 py-2.5 text-left transition-colors",
                      role === valeur
                        ? "border-primary bg-accent"
                        : "hover:bg-muted",
                    ].join(" ")}
                  >
                    <p className="text-sm font-medium">
                      {libellesRoles[valeur]}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {descriptionsRoles[valeur]}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Boutiques accessibles
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <div className="space-y-1.5 rounded-lg border p-3">
                {boutiques.map((boutique) => (
                  <label
                    key={boutique.id}
                    className="flex cursor-pointer items-center gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input accent-primary"
                      checked={choisies.includes(boutique.id)}
                      onChange={() => basculerBoutique(boutique.id)}
                    />
                    <span className="flex-1">{boutique.nom}</span>
                    {boutique.ville && (
                      <span className="text-xs text-muted-foreground">
                        {boutique.ville}
                      </span>
                    )}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Cette personne ne verra que le stock des boutiques cochées.
              </p>
              {erreurs.boutiques && (
                <p className="text-xs text-destructive">{erreurs.boutiques}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch id="e-actif" checked={actif} onCheckedChange={setActif} />
              <Label htmlFor="e-actif" className="font-normal">
                Compte actif (peut se connecter)
              </Label>
            </div>
          </DialogCorps>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFermer}>
              Annuler
            </Button>
            <Button type="submit" disabled={envoiEnCours}>
              {envoiEnCours && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {modification ? "Enregistrer" : "Créer le compte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
