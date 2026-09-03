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
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { permissions } from "@/lib/permissions";
import {
  Apparait,
  EtatErreur,
  EtatVide,
  SquelettePageTableau,
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
import { ChampTelephone } from "@/components/champ-telephone";
import { formaterTelephoneVisuel } from "@/lib/pays";
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
  const { utilisateur: moi, parametresBoutique } = useAuth();
  const { t, libelleRole, descriptionRole } = useI18n();

  const [enEdition, setEnEdition] = useState<Partial<Utilisateur> | null>(null);
  const [aSupprimer, setASupprimer] = useState<Utilisateur | null>(null);

  const { donnees, chargement, erreur, recharger } = useListe(
    (signal) =>
      api.get<{ data: Utilisateur[] }>("/employes", parametresBoutique, signal),
    [parametresBoutique],
  );

  const equipe = donnees?.data ?? [];

  async function supprimer() {
    if (!aSupprimer) return;
    try {
      await api.delete(`/employes/${aSupprimer.id}`);
      toast.success(t("equipe.compteSupprime"));
      setASupprimer(null);
      recharger();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    }
  }

  const peutGerer = moi && permissions.gererEmployes(moi.role);

  if (chargement && equipe.length === 0) {
    return (
      <SquelettePageTableau
        lignes={6}
        colonnes={6}
        avecFiltres={false}
        avecBouton={true}
      />
    );
  }

  return (
    <>
      <TitrePage
        titre={t("equipe.titre")}
        description={t("equipe.description")}
      >
        {peutGerer && (
          <Button onClick={() => setEnEdition({})}>
            <Plus className="mr-2 h-4 w-4" />
            {t("equipe.ajouterPersonne")}
          </Button>
        )}
      </TitrePage>

      {erreur ? (
        <EtatErreur message={erreur} onReessayer={recharger} />
      ) : chargement ? (
        <SquelettesTableau lignes={5} colonnes={6} />
      ) : equipe.length === 0 ? (
        <EtatVide
          icone={<Users className="h-5 w-5" />}
          titre={t("equipe.aucunMembre")}
          description={t("equipe.aucunMembreDesc")}
        >
          {peutGerer && (
            <Button onClick={() => setEnEdition({})}>
              <Plus className="mr-2 h-4 w-4" />
              {t("equipe.ajouterPersonne")}
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
                      <TableHead>{t("equipe.tableauPersonne")}</TableHead>
                      <TableHead>{t("equipe.tableauRole")}</TableHead>
                      <TableHead>{t("equipe.tableauBoutiques")}</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        {t("monCompte.telephone")}
                      </TableHead>
                      <TableHead>{t("equipe.tableauStatut")}</TableHead>
                      {peutGerer && (
                        <TableHead className="text-right">
                          {t("commun.actions")}
                        </TableHead>
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
                          <p>{libelleRole(personne.role)}</p>
                          <p className="text-xs text-muted-foreground">
                            {descriptionRole(personne.role)}
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
                                {t("equipe.aucuneBoutique")}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          {formaterTelephoneVisuel(personne.telephone) || "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              personne.actif
                                ? "text-sm text-statut-ok"
                                : "text-sm text-muted-foreground"
                            }
                          >
                            {personne.actif
                              ? t("commun.actif")
                              : t("commun.inactif")}
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
                                <span className="sr-only">
                                  {t("commun.modifier")}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setASupprimer(personne)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">
                                  {t("commun.supprimer")}
                                </span>
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
              {t("equipe.supprimerConfirmationTitre", {
                nom: aSupprimer?.name ?? "",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("equipe.supprimerConfirmationDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setASupprimer(null)}>
              {t("commun.annuler")}
            </Button>
            <Button variant="destructive" onClick={() => void supprimer()}>
              {t("commun.supprimer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
  const { t, libelleRole, descriptionRole } = useI18n();
  const modification = Boolean(cible?.id);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState<Role>("vendeuse");
  const [telephone, setTelephone] = useState("");
  const [actif, setActif] = useState(true);
  const [choisies, setChoisies] = useState<string[]>([]);
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

  function basculerBoutique(id: string) {
    setChoisies((precedent) =>
      precedent.includes(id)
        ? precedent.filter((valeur) => valeur !== id)
        : [...precedent, id],
    );
  }

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreurs({});

    const errs: Record<string, string> = {};
    if (modification && !nom.trim()) {
      errs.name = t("commun.nomRequis");
    }
    if (!email.trim()) {
      errs.email = t("commun.emailRequis");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = t("commun.emailInvalide");
    }

    if (Object.keys(errs).length > 0) {
      setErreurs(errs);
      return;
    }

    setEnvoiEnCours(true);

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
        toast.success(t("equipe.compteModifie"));
      } else {
        await api.post("/employes", {
          email,
          role,
          boutiques: choisies,
        });
        toast.success(t("equipe.invitationEnvoyee"));
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
        <form noValidate onSubmit={envoyer} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>
              {modification
                ? t("equipe.modifierCompte")
                : t("equipe.ajouterPersonne")}
            </DialogTitle>
            <DialogDescription>
              {modification
                ? t("equipe.laisserVideMdp")
                : t("equipe.invitationDesc")}
            </DialogDescription>
          </DialogHeader>

          <DialogCorps>
            {modification && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="e-nom">
                    {t("auth.nomComplet")}
                    <span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  <Input
                    id="e-nom"
                    className={`h-10 ${erreurs.name ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    value={nom}
                    onChange={(e) => {
                      setNom(e.target.value);
                      if (erreurs.name) setErreurs((prev) => ({ ...prev, name: "" }));
                    }}
                  />
                  {erreurs.name && (
                    <p className="text-xs text-destructive">{erreurs.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="e-tel">{t("monCompte.telephone")}</Label>
                  <ChampTelephone
                    id="e-tel"
                    valeur={telephone}
                    onChange={setTelephone}
                  />
                </div>
              </>
            )}

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="e-email">
                  {t("auth.email")}
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                <Input
                  id="e-email"
                  type="email"
                  className={`h-10 ${erreurs.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (erreurs.email) setErreurs((prev) => ({ ...prev, email: "" }));
                  }}
                />
                {erreurs.email && (
                  <p className="text-xs text-destructive">{erreurs.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("equipe.role")}</Label>
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
                      {libelleRole(valeur)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {descriptionRole(valeur)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                {t("equipe.boutiquesRattachees")}
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
                {t("equipe.restrictionBoutiquesDesc")}
              </p>
              {erreurs.boutiques && (
                <p className="text-xs text-destructive">{erreurs.boutiques}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch id="e-actif" checked={actif} onCheckedChange={setActif} />
              <Label htmlFor="e-actif" className="font-normal">
                {t("equipe.compteActif")}
              </Label>
            </div>
          </DialogCorps>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFermer}>
              {t("commun.annuler")}
            </Button>
            <Button type="submit" disabled={envoiEnCours}>
              {envoiEnCours && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {modification ? t("commun.enregistrer") : t("equipe.inviter")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
