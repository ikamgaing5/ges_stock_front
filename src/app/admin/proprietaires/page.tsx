"use client";

/** Les comptes clients et leurs abonnements (/admin/proprietaires). */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, Loader2, Search, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useListe } from "@/lib/useListe";
import { useI18n } from "@/lib/i18n";
import { couleursAbonnements } from "@/lib/format";
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
import type { Page, PlanAbonnement, StatutAbonnement, Utilisateur } from "@/types";

export default function PageClients() {
  const { t, formatDate, formatDateCourte, libelleAbonnement, lang } = useI18n();
  const parametresUrl = useSearchParams();

  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState(parametresUrl.get("statut") ?? "tous");
  const [enEdition, setEnEdition] = useState<Utilisateur | null>(null);

  const statutsDispo: StatutAbonnement[] = ["essai", "actif", "suspendu", "expire"];

  const optionsStatut: Record<string, string> = {
    tous: t("admin.tousStatuts"),
    ...Object.fromEntries(
      statutsDispo.map((s) => [s, libelleAbonnement(s)]),
    ),
  };

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

  if (!donnees) {
    return (
      <SquelettePageTableau
        lignes={6}
        colonnes={6}
        selectsFiltre={1}
        avecBouton={false}
      />
    );
  }

  return (
    <>
      <TitrePage
        titre={t("admin.clients")}
        chargement={chargement}
        description={t("admin.clientsDesc")}
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-2.5 p-3 sm:gap-3 sm:p-5">
          <div className="relative min-w-44 flex-1 basis-full sm:basis-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 sm:h-10 pl-9"
              placeholder={t("admin.recherchePlaceholder")}
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>

          <Select
            items={optionsStatut}
            value={statut}
            onValueChange={(v) => setStatut(v ?? "tous")}
          >
            <SelectTrigger className="h-9 sm:h-10 w-full sm:w-48">
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
        <SquelettesTableau lignes={6} colonnes={6} />
      ) : clients.length === 0 ? (
        <EtatVide
          icone={<Building2 className="h-5 w-5" />}
          titre={t("admin.aucunClient")}
          description={t("admin.aucunClientDesc")}
        />
      ) : (
        <Apparait>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.tableauNom")}</TableHead>
                      <TableHead>{t("admin.tableauAbonnement")}</TableHead>
                      <TableHead className="hidden lg:table-cell">
                        {t("admin.tableauEcheance")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("telephones.boutique")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("equipe.titre")}
                      </TableHead>
                      <TableHead className="hidden xl:table-cell">
                        {lang === "en" ? "Registered on" : "Inscrit le"}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("commun.actions")}
                      </TableHead>
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
                              {lang === "en"
                                ? "Account disabled"
                                : "Compte désactivé"}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {client.abonnement?.statut ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={[
                                  "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                                  couleursAbonnements[client.abonnement.statut],
                                ].join(" ")}
                              >
                                {libelleAbonnement(client.abonnement.statut)}
                              </span>
                              {client.abonnement.plan === "premium" && (
                                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                  Premium
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-sm lg:table-cell">
                          {client.abonnement?.echeance
                            ? formatDateCourte(client.abonnement.echeance)
                            : "—"}
                        </TableCell>
                        <TableCell className="chiffres text-right">
                          {client.boutiques_possedees_count ?? 0}
                        </TableCell>
                        <TableCell className="chiffres text-right">
                          {client.employes_count ?? 0}
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground xl:table-cell">
                          {formatDate(client.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEnEdition(client)}
                          >
                            <Settings2 className="h-4 w-4" />
                            <span className="sr-only">
                              {t("admin.modifierAcces")}
                            </span>
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

function FenetreAbonnement({
  client,
  onFermer,
  onSucces,
}: {
  client: Utilisateur | null;
  onFermer: () => void;
  onSucces: () => void;
}) {
  const { t, libelleAbonnement, lang } = useI18n();

  const [statut, setStatut] = useState<StatutAbonnement>("actif");
  const [plan, setPlan] = useState<PlanAbonnement>("standard");
  const [echeance, setEcheance] = useState("");
  const [actif, setActif] = useState(true);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const statutsDispo: StatutAbonnement[] = ["essai", "actif", "suspendu", "expire"];

  useEffect(() => {
    if (!client) return;
    setStatut((client.abonnement?.statut as StatutAbonnement) ?? "actif");
    setPlan(client.abonnement?.plan ?? "standard");
    setEcheance(client.abonnement?.echeance ?? "");
    setActif(client.actif);
  }, [client]);

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!client) return;

    setEnvoiEnCours(true);

    try {
      await api.put(`/admin/proprietaires/${client.id}/abonnement`, {
        statut,
        plan,
        echeance: echeance || null,
      });

      if (actif !== client.actif) {
        await api.put(`/admin/proprietaires/${client.id}/acces`, { actif });
      }

      toast.success(t("admin.compteModifie"));
      onSucces();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Dialog open={client !== null} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent>
        <form onSubmit={envoyer} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>
              {lang === "en"
                ? `Subscription for ${client?.name}`
                : `Abonnement de ${client?.name}`}
            </DialogTitle>
            <DialogDescription>
              {lang === "en"
                ? "A suspended or expired subscription blocks access for the client and their entire team. Data remains preserved."
                : "Un abonnement suspendu ou expiré bloque l'accès du client et de toute son équipe. Les données restent conservées."}
            </DialogDescription>
          </DialogHeader>

          <DialogCorps>
            <div className="space-y-2">
              <Label>{t("commun.statut")}</Label>
              <Select
                items={Object.fromEntries(
                  statutsDispo.map((s) => [s, libelleAbonnement(s)]),
                )}
                value={statut}
                onValueChange={(v) =>
                  setStatut((v ?? "actif") as StatutAbonnement)
                }
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statutsDispo.map((valeur) => (
                    <SelectItem key={valeur} value={valeur}>
                      {libelleAbonnement(valeur)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{lang === "en" ? "Subscription Tier" : "Formule d'abonnement"}</Label>
              <Select
                items={{
                  standard: lang === "en" ? "Standard" : "Standard",
                  premium:
                    lang === "en"
                      ? "Premium (IMEI lookup enabled)"
                      : "Premium (Identification IMEI incluse)",
                }}
                value={plan}
                onValueChange={(v) => setPlan((v ?? "standard") as PlanAbonnement)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    {lang === "en" ? "Standard" : "Standard"}
                  </SelectItem>
                  <SelectItem value="premium">
                    {lang === "en"
                      ? "Premium (IMEI lookup enabled)"
                      : "Premium (Identification IMEI incluse)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="echeance">{t("admin.tableauEcheance")}</Label>
              <Input
                id="echeance"
                type="date"
                className="chiffres h-10"
                value={echeance}
                onChange={(e) => setEcheance(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {lang === "en"
                  ? "Past this date, access is automatically blocked."
                  : "Passée cette date, l'accès se bloque automatiquement."}
              </p>
            </div>

            <div className="flex items-center gap-3 border-t pt-4">
              <Switch id="a-actif" checked={actif} onCheckedChange={setActif} />
              <Label htmlFor="a-actif" className="font-normal">
                {lang === "en"
                  ? "Account can sign in"
                  : "Le compte peut se connecter"}
              </Label>
            </div>
          </DialogCorps>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFermer}>
              {t("commun.annuler")}
            </Button>
            <Button type="submit" disabled={envoiEnCours}>
              {envoiEnCours && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("commun.enregistrer")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
