"use client";

/** Les comptes clients et leurs abonnements (/admin/proprietaires). */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, Loader2, Search, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useListe } from "@/lib/useListe";
import {
  couleursAbonnements,
  formaterDate,
  formaterDateCourte,
  libellesAbonnements,
} from "@/lib/format";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Page, StatutAbonnement, Utilisateur } from "@/types";

const optionsStatut: Record<string, string> = {
  tous: "Tous les statuts",
  ...libellesAbonnements,
};

export default function PageClients() {
  const parametresUrl = useSearchParams();

  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState(parametresUrl.get("statut") ?? "tous");
  const [enEdition, setEnEdition] = useState<Utilisateur | null>(null);

  const { donnees, chargement, erreur, recharger } = useListe(
    (signal) =>
      api.get<Page<Utilisateur>>(
        "/admin/proprietaires",
        { recherche, statut: statut === "tous" ? undefined : statut },
        signal,
      ),
    [recherche, statut],
    { attente: 250 },
  );

  const clients = donnees?.data ?? [];

  return (
    <>
      <TitrePage
        titre="Clients"
        description="Les propriétaires inscrits sur la plateforme."
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 pl-9"
              placeholder="Nom ou email…"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>

          <Select
            items={optionsStatut}
            value={statut}
            onValueChange={(v) => setStatut(v ?? "tous")}
          >
            <SelectTrigger className="h-10 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(optionsStatut).map(([valeur, libelle]) => (
                <SelectItem key={valeur} value={valeur}>
                  {libelle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {erreur ? (
        <EtatErreur message={erreur} onReessayer={recharger} />
      ) : chargement ? (
        <SquelettesTableau />
      ) : clients.length === 0 ? (
        <EtatVide
          icone={<Building2 className="h-5 w-5" />}
          titre="Aucun client"
          description="Les propriétaires qui s'inscrivent apparaîtront ici."
        />
      ) : (
        <Apparait>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Abonnement</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Échéance
                      </TableHead>
                      <TableHead className="text-right">Boutiques</TableHead>
                      <TableHead className="text-right">Employés</TableHead>
                      <TableHead className="hidden xl:table-cell">
                        Inscrit le
                      </TableHead>
                      <TableHead className="text-right">Gérer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {client.email}
                          </p>
                          {!client.actif && (
                            <p className="text-xs text-statut-alerte">
                              Compte désactivé
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {client.abonnement?.statut ? (
                            <span
                              className={[
                                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                                couleursAbonnements[client.abonnement.statut],
                              ].join(" ")}
                            >
                              {libellesAbonnements[client.abonnement.statut]}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-sm lg:table-cell">
                          {client.abonnement?.echeance
                            ? formaterDateCourte(client.abonnement.echeance)
                            : "—"}
                        </TableCell>
                        <TableCell className="chiffres text-right">
                          {client.boutiques_possedees_count ?? 0}
                        </TableCell>
                        <TableCell className="chiffres text-right">
                          {client.employes_count ?? 0}
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground xl:table-cell">
                          {formaterDate(client.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEnEdition(client)}
                          >
                            <Settings2 className="h-4 w-4" />
                            <span className="sr-only">Gérer l&apos;abonnement</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </Apparait>
      )}

      <FenetreAbonnement
        client={enEdition}
        onFermer={() => setEnEdition(null)}
        onSucces={() => {
          setEnEdition(null);
          recharger();
        }}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */

function FenetreAbonnement({
  client,
  onFermer,
  onSucces,
}: {
  client: Utilisateur | null;
  onFermer: () => void;
  onSucces: () => void;
}) {
  const [statut, setStatut] = useState<StatutAbonnement>("actif");
  const [echeance, setEcheance] = useState("");
  const [actif, setActif] = useState(true);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    if (!client) return;
    setStatut((client.abonnement?.statut as StatutAbonnement) ?? "actif");
    setEcheance(client.abonnement?.echeance ?? "");
    setActif(client.actif);
  }, [client]);

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!client) return;

    setEnvoiEnCours(true);

    try {
      // Deux appels : l'abonnement et l'accès au compte sont deux notions
      // distinctes côté API.
      await api.put(`/admin/proprietaires/${client.id}/abonnement`, {
        statut,
        echeance: echeance || null,
      });

      if (actif !== client.actif) {
        await api.put(`/admin/proprietaires/${client.id}/acces`, { actif });
      }

      toast.success("Compte mis à jour.");
      onSucces();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : "Erreur inconnue.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Dialog open={client !== null} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent>
        <form onSubmit={envoyer} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Abonnement de {client?.name}</DialogTitle>
            <DialogDescription>
              Un abonnement suspendu ou expiré bloque l&apos;accès du client et de
              toute son équipe. Les données restent conservées.
            </DialogDescription>
          </DialogHeader>

          <DialogCorps>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                items={libellesAbonnements}
                value={statut}
                onValueChange={(v) =>
                  setStatut((v ?? "actif") as StatutAbonnement)
                }
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(libellesAbonnements).map(
                    ([valeur, libelle]) => (
                      <SelectItem key={valeur} value={valeur}>
                        {libelle}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="echeance">Échéance</Label>
              <Input
                id="echeance"
                type="date"
                className="chiffres h-10"
                value={echeance}
                onChange={(e) => setEcheance(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Passée cette date, l&apos;accès se bloque automatiquement.
              </p>
            </div>

            <div className="flex items-center gap-3 border-t pt-4">
              <Switch id="a-actif" checked={actif} onCheckedChange={setActif} />
              <Label htmlFor="a-actif" className="font-normal">
                Le compte peut se connecter
              </Label>
            </div>
          </DialogCorps>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFermer}>
              Annuler
            </Button>
            <Button type="submit" disabled={envoiEnCours}>
              {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
