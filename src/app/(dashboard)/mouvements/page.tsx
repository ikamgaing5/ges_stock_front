"use client";

/** L'historique de tous les mouvements (/mouvements). */

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { api } from "@/lib/api";
import { useListe } from "@/lib/useListe";
import { formaterImei } from "@/lib/imei";
import {
  formaterDate,
  formaterMontant,
  libellesMouvements,
  libellesStatuts,
} from "@/lib/format";
import { useAuth } from "@/components/auth-provider";
import {
  Apparait,
  EtatErreur,
  EtatVide,
  PastilleMouvement,
  SquelettesTableau,
  TitrePage,
} from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Mouvement, Page } from "@/types";

const optionsType: Record<string, string> = {
  tous: "Tous les types",
  ...libellesMouvements,
};

export default function PageHistorique() {
  const { devise, parametresBoutique } = useAuth();

  const [type, setType] = useState("tous");
  const [du, setDu] = useState("");
  const [au, setAu] = useState("");
  const [page, setPage] = useState(1);

  const boutiqueId = parametresBoutique.boutique_id;

  const { donnees, chargement, erreur, recharger } = useListe(
    (signal) =>
      api.get<Page<Mouvement>>(
        "/mouvements",
        {
          boutique_id: boutiqueId,
          type: type === "tous" ? undefined : type,
          du: du || undefined,
          au: au || undefined,
          page,
        },
        signal,
      ),
    [boutiqueId, type, du, au, page],
  );

  const mouvements = donnees?.data ?? [];
  const nbPages = donnees?.meta.last_page ?? 1;
  const total = donnees?.meta.total ?? 0;

  const filtreActif = type !== "tous" || du || au;

  return (
    <>
      <TitrePage
        titre="Historique"
        description={`${total} mouvement(s) enregistré(s)`}
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              items={optionsType}
              value={type}
              onValueChange={(v) => {
                setType(v ?? "tous");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(optionsType).map(([valeur, libelle]) => (
                  <SelectItem key={valeur} value={valeur}>
                    {libelle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="du">Du</Label>
            <Input
              id="du"
              type="date"
              className="chiffres h-10 w-40"
              value={du}
              onChange={(e) => {
                setDu(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="au">Au</Label>
            <Input
              id="au"
              type="date"
              className="chiffres h-10 w-40"
              value={au}
              onChange={(e) => {
                setAu(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {filtreActif && (
            <Button
              variant="ghost"
              onClick={() => {
                setType("tous");
                setDu("");
                setAu("");
                setPage(1);
              }}
            >
              Réinitialiser
            </Button>
          )}
        </CardContent>
      </Card>

      {erreur ? (
        <EtatErreur message={erreur} onReessayer={recharger} />
      ) : chargement ? (
        <SquelettesTableau />
      ) : mouvements.length === 0 ? (
        <EtatVide
          icone={<ArrowLeftRight className="h-5 w-5" />}
          titre="Aucun mouvement"
          description={
            filtreActif
              ? "Aucun résultat avec ces filtres."
              : "Les entrées, ventes et transferts apparaîtront ici."
          }
        />
      ) : (
        <Apparait>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Appareil</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Statut
                      </TableHead>
                      <TableHead className="hidden md:table-cell">Par</TableHead>
                      <TableHead className="text-right">Détail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mouvements.map((mouvement) => (
                      <TableRow key={mouvement.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formaterDate(mouvement.created_at)}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/telephones/${mouvement.telephone?.id}`}
                            className="font-medium hover:underline"
                          >
                            {mouvement.telephone?.modele?.libelle ?? "Appareil"}
                          </Link>
                          {mouvement.telephone && (
                            <p className="chiffres font-mono text-xs text-muted-foreground">
                              {formaterImei(mouvement.telephone.imei)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <PastilleMouvement type={mouvement.type} />
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-xs lg:table-cell">
                          {mouvement.statut_avant && (
                            <span className="text-muted-foreground">
                              {libellesStatuts[mouvement.statut_avant]} →{" "}
                            </span>
                          )}
                          <span className="font-medium">
                            {libellesStatuts[mouvement.statut_apres]}
                          </span>
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-sm md:table-cell">
                          {mouvement.user?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {mouvement.type === "transfert" &&
                          mouvement.boutique_source ? (
                            <>
                              {mouvement.boutique_source.nom} →{" "}
                              {mouvement.boutique_destination?.nom}
                            </>
                          ) : (
                            <>
                              {mouvement.prix !== null && (
                                <span className="chiffres block font-medium text-foreground">
                                  {formaterMontant(mouvement.prix, devise)}
                                </span>
                              )}
                              {mouvement.client_nom && (
                                <span className="block">
                                  {mouvement.client_nom}
                                </span>
                              )}
                              {mouvement.motif && <span>{mouvement.motif}</span>}
                            </>
                          )}
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

      {nbPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </Button>
          <span className="chiffres text-sm text-muted-foreground">
            Page {page} sur {nbPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= nbPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </>
  );
}
