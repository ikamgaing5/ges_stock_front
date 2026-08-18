"use client";

/** Le catalogue des modèles (/modeles). */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useListe } from "@/lib/useListe";
import { formaterMontant } from "@/lib/format";
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
import { Textarea } from "@/components/ui/textarea";
import type { Modele } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PageCatalogue() {
  const { devise, utilisateur, parametresBoutique } = useAuth();
  const parametresUrl = useSearchParams();

  const [recherche, setRecherche] = useState("");
  const [alertesSeules, setAlertesSeules] = useState(
    parametresUrl.get("statut") === "alerte",
  );

  const [enEdition, setEnEdition] = useState<Partial<Modele> | null>(null);
  const [aSupprimer, setASupprimer] = useState<Modele | null>(null);

  const boutiqueId = parametresBoutique.boutique_id;

  

  const { donnees, chargement, erreur, recharger } = useListe(
    (signal) =>
      api.get<{ data: Modele[] }>(
        "/modeles",
        {
          boutique_id: boutiqueId,
          recherche,
          statut: alertesSeules ? "alerte" : undefined,
        },
        signal,
      ),
    [boutiqueId, recherche, alertesSeules],
    { attente: 250 },
  );

  const modeles = donnees?.data ?? [];

  // const modeles = (donnees?.data ?? []).filter(
  //   (m) => !marqueFiltre || m.marque === marqueFiltre,
  // );

  const [marqueFiltre, setMarqueFiltre] = useState("");

  const marquesDisponibles = Array.from(
    new Set(modeles.map((m) => m.marque)),
  ).sort();

  async function supprimer() {
    if (!aSupprimer) return;
    try {
      await api.delete(`/modeles/${aSupprimer.id}`);
      toast.success("Modèle supprimé.");
      setASupprimer(null);
      recharger();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : "Erreur inconnue.");
    }
  }

  const peutSupprimer = utilisateur && permissions.supprimer(utilisateur.role);

  return (
    <>
      <TitrePage
        titre="Catalogue"
        description="Les modèles que vous vendez. Le stock se compte en appareils."
      >
        <Button onClick={() => setEnEdition({})}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau modèle
        </Button>
      </TitrePage>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 pl-9"
              placeholder="Marque ou modèle…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>

          <Select
            items={Object.fromEntries([
              ["", "Toutes les marques"],
              ...marquesDisponibles.map((m) => [m, m]),
            ])}
            value={marqueFiltre}
            onValueChange={(v) => setMarqueFiltre(v ?? "")}
          >
            <SelectTrigger className="h-10 w-44">
              <SelectValue placeholder="Toutes les marques" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les marques</SelectItem>
              {marquesDisponibles.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2.5">
            <Switch
              id="alertes"
              checked={alertesSeules}
              onCheckedChange={setAlertesSeules}
            />
            <Label htmlFor="alertes" className="font-normal">
              À réapprovisionner seulement
            </Label>
          </div>
        </CardContent>
      </Card>

      {erreur ? (
        <EtatErreur message={erreur} onReessayer={recharger} />
      ) : chargement ? (
        <SquelettesTableau />
      ) : modeles.length === 0 ? (
        <EtatVide
          icone={<BookOpen className="h-5 w-5" />}
          titre={alertesSeules ? "Aucune alerte" : "Catalogue vide"}
          description={
            alertesSeules
              ? "Tous vos modèles sont au-dessus de leur seuil."
              : "Ajoutez les modèles que vous vendez pour pouvoir enregistrer des appareils."
          }
        >
          {!alertesSeules && (
            <Button onClick={() => setEnEdition({})}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau modèle
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
                      <TableHead>Modèle</TableHead>
                      <TableHead className="hidden md:table-cell">
                        RAM
                      </TableHead>
                      <TableHead className="text-right">
                        Prix conseillé
                      </TableHead>
                      <TableHead className="text-right">En stock</TableHead>
                      <TableHead className="text-right">Seuil</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modeles.map((modele) => {
                      const stock = modele.nb_en_stock ?? 0;
                      const enAlerte = stock <= modele.seuil_alerte;

                      return (
                        <TableRow key={modele.id}>
                          <TableCell>
                            <p className="font-medium">{modele.libelle}</p>
                            {!modele.actif && (
                              <p className="text-xs text-muted-foreground">
                                Désactivé
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="hidden text-muted-foreground md:table-cell">
                            {modele.ram ?? "—"}
                          </TableCell>
                          <TableCell className="chiffres whitespace-nowrap text-right">
                            {formaterMontant(
                              modele.prix_vente_conseille,
                              devise,
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={[
                                "chiffres font-semibold",
                                stock === 0
                                  ? "text-statut-alerte"
                                  : enAlerte
                                    ? "text-statut-attente"
                                    : "",
                              ].join(" ")}
                            >
                              {stock}
                            </span>
                          </TableCell>
                          <TableCell className="chiffres text-right text-muted-foreground">
                            {modele.seuil_alerte}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setEnEdition(modele)}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Modifier</span>
                              </Button>
                              {peutSupprimer && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setASupprimer(modele)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Supprimer</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </Apparait>
      )}

      <FenetreModele
        modele={enEdition}
        devise={devise}
        onFermer={() => setEnEdition(null)}
        onSucces={() => {
          setEnEdition(null);
          recharger();
        }}
      />

      {/* <FenetreModele
        modele={enEdition}
        devise={devise}
        marquesExistantes={marquesDisponibles}
        onFermer={() => setEnEdition(null)}
        onSucces={() => {
          setEnEdition(null);
          recharger();
        }}
      /> */}
      <Dialog
        open={aSupprimer !== null}
        onOpenChange={(ouvert) => !ouvert && setASupprimer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer « {aSupprimer?.libelle} » ?</DialogTitle>
            <DialogDescription>
              Un modèle dont des appareils existent encore ne peut pas être
              supprimé. Désactivez-le plutôt : il disparaîtra des listes de
              saisie sans effacer l&apos;historique.
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

function FenetreModele({
  modele,
  devise,
  onFermer,
  onSucces,
}: {
  modele: Partial<Modele> | null;
  devise: string;
  onFermer: () => void;
  onSucces: () => void;
}) {
  const modification = Boolean(modele?.id);

  const [champs, setChamps] = useState({
    marque: "",
    nom: "",
    stockage: "",
    ram: "",
    description: "",
    prix_achat_conseille: "0",
    prix_vente_conseille: "0",
    seuil_alerte: "3",
    actif: true,
  });

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  // À chaque ouverture, on recharge les valeurs dans le formulaire.
  useEffect(() => {
    if (!modele) return;
    setChamps({
      marque: modele.marque ?? "",
      nom: modele.nom ?? "",
      stockage: modele.stockage ?? "",
      ram: modele.ram ?? "",
      description: modele.description ?? "",
      prix_achat_conseille: String(modele.prix_achat_conseille ?? 0),
      prix_vente_conseille: String(modele.prix_vente_conseille ?? 0),
      seuil_alerte: String(modele.seuil_alerte ?? 3),
      actif: modele.actif ?? true,
    });
    setErreurs({});
  }, [modele]);

  function modifier<K extends keyof typeof champs>(
    champ: K,
    valeur: (typeof champs)[K],
  ) {
    setChamps((precedent) => ({ ...precedent, [champ]: valeur }));
  }

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    const corps = {
      marque: champs.marque,
      nom: champs.nom,
      stockage: champs.stockage || null,
      ram: champs.ram || null,
      description: champs.description || null,
      prix_achat_conseille: Number(champs.prix_achat_conseille),
      prix_vente_conseille: Number(champs.prix_vente_conseille),
      seuil_alerte: Number(champs.seuil_alerte),
      actif: champs.actif,
    };

    try {
      if (modification) {
        await api.put(`/modeles/${modele!.id}`, corps);
        toast.success("Modèle mis à jour.");
      } else {
        await api.post("/modeles", corps);
        toast.success("Modèle ajouté au catalogue.");
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
    <Dialog open={modele !== null} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={envoyer} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>
              {modification ? "Modifier le modèle" : "Nouveau modèle"}
            </DialogTitle>
            <DialogDescription>
              La référence complète (marque, nom, stockage) doit être unique dans
              votre catalogue.
            </DialogDescription>
          </DialogHeader>

          <DialogCorps>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="marque">
                  Marque<span className="ml-0.5 text-destructive">*</span>
                </Label>
                <Input
                  id="marque"
                  required
                  className="h-10"
                  value={champs.marque}
                  onChange={(e) => modifier("marque", e.target.value)}
                  placeholder="Samsung, Tecno, Apple…"
                />
                {erreurs.marque && (
                  <p className="text-xs text-destructive">{erreurs.marque}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nom">
                  Modèle<span className="ml-0.5 text-destructive">*</span>
                </Label>
                <Input
                  id="nom"
                  required
                  className="h-10"
                  value={champs.nom}
                  onChange={(e) => modifier("nom", e.target.value)}
                  placeholder="Galaxy A54"
                />
                {erreurs.nom && (
                  <p className="text-xs text-destructive">{erreurs.nom}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockage">Stockage</Label>
                <Input
                  id="stockage"
                  className="h-10"
                  value={champs.stockage}
                  onChange={(e) => modifier("stockage", e.target.value)}
                  placeholder="128 Go"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ram">Mémoire vive</Label>
                <Input
                  id="ram"
                  className="h-10"
                  value={champs.ram}
                  onChange={(e) => modifier("ram", e.target.value)}
                  placeholder="8 Go"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pac">Prix d&apos;achat conseillé ({devise})</Label>
                <Input
                  id="pac"
                  type="number"
                  min={0}
                  className="chiffres h-10"
                  value={champs.prix_achat_conseille}
                  onChange={(e) =>
                    modifier("prix_achat_conseille", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pvc">Prix de vente conseillé ({devise})</Label>
                <Input
                  id="pvc"
                  type="number"
                  min={0}
                  className="chiffres h-10"
                  value={champs.prix_vente_conseille}
                  onChange={(e) =>
                    modifier("prix_vente_conseille", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seuil">Seuil d&apos;alerte</Label>
              <Input
                id="seuil"
                type="number"
                min={0}
                className="chiffres h-10 w-28"
                value={champs.seuil_alerte}
                onChange={(e) => modifier("seuil_alerte", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Une alerte apparaît quand il reste ce nombre d&apos;appareils, ou
                moins.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={2}
                value={champs.description}
                onChange={(e) => modifier("description", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="actif"
                checked={champs.actif}
                onCheckedChange={(v) => modifier("actif", v)}
              />
              <Label htmlFor="actif" className="font-normal">
                Actif (proposé à la saisie d&apos;un appareil)
              </Label>
            </div>
          </DialogCorps>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFermer}>
              Annuler
            </Button>
            <Button type="submit" disabled={envoiEnCours}>
              {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {modification ? "Enregistrer" : "Ajouter au catalogue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
