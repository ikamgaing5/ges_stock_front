"use client";

/** Le parc d'appareils (/telephones). */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Smartphone } from "lucide-react";
import { api } from "@/lib/api";
import { useListe } from "@/lib/useListe";
import { formaterImei } from "@/lib/imei";
import { formaterDate, formaterMontant, libellesEtats } from "@/lib/format";
import { useAuth } from "@/components/auth-provider";
import {
  Apparait,
  EtatErreur,
  EtatVide,
  PastilleStatut,
  SquelettesTableau,
  TitrePage,
} from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import type { Modele, Page, Telephone } from "@/types";

const optionsStatut: Record<string, string> = {
  tous: "Tous les statuts",
  en_stock: "En stock",
  reserve: "Réservés",
  vendu: "Vendus",
  sav: "En réparation",
  perdu: "Perdus",
};

export default function PageParc() {
  const { devise, boutiqueActive, parametresBoutique } = useAuth();
  const parametresUrl = useSearchParams();

  const [modeles, setModeles] = useState<Modele[]>([]);

  // Le tableau de bord renvoie ici avec un statut pré-filtré.
  const [statut, setStatut] = useState(parametresUrl.get("statut") ?? "en_stock");
  const [recherche, setRecherche] = useState("");
  const [modeleId, setModeleId] = useState("tous");
  const [page, setPage] = useState(1);

  const boutiqueId = parametresBoutique.boutique_id;

  // `useListe` attend 300 ms après la dernière frappe, et annule la
  // recherche précédente : deux réponses ne peuvent plus se doubler et
  // afficher un résultat qui ne correspond plus à la saisie.
  const { donnees, chargement, erreur, recharger } = useListe(
    (signal) =>
      api.get<Page<Telephone>>(
        "/telephones",
        {
          boutique_id: boutiqueId,
          recherche,
          statut: statut === "tous" ? undefined : statut,
          modele_id: modeleId === "tous" ? undefined : modeleId,
          page,
        },
        signal,
      ),
    [boutiqueId, recherche, statut, modeleId, page],
    { attente: 300 },
  );

  const appareils = donnees?.data ?? [];
  const nbPages = donnees?.meta.last_page ?? 1;
  const total = donnees?.meta.total ?? 0;

  useEffect(() => {
    const controleur = new AbortController();

    api
      .get<{ data: Modele[] }>(
        "/modeles",
        { boutique_id: boutiqueId },
        controleur.signal,
      )
      .then((r) => setModeles(r.data))
      .catch(() => setModeles([]));

    return () => controleur.abort();
  }, [boutiqueId]);

  const optionsModeles: Record<string, string> = {
    tous: "Tous les modèles",
    ...Object.fromEntries(modeles.map((m) => [String(m.id), m.libelle])),
  };

  return (
    <>
      <TitrePage
        titre="Parc d'appareils"
        description={
          boutiqueActive
            ? `${total} appareil(s) — ${boutiqueActive.nom}`
            : `${total} appareil(s), toutes boutiques`
        }
      >
        <Button nativeButton={false}
        render={<Link href="/telephones/nouveau" />}>
          <Smartphone className="mr-2 h-4 w-4" />
          Ajouter un appareil
        </Button>
      </TitrePage>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 pl-9"
              placeholder="IMEI, numéro de série, modèle, client…"
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            items={optionsStatut}
            value={statut}
            onValueChange={(v) => {
              setStatut(v ?? "tous");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-44">
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

          <Select
            items={optionsModeles}
            value={modeleId}
            onValueChange={(v) => {
              setModeleId(v ?? "tous");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(optionsModeles).map(([valeur, libelle]) => (
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
      ) : appareils.length === 0 ? (
        <EtatVide
          icone={<Smartphone className="h-5 w-5" />}
          titre="Aucun appareil"
          description={
            recherche
              ? "Aucun résultat pour cette recherche. Vérifiez l'IMEI ou changez les filtres."
              : "Enregistrez votre premier appareil en scannant son IMEI."
          }
        >
          <Button nativeButton={false}
        render={<Link href="/telephones/nouveau" />}>
            <Smartphone className="mr-2 h-4 w-4" />
            Ajouter un appareil
          </Button>
        </EtatVide>
      ) : (
        <Apparait>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appareil</TableHead>
                      <TableHead>IMEI</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Boutique
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        État
                      </TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="hidden xl:table-cell">
                        Entré le
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appareils.map((appareil) => (
                      <TableRow key={appareil.id}>
                        <TableCell>
                          <Link
                            href={`/telephones/${appareil.id}`}
                            className="font-medium hover:underline"
                          >
                            {appareil.modele?.libelle ?? "Modèle inconnu"}
                          </Link>
                          {appareil.couleur && (
                            <p className="text-xs text-muted-foreground">
                              {appareil.couleur}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="chiffres whitespace-nowrap font-mono text-xs">
                          {formaterImei(appareil.imei)}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          {appareil.boutique?.nom ?? "—"}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {libellesEtats[appareil.etat]}
                        </TableCell>
                        <TableCell className="chiffres whitespace-nowrap text-right">
                          {formaterMontant(
                            appareil.prix_vente_reel ?? appareil.prix_vente,
                            devise,
                          )}
                        </TableCell>
                        <TableCell>
                          <PastilleStatut statut={appareil.statut} />
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground xl:table-cell">
                          {appareil.entre_le
                            ? formaterDate(appareil.entre_le)
                            : "—"}
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
