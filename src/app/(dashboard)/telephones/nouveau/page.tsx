"use client";

/**
 * Entrée de stock (/telephones/nouveau).
 *
 * Pensé pour l'arrivage : on scanne, on valide, le champ IMEI se vide et
 * reprend le focus pour l'appareil suivant. Les autres champs (modèle,
 * couleur, prix) restent remplis d'un appareil à l'autre : dans un carton,
 * ils sont presque toujours identiques.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { imeiValide } from "@/lib/imei";
import { formaterImei } from "@/lib/imei";
import { libellesEtats } from "@/lib/format";
import { useAuth } from "@/components/auth-provider";
import { ChampImei } from "@/components/champ-imei";
import { Apparait, TitrePage } from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EtatTelephone, Marque, Modele, Telephone } from "@/types";

export default function PageEntreeStock() {
  const { boutiques, boutiqueActive } = useAuth();
  console.log("Liste des boutiques", boutiques);

  const [modeles, setModeles] = useState<Modele[]>([]);
  const [imei, setImei] = useState("");
  const [ajoutes, setAjoutes] = useState<Telephone[]>([]);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const [marques, setMarques] = useState<Marque[]>([]);
  const [marqueChoisie, setMarqueChoisie] = useState("");

  // Ces champs sont conservés d'un appareil à l'autre.
  const [commun, setCommun] = useState({
    modele_id: "",
    boutique_id: boutiqueActive ? String(boutiqueActive.id) : "",
    couleur: "",
    etat: "neuf" as EtatTelephone,
    prix_achat: "",
    prix_vente: "",
    fournisseur: "",
    notes: "",
  });

  useEffect(() => {
    api
      .get<{ data: Marque[] }>("/marques")
      .then((r) => setMarques(r.data))
      .catch(() => setMarques([]));
  }, []);

  useEffect(() => {
    api
      .get<{ data: Modele[] }>("/modeles", { actifs_seulement: true })
      .then((r) => setModeles(r.data))
      .catch(() => setModeles([]));
  }, []);

  const modelesFiltres = marqueChoisie
    ? modeles.filter((m) => m.marque.id === marqueChoisie)
    : [];

  function choisirMarque(id: string) {
    setMarqueChoisie(id);
    setCommun((precedent) => ({ ...precedent, modele_id: "" }));
  }

  // Si une seule boutique est accessible, elle est choisie d'office.
  useEffect(() => {
    if (!commun.boutique_id && boutiques.length === 1) {
      setCommun((p) => ({ ...p, boutique_id: String(boutiques[0].id) }));
    }
  }, [boutiques, commun.boutique_id]);

  function modifier(champ: keyof typeof commun, valeur: string) {
    setCommun((precedent) => ({ ...precedent, [champ]: valeur }));
  }

  /** Reprend les prix conseillés du modèle choisi, s'ils sont vides. */
  function choisirModele(id: string) {
    const modele = modeles.find((m) => String(m.id) === id);

    setCommun((precedent) => ({
      ...precedent,
      modele_id: id,
      prix_achat:
        precedent.prix_achat || String(modele?.prix_achat_conseille ?? ""),
      prix_vente:
        precedent.prix_vente || String(modele?.prix_vente_conseille ?? ""),
    }));
  }

  const enregistrer = useCallback(
    async (imeiScanne: string) => {
      if (!commun.modele_id) {
        toast.error("Choisissez d'abord le modèle.");
        return;
      }

      setErreurs({});
      setEnvoiEnCours(true);

      try {
        const reponse = await api.post<{ data: Telephone }>("/telephones", {
          modele_id: String(commun.modele_id),
          boutique_id: commun.boutique_id || undefined,
          imei: imeiScanne,
          couleur: commun.couleur || null,
          etat: commun.etat,
          prix_achat: commun.prix_achat ? Number(commun.prix_achat) : null,
          prix_vente: commun.prix_vente ? Number(commun.prix_vente) : null,
          fournisseur: commun.fournisseur || null,
          notes: commun.notes || null,
        });

        setAjoutes((precedent) => [reponse.data, ...precedent]);
        setImei("");
        toast.success("Appareil ajouté au stock.");
      } catch (e) {
        if (e instanceof ErreurApi) {
          setErreurs(e.parChamp());
          toast.error(e.resume());
        }
      } finally {
        setEnvoiEnCours(false);
      }
    },
    [commun],
  );

  const pret = Boolean(commun.modele_id) && imeiValide(imei);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        nativeButton={false}
        render={<Link href="/telephones" />}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour au parc
      </Button>

      <TitrePage
        titre="Entrée de stock"
        description="Scannez l'IMEI de chaque appareil. Les autres champs restent remplis pour le suivant."
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Apparait>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">L&apos;appareil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <ChampImei
                valeur={imei}
                onChange={setImei}
                onScanValide={(valeur) => void enregistrer(valeur)}
                erreur={erreurs.imei}
              />

              <div className="space-y-2">
                <Label>
                  Modèle<span className="ml-0.5 text-destructive">*</span>
                </Label>
                <Select
                  items={Object.fromEntries(
                    modeles.map((m) => [String(m.id), m.libelle]),
                  )}
                  value={commun.modele_id}
                  onValueChange={(v) => choisirModele(v ?? "")}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Choisir dans le catalogue" />
                  </SelectTrigger>
                  <SelectContent>
                    {modeles.map((modele) => (
                      <SelectItem key={modele.id} value={String(modele.id)}>
                        {modele.libelle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {modeles.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Votre catalogue est vide.{" "}
                    <Link
                      href="/modeles"
                      className="font-medium text-primary underline underline-offset-4"
                    >
                      Ajoutez un modèle
                    </Link>{" "}
                    avant d&apos;enregistrer un appareil.
                  </p>
                )}
                {erreurs.modele_id && (
                  <p className="text-xs text-destructive">{erreurs.modele_id}</p>
                )}
              </div>

              {boutiques.length > 1 && (
                <div className="space-y-2">
                  <Label>
                    Boutique<span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  <Select
                    items={Object.fromEntries(
                      boutiques.map((b) => [String(b.id), b.nom]),
                    )}
                    value={commun.boutique_id}
                    onValueChange={(v) => modifier("boutique_id", v ?? "")}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Où entre cet appareil ?" />
                    </SelectTrigger>
                    <SelectContent>
                      {boutiques.map((boutique) => (
                        <SelectItem key={boutique.id} value={String(boutique.id)}>
                          {boutique.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {erreurs.boutique_id && (
                    <p className="text-xs text-destructive">
                      {erreurs.boutique_id}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="couleur">Couleur</Label>
                  <Input
                    id="couleur"
                    className="h-10"
                    value={commun.couleur}
                    onChange={(e) => modifier("couleur", e.target.value)}
                    placeholder="Noir, Bleu…"
                  />
                </div>

                <div className="space-y-2">
                  <Label>État</Label>
                  <Select
                    items={libellesEtats}
                    value={commun.etat}
                    onValueChange={(v) =>
                      modifier("etat", (v ?? "neuf") as EtatTelephone)
                    }
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(libellesEtats).map(([valeur, libelle]) => (
                        <SelectItem key={valeur} value={valeur}>
                          {libelle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prix-achat">Prix d&apos;achat</Label>
                  <Input
                    id="prix-achat"
                    type="number"
                    min={0}
                    className="chiffres h-10"
                    value={commun.prix_achat}
                    onChange={(e) => modifier("prix_achat", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prix-vente">Prix de vente</Label>
                  <Input
                    id="prix-vente"
                    type="number"
                    min={0}
                    className="chiffres h-10"
                    value={commun.prix_vente}
                    onChange={(e) => modifier("prix_vente", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fournisseur">Fournisseur</Label>
                <Input
                  id="fournisseur"
                  className="h-10"
                  value={commun.fournisseur}
                  onChange={(e) => modifier("fournisseur", e.target.value)}
                  placeholder="Import Dubaï, grossiste local…"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={commun.notes}
                  onChange={(e) => modifier("notes", e.target.value)}
                />
              </div>

              <Button
                type="button"
                size="lg"
                className="w-full"
                disabled={!pret || envoiEnCours}
                onClick={() => void enregistrer(imei)}
              >
                {envoiEnCours ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PackagePlus className="mr-2 h-4 w-4" />
                )}
                Ajouter au stock
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Avec une douchette, l&apos;enregistrement se fait tout seul au
                scan.
              </p>
            </CardContent>
          </Card>
        </Apparait>

        {/* Ce qui vient d'être enregistré, pour vérifier d'un coup d'œil */}
        <Apparait index={1}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">
                Enregistrés dans cette session
                {ajoutes.length > 0 && (
                  <span className="chiffres ml-2 text-muted-foreground">
                    {ajoutes.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ajoutes.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Les appareils ajoutés apparaîtront ici au fur et à mesure.
                </p>
              ) : (
                <ul className="divide-y">
                  {ajoutes.map((appareil, index) => (
                    <li key={appareil.id}>
                      <Link
                        href={`/telephones/${appareil.id}`}
                        className="flex items-center gap-3 py-2.5"
                        style={{ "--index": index } as React.CSSProperties}
                      >
                        <Check className="h-4 w-4 shrink-0 text-statut-ok" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {appareil.modele?.libelle}
                          </p>
                          <p className="chiffres truncate font-mono text-xs text-muted-foreground">
                            {formaterImei(appareil.imei)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Apparait>
      </div>
    </>
  );
}
