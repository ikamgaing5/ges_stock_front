"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldAlert,
  ShieldBan,
  ShieldCheck,
  ShieldOff,
  Bot,
  Activity,
  AlertTriangle,
  Search,
  Lock,
  Unlock,
  RefreshCw,
  Plus,
  Laptop,
  Globe,
  UserX,
  UserCheck,
  Clock,
  CheckCircle2,
  Wrench,
  Power,
} from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import {
  Apparait,
  EtatErreur,
  EtatVide,
  SquelettesCartes,
  SquelettesTableau,
  TitrePage,
} from "@/components/ui-commun";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  IncidentSecurite,
  StatistiquesSecurite,
  TypeIncidentSecurite,
  InfosMaintenance,
} from "@/types";

interface ReponsePaginationIncidents {
  data: IncidentSecurite[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function PageAdminSecurite() {
  const { t, formatNombre, formatDate } = useI18n();

  const [stats, setStats] = useState<StatistiquesSecurite | null>(null);
  const [chargementStats, setChargementStats] = useState(true);

  const [incidents, setIncidents] = useState<IncidentSecurite[]>([]);
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [pageActuelle, setPageActuelle] = useState(1);
  const [dernierePage, setDernierePage] = useState(1);
  const [chargementIncidents, setChargementIncidents] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // Filtres
  const [recherche, setRecherche] = useState("");
  const [filtreType, setFiltreType] = useState<string>("tous");
  const [filtreStatut, setFiltreStatut] = useState<string>("tous");

  // Modals
  const [modalBloquerIp, setModalBloquerIp] = useState(false);
  const [ipABloquer, setIpABloquer] = useState("");
  const [macABloquer, setMacABloquer] = useState("");
  const [dureeHeures, setDureeHeures] = useState("24");
  const [motifIp, setMotifIp] = useState("");
  const [soumissionIp, setSoumissionIp] = useState(false);

  // Modal Bannir / Débloquer
  const [utilisateurADebloquer, setUtilisateurADebloquer] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);
  const [operationEnCours, setOperationEnCours] = useState(false);

  // Mode Maintenance
  const [maintenance, setMaintenance] = useState<InfosMaintenance | null>(null);
  const [chargementMaintenance, setChargementMaintenance] = useState(true);
  const [modalMaintenance, setModalMaintenance] = useState(false);
  const [motifMaintenance, setMotifMaintenance] = useState("");
  const [dureeMaintenanceMinutes, setDureeMaintenanceMinutes] = useState<number | null>(30);
  const [operationMaintenance, setOperationMaintenance] = useState(false);

  const chargerMaintenance = useCallback(async () => {
    try {
      const data = await api.get<InfosMaintenance>("/admin/maintenance");
      setMaintenance(data);
    } catch {
      // Échec silencieux
    } finally {
      setChargementMaintenance(false);
    }
  }, []);

  const chargerStats = useCallback(async () => {
    try {
      const data = await api.get<StatistiquesSecurite>("/admin/securite/statistiques");
      setStats(data);
    } catch {
      // Échec silencieux pour les stats
    } finally {
      setChargementStats(false);
    }
  }, []);

  const chargerIncidents = useCallback(
    async (page = 1) => {
      setChargementIncidents(true);
      setErreur(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        if (filtreType && filtreType !== "tous") params.set("type", filtreType);
        if (filtreStatut && filtreStatut !== "tous") params.set("statut", filtreStatut);
        if (recherche.trim()) params.set("recherche", recherche.trim());

        const res = await api.get<ReponsePaginationIncidents>(
          `/admin/securite/incidents?${params.toString()}`,
        );
        setIncidents(res.data);
        setPageActuelle(res.current_page);
        setDernierePage(res.last_page);
        setTotalIncidents(res.total);
      } catch (e) {
        setErreur(e instanceof ErreurApi ? e.message : t("commun.erreur"));
      } finally {
        setChargementIncidents(false);
      }
    },
    [filtreType, filtreStatut, recherche, t],
  );

  useEffect(() => {
    void chargerStats();
    void chargerMaintenance();
  }, [chargerStats, chargerMaintenance]);

  useEffect(() => {
    const minuterie = setTimeout(() => {
      void chargerIncidents(1);
    }, 250);
    return () => clearTimeout(minuterie);
  }, [chargerIncidents]);

  const rechargerTout = () => {
    void chargerStats();
    void chargerMaintenance();
    void chargerIncidents(pageActuelle);
  };

  /** Basculer le mode maintenance SaaS */
  async function basculerMaintenance(
    activer: boolean,
    motif?: string,
    finEstimee?: string | null,
  ) {
    setOperationMaintenance(true);
    try {
      const res = await api.post<{ message: string; maintenance: InfosMaintenance }>(
        "/admin/maintenance/basculer",
        {
          active: activer,
          motif: motif ?? null,
          fin_estimee: finEstimee ?? null,
        },
      );
      setMaintenance(res.maintenance);
      setModalMaintenance(false);
      toast.success(res.message);
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setOperationMaintenance(false);
    }
  }

  /** Bloquer manuellement une IP */
  async function soumettreBlocageIp(e: React.FormEvent) {
    e.preventDefault();
    if (!ipABloquer.trim()) {
      toast.error("Veuillez renseigner une adresse IP valide.");
      return;
    }
    if (!motifIp.trim()) {
      toast.error("Veuillez renseigner un motif pour ce blocage.");
      return;
    }

    setSoumissionIp(true);
    try {
      await api.post("/admin/securite/bloquer-ip", {
        ip: ipABloquer.trim(),
        mac_address: macABloquer.trim() || null,
        duree_heures: dureeHeures === "0" ? null : parseInt(dureeHeures, 10),
        motif: motifIp.trim(),
      });

      toast.success("L'adresse IP a été bloquée avec succès.");
      setModalBloquerIp(false);
      setIpABloquer("");
      setMacABloquer("");
      setMotifIp("");
      rechargerTout();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setSoumissionIp(false);
    }
  }

  /** Débloquer une adresse IP */
  async function debloquerIp(ip: string) {
    try {
      await api.post("/admin/securite/debloquer-ip", { ip });
      toast.success(`L'adresse IP ${ip} a été débloquée.`);
      rechargerTout();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    }
  }

  /** Débloquer un compte utilisateur (banni ou auto-bloqué) */
  async function confirmerDeblocageUtilisateur() {
    if (!utilisateurADebloquer) return;
    setOperationEnCours(true);
    try {
      await api.post(`/admin/users/${utilisateurADebloquer.id}/debloquer`);
      toast.success(
        `Le compte de ${utilisateurADebloquer.name} a été débloqué et réactivé.`,
      );
      setUtilisateurADebloquer(null);
      rechargerTout();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setOperationEnCours(false);
    }
  }

  const libelleTypeIncident = (type: TypeIncidentSecurite) => {
    switch (type) {
      case "honeypot":
        return {
          label: "Honeypot (IA / Bot)",
          icone: Bot,
          classes:
            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        };
      case "surcharge_requetes":
        return {
          label: "Flood / Surcharge",
          icone: Activity,
          classes:
            "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
        };
      case "bruteforce":
        return {
          label: "Bruteforce",
          icone: AlertTriangle,
          classes:
            "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        };
      case "manuel":
        return {
          label: "Blocage Manuel",
          icone: ShieldBan,
          classes:
            "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
        };
      default:
        return {
          label: type,
          icone: ShieldAlert,
          classes: "bg-muted text-foreground border-border",
        };
    }
  };

  return (
    <>
      <TitrePage
        titre={t("admin.securite")}
        description={t("admin.securiteDesc")}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={rechargerTout}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{t("commun.actualiser")}</span>
        </Button>
        <Button
          size="sm"
          onClick={() => setModalBloquerIp(true)}
          className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          <Plus className="h-4 w-4" />
          <span>{t("admin.bloquerIp")}</span>
        </Button>
      </TitrePage>

      {/* Carte Mode Maintenance SaaS */}
      <Apparait>
        <Card
          className={`mb-6 transition-all ${
            maintenance?.active
              ? "border-amber-500/50 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent shadow-md"
              : "border-border/60 bg-card/60 backdrop-blur-sm"
          }`}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <div
                  className={`relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    maintenance?.active
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {maintenance?.active ? (
                    <>
                      <Wrench className="h-5 w-5 animate-pulse" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
                      </span>
                    </>
                  ) : (
                    <ShieldCheck className="h-6 w-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">
                      {t("admin.modeMaintenance")}
                    </h2>
                    {maintenance?.active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {t("admin.maintenanceActive")} (503)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {t("admin.maintenanceInactive")}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {maintenance?.active
                      ? maintenance.motif ||
                        "Mise à niveau planifiée des serveurs et optimisation des inventaires."
                      : t("admin.modeMaintenanceDesc")}
                  </p>

                  {maintenance?.active && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-muted-foreground">
                      {maintenance.fin_estimee && (
                        <span className="flex items-center gap-1 font-medium text-amber-700 dark:text-amber-300">
                          <Clock className="h-3 w-3" />
                          {t("admin.finEstimee")}{" "}
                          {formatDate(maintenance.fin_estimee)}
                        </span>
                      )}
                      {maintenance.declenchee_par && (
                        <span>
                          {t("admin.declenchePar")}{" "}
                          <strong>{maintenance.declenchee_par}</strong>
                        </span>
                      )}
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {t("admin.bypassAdminActif")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {maintenance?.active ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMotifMaintenance(maintenance?.motif || "");
                        setModalMaintenance(true);
                      }}
                      className="gap-1.5 text-xs"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>{t("admin.ajuster")}</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => void basculerMaintenance(false)}
                      disabled={operationMaintenance}
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs"
                    >
                      <Power className="h-3.5 w-3.5" />
                      <span>{t("admin.desactiverMaintenance")}</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMotifMaintenance(
                        "Mise à niveau planifiée des serveurs et optimisation des inventaires.",
                      );
                      setDureeMaintenanceMinutes(30);
                      setModalMaintenance(true);
                    }}
                    className="gap-2 border-amber-500/40 text-amber-700 hover:bg-amber-500/10 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200"
                  >
                    <Wrench className="h-3.5 w-3.5 text-amber-500" />
                    <span>{t("admin.activerMaintenance")}</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Apparait>

      {/* Cartes KPI Statistiques */}
      <div className="mb-6">
        {chargementStats || !stats ? (
          <SquelettesCartes nombre={4} />
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <Apparait index={0}>
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="flex items-center justify-between p-4 sm:p-5">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("admin.comptesBannis")}
                    </p>
                    <p className="font-heading text-2xl font-bold tracking-tight text-destructive">
                      {formatNombre(stats.nb_comptes_bannis)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("admin.comptesBannisDesc")}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                    <ShieldBan className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </Apparait>

            <Apparait index={1}>
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="flex items-center justify-between p-4 sm:p-5">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("admin.bloquesAuto")}
                    </p>
                    <p className="font-heading text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                      {formatNombre(stats.nb_comptes_bloques_auto)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("admin.bloquesAutoDesc")}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </Apparait>

            <Apparait index={2}>
              <Card className="border-rose-500/20 bg-rose-500/5">
                <CardContent className="flex items-center justify-between p-4 sm:p-5">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("admin.ipsBloqueesActives")}
                    </p>
                    <p className="font-heading text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                      {formatNombre(stats.nb_ips_bloquees)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("admin.ipsBloqueesActivesDesc")}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                    <ShieldOff className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </Apparait>

            <Apparait index={3}>
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="flex items-center justify-between p-4 sm:p-5">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("admin.botsEtIaPieges")}
                    </p>
                    <p className="font-heading text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                      {formatNombre(stats.nb_honeypot_neutralises)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("admin.botsEtIaPiegesDesc")}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Bot className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </Apparait>
          </div>
        )}
      </div>

      {/* Barre de Recherche et Filtres */}
      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-2.5 p-3 sm:gap-3 sm:p-4">
          <div className="relative min-w-44 flex-1 basis-full sm:basis-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 sm:h-10 pl-9"
              placeholder={t("admin.rechercheSecuritePlaceholder")}
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select value={filtreType} onValueChange={(v) => setFiltreType(v ?? "tous")}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue placeholder="Type d'incident" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="honeypot">Honeypot (IA / Bot)</SelectItem>
                <SelectItem value="surcharge_requetes">Surcharge (Flood)</SelectItem>
                <SelectItem value="bruteforce">Bruteforce</SelectItem>
                <SelectItem value="manuel">Blocage manuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <Select value={filtreStatut} onValueChange={(v) => setFiltreStatut(v ?? "tous")}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="bloque">Bloqué actuellement</SelectItem>
                <SelectItem value="debloque">Débloqué / Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table des incidents */}
      {erreur ? (
        <EtatErreur message={erreur} onReessayer={rechargerTout} />
      ) : chargementIncidents ? (
        <SquelettesTableau lignes={6} colonnes={6} />
      ) : incidents.length === 0 ? (
        <EtatVide
          icone={<ShieldCheck className="h-6 w-6 text-emerald-500" />}
          titre={t("admin.aucunIncident")}
          description={t("admin.aucunIncidentDesc")}
        />
      ) : (
        <Apparait>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.dateEtHeure")}</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Adresse IP / Matériel</TableHead>
                      <TableHead>Compte concerné</TableHead>
                      <TableHead>Motif & Détails</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident) => {
                      const typeInfo = libelleTypeIncident(incident.type);
                      const IconeType = typeInfo.icone;
                      const estActif = incident.est_bloque;

                      return (
                        <TableRow key={incident.id}>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(incident.created_at)}
                          </TableCell>

                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeInfo.classes}`}
                            >
                              <IconeType className="h-3 w-3" />
                              {typeInfo.label}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{incident.ip}</span>
                              </div>
                              {incident.mac_address && (
                                <div className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                  <Laptop className="h-3 w-3" />
                                  <span>{incident.mac_address}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            {incident.user ? (
                              <div className="space-y-0.5">
                                <p className="text-xs font-medium">{incident.user.name}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  {incident.user.email}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs italic text-muted-foreground">
                                {t("admin.visiteurAnonyme")}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="max-w-xs">
                            <p className="line-clamp-2 text-xs text-foreground">
                              {incident.motif}
                            </p>
                            {Boolean(incident.donnees_contexte?.duree_ms) && (
                              <span className="text-[10px] text-muted-foreground">
                                Durée: {String(incident.donnees_contexte?.duree_ms)}ms
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            {estActif ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                                  <Lock className="h-3 w-3" />
                                  {t("admin.bloque")}
                                </span>
                                {incident.bloque_jusqu_a ? (
                                  <p className="text-[10px] text-muted-foreground">
                                    Jusqu'au {formatDate(incident.bloque_jusqu_a)}
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-muted-foreground">
                                    Définitif
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" />
                                {t("admin.debloque")}
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {estActif && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => void debloquerIp(incident.ip)}
                                  className="h-8 text-xs hover:bg-emerald-500/10 hover:text-emerald-600"
                                >
                                  <Unlock className="mr-1 h-3.5 w-3.5" />
                                  <span>{t("admin.debloquerIp")}</span>
                                </Button>
                              )}

                              {incident.user && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setUtilisateurADebloquer(incident.user!)
                                  }
                                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                                  title="Débloquer le compte de cet utilisateur"
                                >
                                  <UserCheck className="h-3.5 w-3.5" />
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

              {/* Pagination */}
              {dernierePage > 1 && (
                <div className="flex items-center justify-between border-t p-3 sm:px-6">
                  <span className="text-xs text-muted-foreground">
                    Total: {totalIncidents} incident(s)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pageActuelle <= 1}
                      onClick={() => void chargerIncidents(pageActuelle - 1)}
                    >
                      Précédent
                    </Button>
                    <span className="text-xs font-medium">
                      {pageActuelle} / {dernierePage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pageActuelle >= dernierePage}
                      onClick={() => void chargerIncidents(pageActuelle + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Apparait>
      )}

      {/* Modal Bloquer une IP manuellement */}
      <Dialog open={modalBloquerIp} onOpenChange={setModalBloquerIp}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={soumettreBlocageIp}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <ShieldBan className="h-5 w-5" />
                <span>Bloquer une adresse IP</span>
              </DialogTitle>
              <DialogDescription>
                Cette adresse IP ne pourra plus effectuer d'appels vers l'API Telora.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="ip">Adresse IP (IPv4 ou IPv6)</Label>
                <Input
                  id="ip"
                  placeholder="Ex: 197.159.22.84"
                  className="font-mono text-sm"
                  value={ipABloquer}
                  onChange={(e) => setIpABloquer(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mac">Adresse MAC (optionnel - Desktop)</Label>
                <Input
                  id="mac"
                  placeholder="Ex: 00:1A:2B:3C:4D:5E"
                  className="font-mono text-sm uppercase"
                  value={macABloquer}
                  onChange={(e) => setMacABloquer(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="duree">Durée du blocage</Label>
                <Select value={dureeHeures} onValueChange={(v) => setDureeHeures(v ?? "24")}>
                  <SelectTrigger id="duree">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 heure</SelectItem>
                    <SelectItem value="6">6 heures</SelectItem>
                    <SelectItem value="24">24 heures (1 jour)</SelectItem>
                    <SelectItem value="72">72 heures (3 jours)</SelectItem>
                    <SelectItem value="168">7 jours (1 semaine)</SelectItem>
                    <SelectItem value="0">Définitif (sans limite de temps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="motif">Motif du blocage</Label>
                <Textarea
                  id="motif"
                  placeholder="Ex: Tentatives répétées de piratage, comportement anormal..."
                  value={motifIp}
                  onChange={(e) => setMotifIp(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalBloquerIp(false)}
                disabled={soumissionIp}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={soumissionIp}
              >
                {soumissionIp ? "Blocage en cours..." : "Confirmer le blocage"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmation Déblocage Utilisateur */}
      <Dialog
        open={utilisateurADebloquer !== null}
        onOpenChange={(o) => !o && setUtilisateurADebloquer(null)}
      >
        <DialogContent className="sm:max-w-md p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              <span>Débloquer le compte client</span>
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir lever le blocage de sécurité pour{" "}
              <strong>{utilisateurADebloquer?.name}</strong> (
              {utilisateurADebloquer?.email}) ?
            </DialogDescription>
          </DialogHeader>

          <p className="rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">
            Cette action réinitialise son statut de sécurité à <strong>Actif</strong>,
            supprime les compteurs de rate-limiting associés et débloque ses adresses
            IP récemment enregistrées.
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setUtilisateurADebloquer(null)}
              disabled={operationEnCours}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => void confirmerDeblocageUtilisateur()}
              disabled={operationEnCours}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {operationEnCours ? "Déblocage..." : "Débloquer le compte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Configuration / Activation Mode Maintenance */}
      <Dialog open={modalMaintenance} onOpenChange={setModalMaintenance}>
        <DialogContent className="sm:max-w-lg p-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Wrench className="h-5 w-5 text-amber-500" />
              <span>{t("admin.configurerMaintenance")}</span>
            </DialogTitle>
            <DialogDescription>
              {t("admin.configurerMaintenanceDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="motif-maint">
                {t("admin.motifAfficheCommercants")}
              </Label>
              <Textarea
                id="motif-maint"
                rows={3}
                value={motifMaintenance}
                onChange={(e) => setMotifMaintenance(e.target.value)}
                placeholder="Mise à niveau planifiée des serveurs et optimisation des inventaires..."
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t("admin.dureeEstimeeCoupure")}
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: "15 min", val: 15 },
                  { label: "30 min", val: 30 },
                  { label: "1 heure", val: 60 },
                  { label: "2 heures", val: 120 },
                ].map((preset) => (
                  <Button
                    key={preset.val}
                    type="button"
                    variant={dureeMaintenanceMinutes === preset.val ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDureeMaintenanceMinutes(preset.val)}
                    className="text-xs"
                  >
                    +{preset.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <Button
                  type="button"
                  variant={dureeMaintenanceMinutes === null ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDureeMaintenanceMinutes(null)}
                  className="text-xs text-muted-foreground"
                >
                  {t("admin.dureeIndeterminee")}
                </Button>

                <span className="text-[11px] text-muted-foreground">
                  {dureeMaintenanceMinutes !== null
                    ? t("admin.repriseVers", {
                        heure: new Date(Date.now() + dureeMaintenanceMinutes * 60 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      })
                    : ""}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>{t("admin.accesAdminPreserve")}</span>
              </div>
              <p className="text-[11px] opacity-90">
                {t("admin.accesAdminPreserveDesc")}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalMaintenance(false)}
              disabled={operationMaintenance}
            >
              {t("commun.annuler")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                const fin =
                  dureeMaintenanceMinutes !== null
                    ? new Date(Date.now() + dureeMaintenanceMinutes * 60 * 1000).toISOString()
                    : null;
                void basculerMaintenance(true, motifMaintenance, fin);
              }}
              disabled={operationMaintenance}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
            >
              {operationMaintenance
                ? t("admin.activationEnCours")
                : t("admin.activerMaintenance")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
