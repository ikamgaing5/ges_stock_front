"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownAZ,
  ArrowUpDown,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  HeartHandshake,
  Loader2,
  Phone,
  Receipt,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  User,
  UserCheck,
  UsersRound,
  X,
} from "lucide-react";
import { IconeWhatsapp } from "@/components/icone-whatsapp";
import { toast } from "sonner";
import { api, ErreurApi, lireToken } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { TitrePage } from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  DialogCorps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModalFacture } from "@/components/facture/modal-facture";
import type {
  ClientAchatDetail,
  ClientFicheDetail,
  ClientResume,
  Mouvement,
  StatistiquesClients,
} from "@/types";

const URL_API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api";

export default function PageClients() {
  const { boutiques, boutiqueActive, parametresBoutique, devise } = useAuth();
  const { t, formatMontant, formatDate, lang } = useI18n();

  // État des données
  const [clients, setClients] = useState<ClientResume[]>([]);
  const [stats, setStats] = useState<StatistiquesClients>({
    total_clients: 0,
    total_ventes: 0,
    chiffre_affaires: 0,
    panier_moyen: 0,
    clients_fideles: 0,
  });
  const [chargement, setChargement] = useState(true);

  // Filtres
  const [recherche, setRecherche] = useState("");
  const [tri, setTri] = useState<string>("recent");

  // Options de tri ergonomiques
  const optionsTri = useMemo(
    () => [
      {
        id: "recent",
        label: lang === "en" ? "Recent" : "Plus récents",
        description:
          lang === "en"
            ? "Sort by most recent purchase"
            : "Trier par date du dernier achat",
        icon: Clock,
      },
      {
        id: "depenses_desc",
        label: lang === "en" ? "Top Spenders" : "Plus dépensiers",
        description:
          lang === "en"
            ? "Sort by total amount spent"
            : "Trier par total des dépenses",
        icon: TrendingUp,
      },
      {
        id: "achats_desc",
        label: lang === "en" ? "Most Loyal" : "Plus fidèles",
        description:
          lang === "en"
            ? "Sort by number of purchases"
            : "Trier par nombre d'achats",
        icon: Star,
      },
      {
        id: "nom_asc",
        label: lang === "en" ? "Name (A-Z)" : "Nom (A-Z)",
        description:
          lang === "en"
            ? "Sort alphabetically by name"
            : "Trier par ordre alphabétique",
        icon: ArrowDownAZ,
      },
    ],
    [lang]
  );

  // Sélection multiple
  const [selection, setSelection] = useState<Set<string>>(new Set());

  // Réinitialiser la sélection multiple lors du changement de boutique
  const boutiqueId = parametresBoutique.boutique_id;
  useEffect(() => {
    setSelection(new Set());
  }, [boutiqueId]);

  // Modal Campagne WhatsApp
  const [modalWhatsappOuvert, setModalWhatsappOuvert] = useState(false);
  const [messagePromo, setMessagePromo] = useState<string>(
    t("clients.messageDefaut")
  );
  const [telechargementVcardEnCours, setTelechargementVcardEnCours] =
    useState(false);
  const [numerosCopies, setNumerosCopies] = useState(false);

  // Modal Fiche Client
  const [clientEnConsultation, setClientEnConsultation] =
    useState<ClientResume | null>(null);
  const [detailsClient, setDetailsClient] = useState<ClientFicheDetail | null>(
    null
  );
  const [chargementFiche, setChargementFiche] = useState(false);

  // Modal Facture liée
  const [factureSelectionnee, setFactureSelectionnee] =
    useState<Mouvement | null>(null);
  const [chargementFacture, setChargementFacture] = useState(false);

  // Devise principale à afficher
  const deviseAffichee =
    boutiqueActive?.devise ?? devise ?? boutiques[0]?.devise ?? "XAF";

  // Charger la liste des clients
  const chargerClients = useCallback(async () => {
    setChargement(true);
    try {
      const params: Record<string, string | undefined> = {
        tri,
        recherche: recherche.trim() || undefined,
        ...parametresBoutique,
      };

      const res = await api.get<{
        data: ClientResume[];
        statistiques: StatistiquesClients;
      }>("/clients", params);

      setClients(res.data || []);
      if (res.statistiques) {
        setStats(res.statistiques);
      }
    } catch (e) {
      if (e instanceof ErreurApi) {
        toast.error(e.resume());
      } else {
        toast.error(
          lang === "en"
            ? "Failed to load customers."
            : "Impossible de charger la liste des clients."
        );
      }
    } finally {
      setChargement(false);
    }
  }, [parametresBoutique.boutique_id, recherche, tri, lang]);

  useEffect(() => {
    chargerClients();
  }, [chargerClients]);

  // Synchroniser la sélection avec la liste affichée
  const tousSelectionnes = useMemo(() => {
    if (clients.length === 0) return false;
    return clients.every((c) => selection.has(c.cle));
  }, [clients, selection]);

  function basculerTout() {
    if (tousSelectionnes) {
      setSelection(new Set());
    } else {
      setSelection(new Set(clients.map((c) => c.cle)));
    }
  }

  function basculerClient(cle: string) {
    setSelection((prec) => {
      const maj = new Set(prec);
      if (maj.has(cle)) {
        maj.delete(cle);
      } else {
        maj.add(cle);
      }
      return maj;
    });
  }

  const clientsSelectionnes = useMemo(() => {
    return clients.filter((c) => selection.has(c.cle));
  }, [clients, selection]);

  // Consulter la fiche client
  async function ouvrirFicheClient(client: ClientResume) {
    setClientEnConsultation(client);
    setChargementFiche(true);
    setDetailsClient(null);

    try {
      const res = await api.get<ClientFicheDetail>("/clients/fiche", {
        cle: client.cle,
        ...parametresBoutique,
      });
      setDetailsClient(res);
    } catch (e) {
      toast.error(
        lang === "en"
          ? "Failed to load customer details."
          : "Impossible de charger les détails du client."
      );
    } finally {
      setChargementFiche(false);
    }
  }

  // Ouvrir la facture d'un achat
  async function voirFactureAchat(achat: ClientAchatDetail) {
    setChargementFacture(true);
    try {
      const identifiant = achat.uuid || achat.id;
      const res = await api.get<{ data: Mouvement } | Mouvement>(`/mouvements/${identifiant}`);
      const m = res && typeof res === "object" && "data" in res && res.data ? res.data : (res as Mouvement);

      const boutiqueAssociee =
        m.boutique ??
        m.telephone?.boutique ??
        boutiques.find((b) => b.nom === achat.boutique_nom) ??
        boutiques[0];

      const mouvementComplet: Mouvement = {
        ...m,
        boutique: boutiqueAssociee,
        client_nom:
          m.client_nom ||
          m.telephone?.client_nom ||
          clientEnConsultation?.nom ||
          "",
        client_telephone:
          m.client_telephone ||
          m.telephone?.client_telephone ||
          clientEnConsultation?.telephone ||
          "",
        prix:
          m.prix !== null && Number(m.prix) > 0
            ? Number(m.prix)
            : achat.prix,
        numero_facture: m.numero_facture || achat.numero_facture,
        mode_paiement: m.mode_paiement || (achat.mode_paiement as any) || "cash",
        telephone: {
          ...m.telephone,
          id: m.telephone?.id ?? Number(achat.telephone.id),
          imei: m.telephone?.imei || achat.telephone.imei,
          couleur: m.telephone?.couleur || achat.telephone.couleur,
          modele: m.telephone?.modele ?? ({
            id: 1,
            nom: achat.telephone.modele,
            libelle: `${achat.telephone.marque} ${achat.telephone.modele}`.trim(),
            marque: {
              id: 1,
              nom: achat.telephone.marque,
              slug: "marque",
            },
          } as any),
          boutique: boutiqueAssociee,
        } as any,
      };

      setFactureSelectionnee(mouvementComplet);
    } catch (e) {
      // Fallback au cas où l'appel réseau échouerait
      const boutiqueAssociee =
        boutiques.find((b) => b.nom === achat.boutique_nom) ??
        boutiques[0];

      const mouvementReconstruit: Mouvement = {
        id: achat.id,
        uuid: achat.uuid,
        boutique_id: boutiqueAssociee ? Number(boutiqueAssociee.id) : 1,
        telephone_id: Number(achat.telephone.id),
        type: "vente",
        statut_avant: "en_stock",
        statut_apres: "vendu",
        prix: achat.prix,
        mode_paiement: (achat.mode_paiement as any) ?? "cash",
        numero_facture: achat.numero_facture,
        client_nom: clientEnConsultation?.nom ?? "",
        client_telephone: clientEnConsultation?.telephone ?? "",
        motif: null,
        commentaire: achat.commentaire ?? null,
        created_at: achat.date,
        boutique: boutiqueAssociee,
        user: {
          id: 0,
          name: achat.vendeur_nom,
          email: "",
          role: "vendeuse",
        } as any,
        telephone: {
          id: Number(achat.telephone.id),
          imei: achat.telephone.imei ?? "",
          couleur: achat.telephone.couleur ?? "",
          prix_achat: 0,
          prix_vente: achat.prix,
          prix_vente_reel: achat.prix,
          fournisseur: null,
          client_nom: clientEnConsultation?.nom ?? "",
          client_telephone: clientEnConsultation?.telephone ?? "",
          entre_le: null,
          sorti_le: achat.date,
          notes: null,
          created_at: achat.date,
          updated_at: achat.date,
          modele: {
            id: 1,
            nom: achat.telephone.modele,
            libelle: `${achat.telephone.marque} ${achat.telephone.modele}`.trim(),
            marque: {
              id: 1,
              nom: achat.telephone.marque,
              slug: "marque",
            },
          } as any,
          boutique: boutiqueAssociee,
        } as any,
      };
      setFactureSelectionnee(mouvementReconstruit);
    } finally {
      setChargementFacture(false);
    }
  }

  // Télécharger le fichier vCard (.vcf) pour les clients sélectionnés
  async function telechargerVcard(cibleClients: ClientResume[]) {
    if (cibleClients.length === 0) {
      toast.warning(
        lang === "en"
          ? "Please select at least one customer."
          : "Veuillez sélectionner au moins un client."
      );
      return;
    }

    setTelechargementVcardEnCours(true);
    try {
      const token = lireToken();
      const nomBoutique =
        boutiqueActive?.nom ??
        boutiques[0]?.nom ??
        "Telora";

      const res = await fetch(`${URL_API}/clients/export-vcard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          clients: cibleClients.map((c) => ({
            nom: c.nom,
            telephone: c.telephone,
            total_depense: c.total_depense,
          })),
          nom_boutique: nomBoutique,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur export vCard");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clients_whatsapp_${new Date().toISOString().slice(0, 10)}.vcf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        lang === "en"
          ? "vCard file downloaded! Open it on your phone to import contacts into WhatsApp."
          : "Fichier vCard téléchargé ! Ouvrez-le sur votre téléphone pour ajouter les contacts à WhatsApp."
      );
    } catch (e) {
      toast.error(
        lang === "en"
          ? "Failed to export vCard file."
          : "Échec de l'exportation du fichier de contacts."
      );
    } finally {
      setTelechargementVcardEnCours(false);
    }
  }

  // Exporter en CSV
  async function telechargerCsv() {
    try {
      const token = lireToken();
      let urlExport = `${URL_API}/clients/export-csv`;
      if (parametresBoutique.boutique_id) {
        urlExport += `?boutique_id=${encodeURIComponent(parametresBoutique.boutique_id)}`;
      }

      const res = await fetch(urlExport, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) throw new Error("Erreur export CSV");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clients_telora_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        lang === "en"
          ? "CSV export downloaded."
          : "Exportation CSV téléchargée avec succès."
      );
    } catch (e) {
      toast.error(
        lang === "en" ? "Failed to export CSV." : "Échec de l'exportation CSV."
      );
    }
  }

  // Copier tous les numéros de la sélection
  function copierNumeros() {
    const numeros = clientsSelectionnes
      .map((c) => c.telephone.replace(/[^\d+]/g, ""))
      .filter(Boolean)
      .join(", ");

    if (!numeros) {
      toast.warning(
        lang === "en" ? "No phone numbers found." : "Aucun numéro de téléphone."
      );
      return;
    }

    navigator.clipboard.writeText(numeros);
    setNumerosCopies(true);
    toast.success(
      lang === "en"
        ? `${clientsSelectionnes.length} phone numbers copied!`
        : `${clientsSelectionnes.length} numéros copiés dans le presse-papier !`
    );
    setTimeout(() => setNumerosCopies(false), 2500);
  }

  // Générer le lien WhatsApp personnalisé pour un client donné
  function genererLienWhatsapp(client: ClientResume, texte: string): string {
    const tel = client.telephone.replace(/[^\d+]/g, "").replace(/^\+/, "");
    const nomBoutique =
      client.boutiques[0]?.nom ??
      boutiqueActive?.nom ??
      boutiques[0]?.nom ??
      "notre boutique";

    const messageFinal = texte
      .replace(/\{nom\}/g, client.nom)
      .replace(/\{boutique\}/g, nomBoutique)
      .replace(/\{telephone\}/g, client.telephone);

    return `https://wa.me/${tel}?text=${encodeURIComponent(messageFinal)}`;
  }

  // Aperçu du message WhatsApp
  const apercuMessage = useMemo(() => {
    const premierClient = clientsSelectionnes[0] || clients[0];
    if (!premierClient) return messagePromo;
    const nomBoutique =
      premierClient.boutiques[0]?.nom ??
      boutiqueActive?.nom ??
      boutiques[0]?.nom ??
      "notre boutique";

    return messagePromo
      .replace(/\{nom\}/g, premierClient.nom)
      .replace(/\{boutique\}/g, nomBoutique)
      .replace(/\{telephone\}/g, premierClient.telephone);
  }, [clientsSelectionnes, clients, messagePromo, boutiques, boutiqueActive]);

  return (
    <>
      <div className="space-y-6">
        {/* Titre de page et boutons d'action d'export globaux */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TitrePage
            titre={t("clients.titre")}
            chargement={chargement}
            description={
              boutiqueActive
                ? `${t("clients.sousTitre")} — ${boutiqueActive.nom}`
                : t("clients.sousTitre")
            }
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={telechargerCsv}
              disabled={chargement || clients.length === 0}
              className="h-9 gap-1.5 text-xs font-medium"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t("clients.exporterCsv")}</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (selection.size === 0) {
                  // Sélectionner tous les clients par défaut
                  setSelection(new Set(clients.map((c) => c.cle)));
                }
                setModalWhatsappOuvert(true);
              }}
              disabled={chargement || clients.length === 0}
              className="h-9 gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-medium shadow-sm transition-all"
            >
              <IconeWhatsapp className="h-4 w-4" monochrome />
              <span>{t("clients.campagneWhatsapp")}</span>
            </Button>
          </div>
        </div>

        {/* 4 Cartes de statistiques clés avec skeletons et tri interactif */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card
            onClick={() => setTri("recent")}
            title={lang === "en" ? "Click to sort by recent" : "Cliquer pour trier par clients récents"}
            className={cn(
              "cursor-pointer border-border/60 bg-card/60 backdrop-blur-xs transition-all hover:border-primary/40 hover:shadow-xs",
              tri === "recent" && "ring-2 ring-primary/40 border-primary/50 shadow-xs"
            )}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("clients.totalClients")}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UsersRound className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                {chargement ? (
                  <div className="space-y-1.5 py-0.5">
                    <Skeleton className="h-7 w-16 rounded" />
                    <Skeleton className="h-3.5 w-28 rounded" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      {stats.total_clients}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {stats.total_ventes} {t("clients.achats").toLowerCase()}{" "}
                      {lang === "en" ? "recorded" : "enregistrés"}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setTri("depenses_desc")}
            title={lang === "en" ? "Click to sort by revenue" : "Cliquer pour trier par plus dépensiers"}
            className={cn(
              "cursor-pointer border-border/60 bg-card/60 backdrop-blur-xs transition-all hover:border-emerald-500/40 hover:shadow-xs",
              tri === "depenses_desc" && "ring-2 ring-emerald-500/40 border-emerald-500/50 shadow-xs"
            )}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("clients.chiffreAffaires")}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                {chargement ? (
                  <div className="space-y-1.5 py-0.5">
                    <Skeleton className="h-7 w-28 rounded" />
                    <Skeleton className="h-3.5 w-36 rounded" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold tracking-tight text-foreground truncate">
                      {formatMontant(stats.chiffre_affaires, deviseAffichee)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {lang === "en"
                        ? "Cumulative customer revenue"
                        : "Cumul total des achats"}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-xs transition-all hover:border-sky-500/30 hover:shadow-xs">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("clients.panierMoyen")}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Receipt className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                {chargement ? (
                  <div className="space-y-1.5 py-0.5">
                    <Skeleton className="h-7 w-24 rounded" />
                    <Skeleton className="h-3.5 w-32 rounded" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold tracking-tight text-foreground truncate">
                      {formatMontant(stats.panier_moyen, deviseAffichee)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {lang === "en"
                        ? "Average amount per purchase"
                        : "Montant moyen par vente"}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card
            onClick={() => setTri("achats_desc")}
            title={lang === "en" ? "Click to sort by loyalty" : "Cliquer pour trier par clients fidèles"}
            className={cn(
              "cursor-pointer border-border/60 bg-card/60 backdrop-blur-xs transition-all hover:border-amber-500/40 hover:shadow-xs",
              tri === "achats_desc" && "ring-2 ring-amber-500/40 border-amber-500/50 shadow-xs"
            )}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("clients.clientsFideles")}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Star className="h-4 w-4 fill-amber-500/20" />
                </div>
              </div>
              <div className="mt-3">
                {chargement ? (
                  <div className="space-y-1.5 py-0.5">
                    <Skeleton className="h-7 w-16 rounded" />
                    <Skeleton className="h-3.5 w-32 rounded" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      {stats.clients_fideles}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {stats.total_clients > 0
                        ? `${Math.round((stats.clients_fideles / stats.total_clients) * 100)}% de clients récurrents`
                        : "Plus d'un achat"}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de filtres ergonomique (Recherche + Pilules de tri instantanées) */}
        <Card className="border-border/60 bg-card/40 shadow-2xs">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Champ de recherche */}
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder={t("clients.recherchePlaceholder")}
                  className="pl-9 pr-8 h-9 sm:h-10 bg-background/60 border-border/80 text-xs sm:text-sm"
                />
                {recherche && (
                  <button
                    onClick={() => setRecherche("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/60 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Pilules de tri ergonomiques */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider mr-1 shrink-0">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>{lang === "en" ? "Sort:" : "Trier :"}</span>
                </div>
                {optionsTri.map((opt) => {
                  const Icon = opt.icon;
                  const estActif = tri === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTri(opt.id)}
                      title={opt.description}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all shrink-0 select-none cursor-pointer",
                        estActif
                          ? "bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/30"
                          : "bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/70"
                      )}
                    >
                      <Icon className={cn("h-3.5 w-3.5", estActif ? "text-primary-foreground" : "text-muted-foreground")} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Barre d'action flottante de sélection multiple */}
        {selection.size > 0 && (
          <div className="sticky top-2 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/10 p-3.5 backdrop-blur-md shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {selection.size}
              </span>
              <span className="text-sm font-medium text-foreground">
                {t("clients.clientsSelectionnes", { count: selection.size })}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => telechargerVcard(clientsSelectionnes)}
                disabled={telechargementVcardEnCours}
                className="h-8 gap-1.5 text-xs font-medium bg-background/80"
              >
                {telechargementVcardEnCours ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 text-primary" />
                )}
                <span>{t("clients.exporterVcard")}</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setModalWhatsappOuvert(true)}
                className="h-8 gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-medium shadow-xs"
              >
                <IconeWhatsapp className="h-3.5 w-3.5" monochrome />
                <span>{t("clients.campagneWhatsapp")}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelection(new Set())}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                {lang === "en" ? "Clear" : "Désélectionner"}
              </Button>
            </div>
          </div>
        )}

        {/* Tableau des clients */}
        <Card className="border-border/60 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-10 text-center">
                    <input
                      type="checkbox"
                      checked={tousSelectionnes}
                      onChange={basculerTout}
                      disabled={chargement || clients.length === 0}
                      className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer align-middle"
                    />
                  </TableHead>
                  <TableHead
                    onClick={() => setTri("nom_asc")}
                    className="cursor-pointer select-none group hover:text-primary transition-colors"
                    title={lang === "en" ? "Sort by name (A-Z)" : "Trier par nom (A-Z)"}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={tri === "nom_asc" ? "text-primary font-semibold" : ""}>
                        {t("clients.client")}
                      </span>
                      {tri === "nom_asc" ? (
                        <ArrowDownAZ className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>{t("clients.telephone")}</TableHead>
                  <TableHead
                    onClick={() => setTri("depenses_desc")}
                    className="cursor-pointer select-none group hover:text-primary transition-colors"
                    title={lang === "en" ? "Sort by total spent" : "Trier par total dépensé"}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={tri === "depenses_desc" ? "text-primary font-semibold" : ""}>
                        {t("clients.totalDepense")}
                      </span>
                      {tri === "depenses_desc" ? (
                        <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => setTri("recent")}
                    className="cursor-pointer select-none group hover:text-primary transition-colors"
                    title={lang === "en" ? "Sort by recent purchase" : "Trier par date du dernier achat"}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={tri === "recent" ? "text-primary font-semibold" : ""}>
                        {t("clients.dernierAchat")}
                      </span>
                      {tri === "recent" ? (
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    {t("clients.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chargement ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-border/60">
                      {/* Case à cocher */}
                      <TableCell className="text-center">
                        <Skeleton className="h-4 w-4 rounded mx-auto" />
                      </TableCell>
                      {/* Client (Avatar + Nom + Badge) */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <Skeleton className="h-4 w-32 rounded" />
                            <Skeleton className="h-3 w-16 rounded" />
                          </div>
                        </div>
                      </TableCell>
                      {/* Téléphone */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="h-4 w-28 rounded" />
                          <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                        </div>
                      </TableCell>
                      {/* Total dépensé */}
                      <TableCell>
                        <Skeleton className="h-4 w-20 rounded" />
                      </TableCell>
                      {/* Dernier achat */}
                      <TableCell>
                        <Skeleton className="h-3.5 w-24 rounded" />
                      </TableCell>
                      {/* Actions */}
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-24 rounded-lg ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                          <UserCheck className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {recherche || boutiqueActive
                            ? t("clients.aucunClient")
                            : t("clients.aucunAchat")}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {recherche || boutiqueActive
                            ? t("clients.aucunClientDesc")
                            : lang === "en"
                            ? "Customers will appear here automatically as soon as sales are recorded."
                            : "Les clients apparaîtront automatiquement ici dès que des ventes seront enregistrées."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => {
                    const estSelectionne = selection.has(client.cle);
                    const initiales = client.nom
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();

                    const numeroPropre = client.telephone.replace(
                      /[^\d+]/g,
                      ""
                    );

                    return (
                      <TableRow
                        key={client.cle}
                        className={`transition-colors ${
                          estSelectionne
                            ? "bg-primary/5 hover:bg-primary/10"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        {/* Case à cocher */}
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={estSelectionne}
                            onChange={() => basculerClient(client.cle)}
                            className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer align-middle"
                          />
                        </TableCell>

                        {/* Nom & Avatar */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
                              {initiales || <User className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {client.nom}
                              </p>
                              {client.nombre_achats > 1 && (
                                <span className="inline-flex items-center gap-0.5 rounded-sm bg-amber-500/15 px-1.5 py-0.2 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                                  <Star className="h-2.5 w-2.5 fill-amber-500" />
                                  {lang === "en" ? "Loyal" : "Fidèle"}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Téléphone avec liens rapides */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-foreground">
                              {client.telephone || "—"}
                            </span>
                            {numeroPropre && (
                              <div className="flex items-center gap-1 ml-1">
                                <a
                                  href={`https://wa.me/${numeroPropre.replace(/^\+/, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={t("clients.ecrireWhatsapp")}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:opacity-85 transition-opacity"
                                >
                                  <IconeWhatsapp className="h-4 w-4" />
                                </a>
                                <a
                                  href={`tel:${numeroPropre}`}
                                  title={t("clients.appeler")}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Nombre d'achats & aperçu appareils */}
                        {/* <TableCell>
                          <div>
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                              {client.nombre_achats}{" "}
                              {client.nombre_achats > 1
                                ? lang === "en"
                                  ? "devices"
                                  : "appareils"
                                : lang === "en"
                                ? "device"
                                : "appareil"}
                            </span>
                            {client.derniers_appareils.length > 0 && (
                              <p className="mt-1 text-[11px] text-muted-foreground truncate max-w-[180px]">
                                {client.derniers_appareils.join(", ")}
                              </p>
                            )}
                          </div>
                        </TableCell> */}

                        {/* Total Dépensé */}
                        <TableCell>
                          <span className="font-semibold text-foreground text-sm">
                            {formatMontant(client.total_depense, deviseAffichee)}
                          </span>
                        </TableCell>

                        {/* Dernier achat */}
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            <span className="text-foreground font-medium block">
                              {formatDate(client.dernier_achat)}
                            </span>
                            {/* <span>{client.dernier_achat.slice(11, 16)}</span> */}
                          </div>
                        </TableCell>

                        {/* Boutiques */}
                        {/* <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {client.boutiques.map((b) => (
                              <Badge
                                key={b.id}
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 bg-muted/30"
                              >
                                {b.nom}
                              </Badge>
                            ))}
                          </div>
                        </TableCell> */}

                        {/* Actions */}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => ouvrirFicheClient(client)}
                            className="h-8 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>{t("clients.voirFiche")}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* MODAL 1 : CAMPAGNE & DIFFUSION WHATSAPP */}
      <Dialog
        open={modalWhatsappOuvert}
        onOpenChange={setModalWhatsappOuvert}
      >
        <DialogContent className="w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[92dvh] flex flex-col">
          <DialogHeader className="pr-12">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 ring-1 ring-[#25D366]/30">
                <IconeWhatsapp className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold">
                  {t("clients.modalWhatsappTitre")}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {t("clients.modalWhatsappDesc")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogCorps className="space-y-5">
            {/* Guide rapide Liste de Diffusion WhatsApp */}
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 sm:p-5 dark:bg-emerald-950/30 space-y-3.5">
              <h4 className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t("clients.guideDiffusionTitre")}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-950 dark:text-emerald-200">
                <div className="p-3 rounded-lg bg-background/80 border border-emerald-500/15">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                    {lang === "en" ? "1. Export contacts" : "1. Exporter les contacts"}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("clients.guideDiffusionEtape1")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/80 border border-emerald-500/15">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                    {lang === "en" ? "2. Open vCard (.vcf)" : "2. Ouvrir le fichier .vcf"}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("clients.guideDiffusionEtape2")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/80 border border-emerald-500/15">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                    {lang === "en" ? "3. WhatsApp Broadcast" : "3. Liste de diffusion"}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("clients.guideDiffusionEtape3")}
                  </p>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => telechargerVcard(clientsSelectionnes)}
                  disabled={telechargementVcardEnCours || clientsSelectionnes.length === 0}
                  className="h-9 gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold shadow-xs"
                >
                  {telechargementVcardEnCours ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>
                    {t("clients.telechargerVcard")} ({clientsSelectionnes.length})
                  </span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={copierNumeros}
                  className="h-9 gap-2 text-xs bg-background"
                >
                  {numerosCopies ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span>{t("clients.copierNumeros")}</span>
                </Button>
              </div>
            </div>

            {/* Modèle de message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message-promo" className="text-xs font-semibold text-foreground">
                  {t("clients.modeleMessage")}
                </Label>
                <span className="text-xs text-muted-foreground">
                  {t("clients.variablesDisponibles")}
                </span>
              </div>
              <Textarea
                id="message-promo"
                rows={4}
                value={messagePromo}
                onChange={(e) => setMessagePromo(e.target.value)}
                className="text-sm font-sans leading-relaxed resize-y bg-background min-h-[95px]"
              />
            </div>

            {/* Aperçu bulle WhatsApp */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {t("clients.apercuWhatsapp")}
              </span>
              <div className="rounded-xl border border-border/80 bg-[#EFEAE2] p-4 sm:p-5 dark:bg-neutral-900 shadow-inner">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-xl bg-white p-3.5 text-xs sm:text-sm leading-relaxed text-neutral-900 shadow-xs dark:bg-emerald-950 dark:text-emerald-100 rounded-tl-xs">
                  <p className="whitespace-pre-wrap">{apercuMessage}</p>
                  <div className="mt-1.5 flex items-center justify-end gap-1.5 text-[11px] text-neutral-500 dark:text-emerald-300/70">
                    <span>12:00</span>
                    <span className="text-sky-500 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste rapide des clients pour envoi individuel */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                {t("clients.envoyerIndividuel")} ({clientsSelectionnes.length})
              </Label>
              <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/40 border border-border/60 rounded-xl p-2 bg-muted/20">
                {clientsSelectionnes.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    {lang === "en" ? "No clients selected." : "Aucun client sélectionné."}
                  </p>
                ) : (
                  clientsSelectionnes.map((client) => {
                    const lien = genererLienWhatsapp(client, messagePromo);
                    return (
                      <div
                        key={client.cle}
                        className="flex items-center justify-between py-2 px-2 text-xs hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <span className="font-semibold text-foreground block truncate">
                            {client.nom}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {client.telephone}
                          </span>
                        </div>
                        <a
                          href={lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors shrink-0"
                        >
                          <IconeWhatsapp className="h-3.5 w-3.5" monochrome />
                          <span>{lang === "en" ? "Send" : "Envoyer"}</span>
                        </a>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </DialogCorps>

          <DialogFooter className="border-t border-border/60 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalWhatsappOuvert(false)}
              className="px-5"
            >
              {lang === "en" ? "Close" : "Fermer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2 : FICHE CLIENT DÉTAILLÉE */}
      <Dialog
        open={Boolean(clientEnConsultation)}
        onOpenChange={(ouvert) => {
          if (!ouvert) setClientEnConsultation(null);
        }}
      >
        <DialogContent className="w-[94vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-base ring-2 ring-primary/20">
                  {clientEnConsultation?.nom
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || <User className="h-5 w-5" />}
                </div>
                <div>
                  <DialogTitle className="text-lg">
                    {clientEnConsultation?.nom}
                  </DialogTitle>
                  <DialogDescription className="font-mono text-xs">
                    {clientEnConsultation?.telephone}
                  </DialogDescription>
                </div>
              </div>

              {clientEnConsultation?.telephone && (
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${clientEnConsultation.telephone.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors"
                  >
                    <IconeWhatsapp className="h-4 w-4" monochrome />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </DialogHeader>

          <DialogCorps className="space-y-4">
            {/* Résumé métriques client */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-4 text-center">
              <div>
                <span className="text-[11px] text-muted-foreground block">
                  {t("clients.achats")}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {clientEnConsultation?.nombre_achats}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">
                  {t("clients.totalDepense")}
                </span>
                <span className="text-lg font-bold text-primary">
                  {formatMontant(
                    clientEnConsultation?.total_depense ?? 0,
                    deviseAffichee
                  )}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">
                  {t("clients.dernierAchat")}
                </span>
                <span className="text-xs font-semibold text-foreground block mt-1">
                  {clientEnConsultation?.dernier_achat
                    ? formatDate(clientEnConsultation.dernier_achat)
                    : "—"}
                </span>
              </div>
            </div>

            {/* Liste chronologique des achats */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("clients.historiqueAchats")}
              </h4>

              {chargementFiche ? (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>{t("clients.appareil")}</TableHead>
                        <TableHead>{t("clients.imei")}</TableHead>
                        <TableHead>{t("clients.prix")}</TableHead>
                        <TableHead>{t("clients.dateVente")}</TableHead>
                        <TableHead>{t("clients.vendeur")}</TableHead>
                        <TableHead className="text-right">{t("clients.voirFacture")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-28 rounded" /></TableCell>
                          <TableCell><Skeleton className="h-3.5 w-32 rounded font-mono" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                          <TableCell><Skeleton className="h-3.5 w-20 rounded" /></TableCell>
                          <TableCell><Skeleton className="h-3.5 w-24 rounded" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-7 w-16 rounded ml-auto" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : !detailsClient || detailsClient.achats.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  {t("clients.aucunAchat")}
                </p>
              ) : (
                <div className="rounded-lg border border-border/60 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead>{t("clients.appareil")}</TableHead>
                        <TableHead>{t("clients.imei")}</TableHead>
                        <TableHead>{t("clients.prix")}</TableHead>
                        <TableHead>{t("clients.dateVente")}</TableHead>
                        <TableHead>{t("clients.vendeur")}</TableHead>
                        <TableHead className="text-right">
                          {t("clients.voirFacture")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailsClient.achats.map((achat) => (
                        <TableRow key={achat.id}>
                          <TableCell className="font-medium text-xs">
                            <span className="text-foreground block">
                              {achat.telephone.marque} {achat.telephone.modele}
                            </span>
                            {achat.telephone.couleur && (
                              <span className="text-[11px] text-muted-foreground">
                                {achat.telephone.couleur}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {achat.telephone.imei || "—"}
                          </TableCell>
                          <TableCell className="font-semibold text-xs text-foreground">
                            {formatMontant(achat.prix, deviseAffichee)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(achat.date)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {achat.vendeur_nom}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={chargementFacture}
                              onClick={() => voirFactureAchat(achat)}
                              className="h-7 gap-1 text-[11px] font-medium"
                            >
                              <FileText className="h-3 w-3 text-primary" />
                              <span>{t("clients.voirFacture")}</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </DialogCorps>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClientEnConsultation(null)}
            >
              {lang === "en" ? "Close" : "Fermer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3 : FACTURE IMPRIMABLE */}
      <ModalFacture
        mouvement={factureSelectionnee}
        ouvert={Boolean(factureSelectionnee)}
        onFermer={() => setFactureSelectionnee(null)}
      />
    </>
  );
}
