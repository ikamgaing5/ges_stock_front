"use client";

/** Le catalogue des modèles (/modeles). */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
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
import { SelectRecherche } from "@/components/ui/select-recherche";
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
import type { Gamme, Marque, Modele, ModeleStockage } from "@/types";

export default function PageCatalogue() {
  const { devise, deviseBoutique, utilisateur, parametresBoutique } = useAuth();
  const { t, formatMontant, lang } = useI18n();
  const parametresUrl = useSearchParams();

  const [recherche, setRecherche] = useState("");
  const [alertesSeules, setAlertesSeules] = useState(
    parametresUrl.get("statut") === "alerte",
  );
  const [marqueFiltre, setMarqueFiltre] = useState("");

  const [marques, setMarques] = useState<Marque[]>([]);
  const [enEdition, setEnEdition] = useState<Partial<Modele> | null>(null);
  const [aSupprimer, setASupprimer] = useState<Modele | null>(null);
  const [marqueOuverte, setMarqueOuverte] = useState(false);
  const [gammeOuverte, setGammeOuverte] = useState(false);

  const boutiqueId = parametresBoutique.boutique_id;

  function chargerMarques() {
    api
      .get<{ data: Marque[] }>("/marques")
      .then((r) => setMarques(r.data))
      .catch(() => setMarques([]));
  }

  useEffect(() => {
    chargerMarques();
  }, []);

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

  const modeles = (donnees?.data ?? []).filter(
    (m) => !marqueFiltre || m.gamme.marque.id === marqueFiltre,
  );

  async function supprimer() {
    if (!aSupprimer) return;
    try {
      await api.delete(`/modeles/${aSupprimer.id}`);
      toast.success(lang === "en" ? "Model deleted." : "Modèle supprimé.");
      setASupprimer(null);
      recharger();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    }
  }

  const peutSupprimer = utilisateur && permissions.supprimer(utilisateur.role);

  return (
    <>
      <TitrePage
        titre={t("modeles.titre")}
        description={t("modeles.description")}
      >
        {utilisateur?.role !== "vendeuse" && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setMarqueOuverte(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("modeles.ajouterMarque")}
            </Button>
            <Button variant="outline" onClick={() => setGammeOuverte(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("modeles.ajouterGamme")}
            </Button>
            <Button onClick={() => setEnEdition({})}>
              <Plus className="mr-2 h-4 w-4" />
              {t("modeles.ajouterModele")}
            </Button>
          </div>
        )}
      </TitrePage>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 pl-9"
              placeholder={lang === "en" ? "Brand or model..." : "Marque ou modèle…"}
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>

          <div className="w-48">
            <SelectRecherche
              options={[
                {
                  valeur: "",
                  libelle: lang === "en" ? "All brands" : "Toutes les marques",
                },
                ...marques.map((m) => ({ valeur: m.id, libelle: m.nom })),
              ]}
              valeur={marqueFiltre}
              onChange={(v) => setMarqueFiltre(v)}
              placeholder={
                lang === "en" ? "All brands" : "Toutes les marques"
              }
              placeholderRecherche={
                lang === "en" ? "Search brand..." : "Rechercher une marque…"
              }
            />
          </div>

          <div className="flex items-center gap-2.5">
            <Switch
              id="alertes"
              checked={alertesSeules}
              onCheckedChange={setAlertesSeules}
            />
            <Label htmlFor="alertes" className="font-normal">
              {lang === "en"
                ? "Restock alerts only"
                : "À réapprovisionner seulement"}
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
          titre={
            alertesSeules
              ? t("dashboard.aucuneAlerte")
              : t("modeles.aucunModele")
          }
          description={
            alertesSeules
              ? t("dashboard.alertesDesc")
              : t("modeles.aucunModeleDesc")
          }
        >
          {!alertesSeules && (
            <Button onClick={() => setEnEdition({})}>
              <Plus className="mr-2 h-4 w-4" />
              {t("modeles.ajouterModele")}
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
                      <TableHead>{t("modeles.nomModele")}</TableHead>
                      <TableHead className="text-right">
                        {t("modeles.prixVenteConseille")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("modeles.enStock")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("modeles.seuilAlerte")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("commun.actions")}
                      </TableHead>
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
                                {t("commun.inactif")}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="chiffres whitespace-nowrap text-right">
                            {formatMontant(
                              modele.prix_vente_conseille,
                              devise,
                              deviseBoutique,
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
                                <span className="sr-only">
                                  {t("commun.modifier")}
                                </span>
                              </Button>
                              {peutSupprimer && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setASupprimer(modele)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">
                                    {t("commun.supprimer")}
                                  </span>
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
        marques={marques}
        onFermer={() => setEnEdition(null)}
        onSucces={() => {
          setEnEdition(null);
          recharger();
        }}
      />

      <FenetreMarque
        ouverte={marqueOuverte}
        onFermer={() => setMarqueOuverte(false)}
        onSucces={() => {
          setMarqueOuverte(false);
          chargerMarques();
        }}
      />

      <FenetreGamme
        ouverte={gammeOuverte}
        marques={marques}
        onFermer={() => setGammeOuverte(false)}
        onSucces={() => setGammeOuverte(false)}
      />

      <Dialog
        open={aSupprimer !== null}
        onOpenChange={(ouvert) => !ouvert && setASupprimer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lang === "en"
                ? `Delete "${aSupprimer?.libelle}"?`
                : `Supprimer « ${aSupprimer?.libelle} » ?`}
            </DialogTitle>
            <DialogDescription>
              {lang === "en"
                ? "A model with existing registered devices cannot be deleted. Deactivate it instead so it hides from intake lists while preserving history."
                : "Un modèle dont des appareils existent encore ne peut pas être supprimé. Désactivez-le plutôt : il disparaîtra des listes de saisie sans effacer l'historique."}
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

function FenetreModele({
  modele,
  devise,
  marques,
  onFermer,
  onSucces,
}: {
  modele: Partial<Modele> | null;
  devise: string;
  marques: Marque[];
  onFermer: () => void;
  onSucces: () => void;
}) {
  const { t, lang } = useI18n();
  const modification = Boolean(modele?.id);

  const [marqueId, setMarqueId] = useState("");
  const [gammes, setGammes] = useState<Gamme[]>([]);

  const [champs, setChamps] = useState({
    gamme_id: "",
    nom: "",
    ram: "",
    description: "",
    prix_achat_conseille: "0",
    prix_vente_conseille: "0",
    seuil_alerte: "3",
    actif: true,
  });

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    if (!marqueId) {
      setGammes([]);
      return;
    }
    api
      .get<{ data: Gamme[] }>("/gammes", { marque_id: marqueId })
      .then((r) => setGammes(r.data))
      .catch(() => setGammes([]));
  }, [marqueId]);

  useEffect(() => {
    if (!modele) return;

    setMarqueId(modele.gamme?.marque.id ?? "");
    setChamps({
      gamme_id: modele.gamme?.id ?? "",
      nom: modele.nom ?? "",
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

  function choisirMarque(id: string) {
    setMarqueId(id);
    modifier("gamme_id", "");
  }

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreurs({});

    const errs: Record<string, string> = {};
    if (!champs.gamme_id) {
      errs.gamme_id = lang === "en" ? "Please choose a range." : "Veuillez choisir une gamme.";
    }
    if (!champs.nom.trim()) {
      errs.nom = lang === "en" ? "Please enter the model name." : "Veuillez renseigner le nom du modèle.";
    }
    if (Object.keys(errs).length > 0) {
      setErreurs(errs);
      return;
    }

    setEnvoiEnCours(true);

    const corps = {
      gamme_id: champs.gamme_id,
      nom: champs.nom,
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
        toast.success(lang === "en" ? "Model updated." : "Modèle mis à jour.");
      } else {
        await api.post("/modeles", corps);
        toast.success(t("modeles.modeleCree"));
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
        <form noValidate onSubmit={envoyer} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>
              {modification
                ? lang === "en"
                  ? "Edit Model"
                  : "Modifier le modèle"
                : t("modeles.ajouterModele")}
            </DialogTitle>
            <DialogDescription>
              {lang === "en"
                ? "Full reference (brand, range, model) must be unique in your catalog."
                : "La référence complète (marque, gamme, nom) doit être unique dans votre catalogue."}
            </DialogDescription>
          </DialogHeader>

          <DialogCorps>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  {t("modeles.marques")}
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                <SelectRecherche
                  options={marques.map((m) => ({ valeur: m.id, libelle: m.nom }))}
                  valeur={marqueId}
                  onChange={(v) => choisirMarque(v)}
                  placeholder={
                    lang === "en" ? "Choose brand" : "Choisir la marque"
                  }
                  placeholderRecherche={
                    lang === "en" ? "Search brand..." : "Rechercher une marque…"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  {t("modeles.gammes")}
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                <SelectRecherche
                  options={gammes.map((g) => ({ valeur: g.id, libelle: g.nom }))}
                  valeur={champs.gamme_id}
                  onChange={(v) => {
                    modifier("gamme_id", v);
                    if (erreurs.gamme_id) {
                      setErreurs((prev) => {
                        const copy = { ...prev };
                        delete copy.gamme_id;
                        return copy;
                      });
                    }
                  }}
                  disabled={!marqueId}
                  erreur={Boolean(erreurs.gamme_id)}
                  placeholder={
                    marqueId
                      ? lang === "en"
                        ? "Choose range"
                        : "Choisir la gamme"
                      : lang === "en"
                        ? "Choose brand first"
                        : "Choisissez d'abord la marque"
                  }
                  placeholderRecherche={
                    lang === "en" ? "Search range..." : "Rechercher une gamme…"
                  }
                />
                {erreurs.gamme_id && (
                  <p className="text-xs text-destructive">{erreurs.gamme_id}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nom">
                  {t("telephones.modele")}
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                <Input
                  id="nom"
                  className={`h-10 ${erreurs.nom ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  value={champs.nom}
                  onChange={(e) => {
                    modifier("nom", e.target.value);
                    if (erreurs.nom) {
                      setErreurs((prev) => {
                        const copy = { ...prev };
                        delete copy.nom;
                        return copy;
                      });
                    }
                  }}
                  placeholder="14 Pro Max"
                />
                {erreurs.nom && (
                  <p className="text-xs text-destructive">{erreurs.nom}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ram">RAM</Label>
                <Input
                  id="ram"
                  className="h-10"
                  value={champs.ram}
                  onChange={(e) => modifier("ram", e.target.value)}
                  placeholder="8 Go"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pac">
                  {t("modeles.prixAchatConseille")} ({devise})
                </Label>
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
                <Label htmlFor="pvc">
                  {t("modeles.prixVenteConseille")} ({devise})
                </Label>
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
              <Label htmlFor="seuil">{t("modeles.seuilAlerte")}</Label>
              <Input
                id="seuil"
                type="number"
                min={0}
                className="chiffres h-10 w-28"
                value={champs.seuil_alerte}
                onChange={(e) => modifier("seuil_alerte", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t("modeles.seuilAlerteDesc")}
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

            {modification && modele?.id && (
              <GestionStockages
                modeleId={String(modele.id)}
                stockagesInitiaux={modele.stockages ?? []}
              />
            )}

            <div className="flex items-center gap-3">
              <Switch
                id="actif"
                checked={champs.actif}
                onCheckedChange={(v) => modifier("actif", v)}
              />
              <Label htmlFor="actif" className="font-normal">
                {lang === "en"
                  ? "Active (available during device intake)"
                  : "Actif (proposé à la saisie d'un appareil)"}
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
              {modification
                ? t("commun.enregistrer")
                : lang === "en"
                  ? "Add to catalog"
                  : "Ajouter au catalogue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GestionStockages({
  modeleId,
  stockagesInitiaux,
}: {
  modeleId: string;
  stockagesInitiaux: ModeleStockage[];
}) {
  const { t, lang } = useI18n();
  const [stockages, setStockages] =
    useState<ModeleStockage[]>(stockagesInitiaux);
  const [nouveau, setNouveau] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function ajouter() {
    if (!nouveau.trim()) return;
    setEnvoi(true);
    try {
      const r = await api.post<{ data: ModeleStockage }>(
        `/modeles/${modeleId}/stockages`,
        { valeur: nouveau.trim() },
      );
      setStockages((precedent) => [...precedent, r.data]);
      setNouveau("");
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setEnvoi(false);
    }
  }

  async function retirer(id: string) {
    try {
      await api.delete(`/modeles/${modeleId}/stockages/${id}`);
      setStockages((precedent) => precedent.filter((s) => s.id !== id));
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    }
  }

  return (
    <div className="space-y-2">
      <Label>{t("modeles.capacitesStockage")}</Label>
      <div className="flex flex-wrap gap-2">
        {stockages.map((s) => (
          <span
            key={s.id}
            className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
          >
            {s.valeur}
            <button
              type="button"
              onClick={() => void retirer(s.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {stockages.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {lang === "en"
              ? "No storage capacity added yet."
              : "Aucun stockage pour l'instant."}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          className="h-9"
          value={nouveau}
          onChange={(e) => setNouveau(e.target.value)}
          placeholder="256 Go"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={envoi}
          onClick={() => void ajouter()}
        >
          {t("commun.ajouter")}
        </Button>
      </div>
    </div>
  );
}

function FenetreMarque({
  ouverte,
  onFermer,
  onSucces,
}: {
  ouverte: boolean;
  onFermer: () => void;
  onSucces: () => void;
}) {
  const { t, lang } = useI18n();
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    if (ouverte) {
      setNom("");
      setErreur(null);
    }
  }, [ouverte]);

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreur(null);

    if (!nom.trim()) {
      setErreur(
        lang === "en"
          ? "Please enter the brand name."
          : "Veuillez renseigner le nom de la marque.",
      );
      return;
    }

    setEnvoiEnCours(true);

    try {
      await api.post("/marques", { nom });
      toast.success(t("modeles.marqueCreee"));
      onSucces();
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreur(e.erreurDe("nom") ?? e.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Dialog open={ouverte} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-sm">
        <form noValidate onSubmit={envoyer}>
          <DialogHeader>
            <DialogTitle>{t("modeles.ajouterMarque")}</DialogTitle>
            <DialogDescription>
              {lang === "en"
                ? "Available across all models in your catalog."
                : "Elle sera disponible pour tous les modèles de votre catalogue."}
            </DialogDescription>
          </DialogHeader>

          <DialogCorps>
            <div className="space-y-2">
              <Label htmlFor="nom-marque">
                {t("modeles.nomMarque")}
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="nom-marque"
                autoFocus
                className={`h-10 ${erreur ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                value={nom}
                onChange={(e) => {
                  setNom(e.target.value);
                  if (erreur) setErreur(null);
                }}
                placeholder="Samsung, Apple, Tecno…"
              />
              {erreur && <p className="text-xs text-destructive">{erreur}</p>}
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
              {lang === "en" ? "Create" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FenetreGamme({
  ouverte,
  marques,
  onFermer,
  onSucces,
}: {
  ouverte: boolean;
  marques: Marque[];
  onFermer: () => void;
  onSucces: () => void;
}) {
  const { t, lang } = useI18n();
  const [marqueId, setMarqueId] = useState("");
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    if (ouverte) {
      setMarqueId("");
      setNom("");
      setErreur(null);
    }
  }, [ouverte]);

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    setErreur(null);

    if (!marqueId) {
      setErreur(
        lang === "en"
          ? "Please choose a brand."
          : "Veuillez choisir une marque.",
      );
      return;
    }
    if (!nom.trim()) {
      setErreur(
        lang === "en"
          ? "Please enter the range name."
          : "Veuillez renseigner le nom de la gamme.",
      );
      return;
    }

    setEnvoiEnCours(true);

    try {
      await api.post("/gammes", { marque_id: marqueId, nom });
      toast.success(t("modeles.gammeCreee"));
      onSucces();
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreur(e.erreurDe("nom") ?? e.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Dialog open={ouverte} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-sm">
        <form noValidate onSubmit={envoyer}>
          <DialogHeader>
            <DialogTitle>{t("modeles.ajouterGamme")}</DialogTitle>
            <DialogDescription>
              {lang === "en"
                ? "e.g. iPhone, Galaxy S, Redmi Note..."
                : "Ex: iPhone, Galaxy S, MacBook…"}
            </DialogDescription>
          </DialogHeader>

          <DialogCorps>
            <div className="space-y-2">
              <Label>
                {t("modeles.marques")}
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <SelectRecherche
                options={marques.map((m) => ({ valeur: m.id, libelle: m.nom }))}
                valeur={marqueId}
                onChange={(v) => {
                  setMarqueId(v);
                  if (erreur) setErreur(null);
                }}
                placeholder={
                  lang === "en" ? "Choose brand" : "Choisir la marque"
                }
                placeholderRecherche={
                  lang === "en" ? "Search brand..." : "Rechercher une marque…"
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom-gamme">
                {t("modeles.nomGamme")}
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="nom-gamme"
                className={`h-10 ${erreur ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                value={nom}
                onChange={(e) => {
                  setNom(e.target.value);
                  if (erreur) setErreur(null);
                }}
                placeholder="iPhone"
              />
              {erreur && <p className="text-xs text-destructive">{erreur}</p>}
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
              {lang === "en" ? "Create" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
