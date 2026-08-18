"use client";

/** Les boutiques du propriétaire (/boutiques). */

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { formaterNombre } from "@/lib/format";
import { useAuth } from "@/components/auth-provider";
import {
  Apparait,
  EtatErreur,
  EtatVide,
  SquelettesCartes,
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
import type { Boutique } from "@/types";

export default function PageBoutiques() {
  const { rafraichir } = useAuth();

  const [boutiques, setBoutiques] = useState<Boutique[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enEdition, setEnEdition] = useState<Partial<Boutique> | null>(null);
  const [aSupprimer, setASupprimer] = useState<Boutique | null>(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      const reponse = await api.get<{ data: Boutique[] }>("/boutiques");
      setBoutiques(reponse.data);
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : "Erreur inconnue.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  async function supprimer() {
    if (!aSupprimer) return;
    try {
      await api.delete(`/boutiques/${aSupprimer.id}`);
      toast.success("Boutique supprimée.");
      setASupprimer(null);
      void charger();
      void rafraichir();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : "Erreur inconnue.");
    }
  }

  return (
    <>
      <TitrePage
        titre="Boutiques"
        description="Vos points de vente. Chacun a son propre stock."
      >
        <Button onClick={() => setEnEdition({})}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle boutique
        </Button>
      </TitrePage>

      {erreur ? (
        <EtatErreur message={erreur} onReessayer={() => void charger()} />
      ) : chargement ? (
        <SquelettesCartes nombre={2} />
      ) : boutiques.length === 0 ? (
        <EtatVide
          icone={<Store className="h-5 w-5" />}
          titre="Aucune boutique"
          description="Créez votre premier point de vente pour commencer à saisir du stock."
        >
          <Button onClick={() => setEnEdition({})}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle boutique
          </Button>
        </EtatVide>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {boutiques.map((boutique, index) => (
            <Apparait key={boutique.id} index={index}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-4 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{boutique.nom}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {[boutique.ville, boutique.adresse]
                          .filter(Boolean)
                          .join(" · ") || "Adresse non renseignée"}
                      </p>
                    </div>
                    {!boutique.active && (
                      <span className="shrink-0 rounded-full bg-statut-neutre-fond px-2 py-0.5 text-xs text-statut-neutre">
                        Fermée
                      </span>
                    )}
                  </div>

                  <dl className="flex gap-6 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        En stock
                      </dt>
                      <dd className="chiffres mt-0.5 text-lg font-semibold">
                        {formaterNombre(boutique.nb_en_stock ?? 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Équipe</dt>
                      <dd className="chiffres mt-0.5 text-lg font-semibold">
                        {formaterNombre(boutique.nb_employes ?? 0)}
                      </dd>
                    </div>
                  </dl>

                  {boutique.telephone && (
                    <p className="chiffres text-sm text-muted-foreground">
                      {boutique.telephone}
                    </p>
                  )}

                  <div className="mt-auto flex gap-2 border-t pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEnEdition(boutique)}
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setASupprimer(boutique)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Apparait>
          ))}
        </div>
      )}

      <FenetreBoutique
        boutique={enEdition}
        onFermer={() => setEnEdition(null)}
        onSucces={() => {
          setEnEdition(null);
          void charger();
          // Le sélecteur de boutique doit refléter le changement.
          void rafraichir();
        }}
      />

      <Dialog
        open={aSupprimer !== null}
        onOpenChange={(o) => !o && setASupprimer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer « {aSupprimer?.nom} » ?</DialogTitle>
            <DialogDescription>
              Une boutique qui contient encore des appareils ne peut pas être
              supprimée. Transférez-les d&apos;abord, ou marquez simplement la
              boutique comme fermée.
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

function FenetreBoutique({
  boutique,
  onFermer,
  onSucces,
}: {
  boutique: Partial<Boutique> | null;
  onFermer: () => void;
  onSucces: () => void;
}) {
  const modification = Boolean(boutique?.id);

  const [champs, setChamps] = useState({
    nom: "",
    ville: "",
    adresse: "",
    telephone: "",
    devise: "XAF",
    active: true,
  });

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    if (!boutique) return;
    setChamps({
      nom: boutique.nom ?? "",
      ville: boutique.ville ?? "",
      adresse: boutique.adresse ?? "",
      telephone: boutique.telephone ?? "",
      devise: boutique.devise ?? "XAF",
      active: boutique.active ?? true,
    });
    setErreurs({});
  }, [boutique]);

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
      nom: champs.nom,
      ville: champs.ville || null,
      adresse: champs.adresse || null,
      telephone: champs.telephone || null,
      devise: champs.devise,
      active: champs.active,
    };

    try {
      if (modification) {
        await api.put(`/boutiques/${boutique!.id}`, corps);
        toast.success("Boutique mise à jour.");
      } else {
        await api.post("/boutiques", corps);
        toast.success("Boutique créée.");
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
    <Dialog open={boutique !== null} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent>
        <form onSubmit={envoyer} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>
              {modification ? "Modifier la boutique" : "Nouvelle boutique"}
            </DialogTitle>
          </DialogHeader>

          <DialogCorps>
            <div className="space-y-2">
              <Label htmlFor="b-nom">
                Nom<span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="b-nom"
                required
                className="h-10"
                value={champs.nom}
                onChange={(e) => modifier("nom", e.target.value)}
                placeholder="Akwa Mobile"
              />
              {erreurs.nom && (
                <p className="text-xs text-destructive">{erreurs.nom}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="b-ville">Ville</Label>
                <Input
                  id="b-ville"
                  className="h-10"
                  value={champs.ville}
                  onChange={(e) => modifier("ville", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-devise">Devise</Label>
                <Input
                  id="b-devise"
                  className="h-10"
                  value={champs.devise}
                  onChange={(e) => modifier("devise", e.target.value)}
                  placeholder="XAF, EUR, USD…"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="b-adresse">Adresse</Label>
              <Input
                id="b-adresse"
                className="h-10"
                value={champs.adresse}
                onChange={(e) => modifier("adresse", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="b-tel">Téléphone</Label>
              <Input
                id="b-tel"
                className="h-10"
                value={champs.telephone}
                onChange={(e) => modifier("telephone", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="b-active"
                checked={champs.active}
                onCheckedChange={(v) => modifier("active", v)}
              />
              <Label htmlFor="b-active" className="font-normal">
                Boutique ouverte
              </Label>
            </div>
          </DialogCorps>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFermer}>
              Annuler
            </Button>
            <Button type="submit" disabled={envoiEnCours}>
              {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {modification ? "Enregistrer" : "Créer la boutique"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
