"use client";

/** Les comptes clients et leurs abonnements (/admin/proprietaires). */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Loader2,
  Search,
  Settings2,
  ShieldBan,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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
  const { t, formatDate, formatDateCourte, libelleAbonnement } = useI18n();
  const parametresUrl = useSearchParams();

  const [recherche, setRecherche] = useState("");
  const [statut, setStatut] = useState(parametresUrl.get("statut") ?? "tous");
  const [enEdition, setEnEdition] = useState<Utilisateur | null>(null);

  // Modération & Bannissement
  const [clientABannir, setClientABannir] = useState<Utilisateur | null>(null);
  const [motifBannissement, setMotifBannissement] = useState("");
  const [envoiBannissement, setEnvoiBannissement] = useState(false);

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

  async function confirmerBannissement() {
    if (!clientABannir || !motifBannissement.trim()) return;
    setEnvoiBannissement(true);
    try {
      await api.post(`/admin/users/${clientABannir.id}/bannir`, {
        motif: motifBannissement.trim(),
      });
      toast.success("L'utilisateur a été banni avec succès.");
      setClientABannir(null);
      setMotifBannissement("");
      recharger();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setEnvoiBannissement(false);
    }
  }

  async function debloquerClient(client: Utilisateur) {
    try {
      await api.post(`/admin/users/${client.id}/debloquer`);
      toast.success(`Le compte de ${client.name} a été débloqué et réactivé.`);
      recharger();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    }
  }

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
                        {t("admin.inscritLe")}
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
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{client.name}</p>
                            {client.statut_securite === "banni" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                                <ShieldBan className="h-3 w-3" />
                                {t("admin.banniBadge")}
                              </span>
                            )}
                            {client.statut_securite === "bloque_auto" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-3 w-3" />
                                {t("admin.bloqueAutoBadge")}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {client.email}
                          </p>
                          {client.derniere_ip && (
                            <p className="text-[10px] font-mono text-muted-foreground">
                              IP: {client.derniere_ip} {client.derniere_mac ? `• MAC: ${client.derniere_mac}` : ""}
                            </p>
                          )}
                          {!client.actif && client.statut_securite !== "banni" && client.statut_securite !== "bloque_auto" && (
                            <p className="text-xs text-statut-alerte">
                              {t("admin.compteDesactive")}
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
                          <div className="flex items-center justify-end gap-1">
                            {client.statut_securite === "banni" || client.statut_securite === "bloque_auto" ? (
                              <Button
                                variant="outline"
                                size="icon-sm"
                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700"
                                onClick={() => void debloquerClient(client)}
                                title={t("admin.debloquerUtilisateur")}
                              >
                                <UserCheck className="h-4 w-4" />
                                <span className="sr-only">
                                  {t("admin.debloquerUtilisateur")}
                                </span>
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                  setClientABannir(client);
                                  setMotifBannissement("");
                                }}
                                title={t("admin.bannirUtilisateur")}
                              >
                                <ShieldBan className="h-4 w-4" />
                                <span className="sr-only">
                                  {t("admin.bannirUtilisateur")}
                                </span>
                              </Button>
                            )}

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
                          </div>
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

      {/* Modal de bannissement */}
      <Dialog
        open={clientABannir !== null}
        onOpenChange={(o) => !o && setClientABannir(null)}
      >
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void confirmerBannissement();
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <ShieldBan className="h-5 w-5" />
                <span>{t("admin.bannirUtilisateur")}</span>
              </DialogTitle>
              <DialogDescription>
                Bannir définitivement l'accès pour{" "}
                <strong>{clientABannir?.name}</strong> (
                {clientABannir?.email}) et révoquer l'ensemble de ses sessions actives.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="motif-ban">{t("admin.motifBannissement")}</Label>
                <Textarea
                  id="motif-ban"
                  placeholder={t("admin.motifBannissementPlaceholder")}
                  value={motifBannissement}
                  onChange={(e) => setMotifBannissement(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setClientABannir(null)}
                disabled={envoiBannissement}
              >
                {t("commun.annuler")}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={envoiBannissement}
              >
                {envoiBannissement
                  ? t("commun.validerEnCours")
                  : t("admin.confirmerBannissement")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
              {t("admin.abonnementDe", { nom: client?.name ?? "" })}
            </DialogTitle>
            <DialogDescription>
              {t("admin.abonnementDeDesc")}
            </DialogDescription>
          </DialogHeader>

          <DialogCorps>
            {client?.statut_securite === "banni" && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <ShieldBan className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">{t("admin.compteActuellementBanni")}</p>
                  {client.banni_motif && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {t("admin.motifDeuxPoints", { motif: client.banni_motif })}
                    </p>
                  )}
                </div>
              </div>
            )}
            {client?.statut_securite === "bloque_auto" && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold">{t("admin.compteBloqueAutoSurcharge")}</p>
                  {client.banni_motif && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {t("admin.motifDeuxPoints", { motif: client.banni_motif })}
                    </p>
                  )}
                </div>
              </div>
            )}

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
              <Label>{t("admin.formuleAbonnement")}</Label>
              <Select
                items={{
                  standard: t("admin.formuleStandard"),
                  premium: t("admin.formulePremium"),
                }}
                value={plan}
                onValueChange={(v) => setPlan((v ?? "standard") as PlanAbonnement)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    {t("admin.formuleStandard")}
                  </SelectItem>
                  <SelectItem value="premium">
                    {t("admin.formulePremium")}
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
                {t("admin.echeanceDateAlerte")}
              </p>
            </div>

            <div className="flex items-center gap-3 border-t pt-4">
              <Switch id="a-actif" checked={actif} onCheckedChange={setActif} />
              <Label htmlFor="a-actif" className="font-normal">
                {t("admin.comptePeutSeConnecter")}
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
