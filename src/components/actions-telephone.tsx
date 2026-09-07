"use client";

/**
 * Les actions possibles sur un appareil : vendre, réserver, retour,
 * réparation, perte, transfert, correction.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Banknote,
  BookmarkCheck,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Undo2,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useRateLimit } from "@/lib/useRateLimit";
import { AlerteRateLimit } from "@/components/ui/alerte-rate-limit";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { permissions } from "@/lib/permissions";
import { convertirMontant, obtenirDevise } from "@/lib/devises";
import { Button } from "@/components/ui/button";
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
import { ChampPrix } from "@/components/ui/champ-prix";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectRecherche } from "@/components/ui/select-recherche";
import { ChampTelephone } from "@/components/champ-telephone";
import { ChampClient } from "@/components/champ-client";
import { Textarea } from "@/components/ui/textarea";
import { ModalFacture } from "@/components/facture/modal-facture";
import type { ModePaiementVente, Mouvement, StatutTelephone, Telephone } from "@/types";

/** Les champs qu'une action demande. */
type Champ = "prix" | "paiement" | "client" | "motif" | "commentaire" | "boutique" | "statut";

type ActionDef = {
  cle: string;
  cleLibelle: string;
  cleDesc: string;
  route: string;
  icone: LucideIcon;
  depuis: StatutTelephone[];
  champs: Champ[];
  corpsFixe?: Record<string, unknown>;
  destructive?: boolean;
  autorise: (role: "proprietaire" | "vendeuse" | "secretaire" | "admin") => boolean;
};

const actions: ActionDef[] = [
  {
    cle: "vente",
    cleLibelle: "telephones.actionVente",
    cleDesc: "telephones.enregistrerVenteTitre",
    route: "vente",
    icone: Banknote,
    depuis: ["en_stock", "reserve"],
    champs: ["prix", "paiement", "client", "commentaire"],
    autorise: permissions.bougerStock,
  },
  {
    cle: "reservation",
    cleLibelle: "telephones.actionReservation",
    cleDesc: "telephones.reservationTitre",
    route: "reservation",
    icone: BookmarkCheck,
    depuis: ["en_stock"],
    champs: ["client", "commentaire"],
    autorise: permissions.bougerStock,
  },
  {
    cle: "annuler-reservation",
    cleLibelle: "telephones.actionCorrection",
    cleDesc: "telephones.reservationTitre",
    route: "retour",
    icone: Undo2,
    depuis: ["reserve"],
    champs: ["motif"],
    autorise: permissions.bougerStock,
  },
  {
    cle: "retour",
    cleLibelle: "typesMouvement.retour",
    cleDesc: "telephones.actionCorrection",
    route: "retour",
    icone: RotateCcw,
    depuis: ["vendu"],
    champs: ["motif", "commentaire"],
    autorise: permissions.bougerStock,
  },
  {
    cle: "sav-depart",
    cleLibelle: "telephones.actionSav",
    cleDesc: "telephones.savTitre",
    route: "sav",
    icone: Wrench,
    depuis: ["en_stock", "vendu"],
    champs: ["motif", "commentaire"],
    corpsFixe: { sens: "depart" },
    autorise: permissions.bougerStock,
  },
  {
    cle: "sav-retour",
    cleLibelle: "telephones.actionRetourSav",
    cleDesc: "telephones.savTitre",
    route: "sav",
    icone: Wrench,
    depuis: ["sav"],
    champs: ["motif", "commentaire"],
    corpsFixe: { sens: "retour" },
    autorise: permissions.bougerStock,
  },
  {
    cle: "transfert",
    cleLibelle: "telephones.actionTransfert",
    cleDesc: "telephones.transfertTitre",
    route: "transfert",
    icone: ArrowLeftRight,
    depuis: ["en_stock", "reserve"],
    champs: ["boutique", "motif"],
    autorise: permissions.transferer,
  },
  {
    cle: "perte",
    cleLibelle: "telephones.actionPerte",
    cleDesc: "telephones.perteTitre",
    route: "perte",
    icone: ShieldAlert,
    depuis: ["en_stock", "reserve", "sav"],
    champs: ["motif", "commentaire"],
    destructive: true,
    autorise: permissions.bougerStock,
  },
  {
    cle: "correction",
    cleLibelle: "telephones.actionCorrection",
    cleDesc: "telephones.actionCorrection",
    route: "correction",
    icone: ShieldAlert,
    depuis: ["en_stock", "reserve", "vendu", "sav", "perdu"],
    champs: ["statut", "motif", "commentaire"],
    destructive: true,
    autorise: permissions.corriger,
  },
];

export function ActionsTelephone({
  telephone,
  surSucces,
}: {
  telephone: Telephone;
  surSucces: () => void;
}) {
  const { utilisateur } = useAuth();
  const { t } = useI18n();
  const [ouverte, setOuverte] = useState<ActionDef | null>(null);

  if (!utilisateur) return null;

  const disponibles = actions.filter(
    (action) =>
      action.depuis.includes(telephone.statut) &&
      action.autorise(utilisateur.role),
  );

  if (disponibles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("telephones.aucunHistorique")}
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {disponibles.map((action) => {
          const Icone = action.icone;
          return (
            <Button
              key={action.cle}
              variant={action.destructive ? "outline" : "default"}
              onClick={() => setOuverte(action)}
            >
              <Icone className="mr-2 h-4 w-4" />
              {t(action.cleLibelle)}
            </Button>
          );
        })}
      </div>

      <FenetreAction
        action={ouverte}
        telephone={telephone}
        onFermer={() => setOuverte(null)}
        onSucces={() => {
          setOuverte(null);
          surSucces();
        }}
      />
    </>
  );
}

function FenetreAction({
  action,
  telephone,
  onFermer,
  onSucces,
}: {
  action: ActionDef | null;
  telephone: Telephone;
  onFermer: () => void;
  onSucces: () => void;
}) {
  const router = useRouter();
  const { boutiques, devise, deviseBoutique } = useAuth();
  const { t, libelleStatut, lang } = useI18n();

  const deviseOrigine = telephone.boutique?.devise ?? deviseBoutique;
  const configDevise = obtenirDevise(devise);
  const prixConverti = convertirMontant(telephone.prix_vente || 0, deviseOrigine, devise);
  const prixInitialPlaceholder = prixConverti > 0
    ? String(configDevise.decimales === 0 ? Math.round(prixConverti) : Number(prixConverti.toFixed(configDevise.decimales)))
    : "";

  const [prix, setPrix] = useState("");
  const [modePaiement, setModePaiement] = useState<ModePaiementVente>("cash");
  const [clientNom, setClientNom] = useState("");
  const [clientTelephone, setClientTelephone] = useState("");
  const [motif, setMotif] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [boutiqueId, setBoutiqueId] = useState<string | null>(null);
  const [statut, setStatut] = useState<StatutTelephone>("en_stock");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [factureVente, setFactureVente] = useState<Mouvement | null>(null);

  // Rate limiting dynamique sur les actions de stock
  const rateLimitStock = useRateLimit();

  const destinations = boutiques.filter((b) => b.id !== telephone.boutique?.id);

  // Pré-remplissage client lors de la vente d'un appareil réservé
  useEffect(() => {
    if (!action) return;

    setPrix(prixInitialPlaceholder);
    setModePaiement("cash");
    setMotif("");
    setCommentaire("");
    setBoutiqueId("");
    setStatut("en_stock");
    setErreurs({});
    rateLimitStock.arreter();

    if (action.cle === "vente" && telephone.statut === "reserve") {
      if (telephone.client_nom) {
        setClientNom(telephone.client_nom);
        setClientTelephone(telephone.client_telephone || "");
      } else {
        // Fallback si l'appareil a été réservé avant la persistance directe : on lit les mouvements
        api
          .get<{ data: Mouvement[] }>(`/telephones/${telephone.id}/mouvements`)
          .then((res) => {
            const resa = res.data?.find((m) => m.type === "reservation" && m.client_nom);
            if (resa) {
              setClientNom(resa.client_nom || "");
              setClientTelephone(resa.client_telephone || "");
            }
          })
          .catch(() => {});
      }
    } else {
      setClientNom("");
      setClientTelephone("");
    }
  }, [action, telephone, prixInitialPlaceholder]);

  function reinitialiser() {
    setPrix(prixInitialPlaceholder);
    setModePaiement("cash");
    if (action?.cle === "vente" && telephone.statut === "reserve" && telephone.client_nom) {
      setClientNom(telephone.client_nom);
      setClientTelephone(telephone.client_telephone || "");
    } else {
      setClientNom("");
      setClientTelephone("");
    }
    setMotif("");
    setCommentaire("");
    setBoutiqueId("");
    setStatut("en_stock");
    setErreurs({});
    rateLimitStock.arreter();
  }

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!action || rateLimitStock.estBloque || envoiEnCours) return;

    setErreurs({});
    setEnvoiEnCours(true);

    const corps: Record<string, unknown> = { ...action.corpsFixe };

    if (action.cle === "vente" || action.cle === "reservation") {
      const errs: Record<string, string> = {};
      if (!clientNom.trim()) {
        errs.client_nom = t("commun.champRequis");
      }
      if (!clientTelephone.trim()) {
        errs.client_telephone = t("commun.champRequis");
      }
      if (Object.keys(errs).length > 0) {
        setErreurs(errs);
        setEnvoiEnCours(false);
        return;
      }
      if (action.cle === "vente") {
        corps.mode_paiement = modePaiement;
      }
    }

    if (action.champs.includes("prix")) {
      const prixFinal = prix.trim() !== "" ? prix : prixInitialPlaceholder;
      if (prixFinal) {
        const montantSaisi = Number(prixFinal.replace(/\s+/g, "").replace(",", "."));
        const montantDeviseBoutique = convertirMontant(montantSaisi, devise, deviseOrigine);
        const configBoutique = obtenirDevise(deviseOrigine);
        corps.prix = configBoutique.decimales === 0
          ? Math.round(montantDeviseBoutique)
          : Number(montantDeviseBoutique.toFixed(configBoutique.decimales));
      } else {
        corps.prix = null;
      }
    }
    if (action.champs.includes("client")) {
      corps.client_nom = clientNom || null;
      corps.client_telephone = clientTelephone || null;
    }
    if (action.champs.includes("motif")) corps.motif = motif || null;
    if (action.champs.includes("commentaire")) {
      corps.commentaire = commentaire || null;
    }
    if (action.champs.includes("boutique")) {
      corps.boutique_destination_id = String(boutiqueId);
    }
    if (action.champs.includes("statut")) corps.statut = statut;

    try {
      const reponse = await api.post<{ message: string; data?: Mouvement }>(
        `/telephones/${telephone.id}/${action.route}`,
        corps,
      );
      toast.success(reponse.message || t("telephones.mouvementEnregistre"));

      if (action.cle === "vente" && reponse.data) {
        setFactureVente(reponse.data);
      } else {
        reinitialiser();
        onSucces();
        router.refresh();
      }
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        rateLimitStock.gererErreur(e);
        toast.error(e.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  const statutsDispo: StatutTelephone[] = [
    "en_stock",
    "reserve",
    "vendu",
    "sav",
    "perdu",
  ];

  return (
    <>
      <Dialog
        open={action !== null && factureVente === null}
        onOpenChange={(ouvert) => {
          if (!ouvert) onFermer();
          else reinitialiser();
        }}
      >
      <DialogContent className="sm:max-w-xl md:max-w-2xl">
        {action && (
          <>
            <form onSubmit={envoyer} className="flex min-h-0 flex-1 flex-col">
              <DialogHeader>
                <DialogTitle>{t(action.cleLibelle)}</DialogTitle>
                <DialogDescription>
                  {telephone.modele?.libelle} · {t(action.cleDesc)}
                </DialogDescription>
              </DialogHeader>

              <DialogCorps>
                {action.champs.includes("prix") && (
                  <div className="space-y-2">
                    <Label htmlFor="prix">
                      {t("telephones.prixVendu")}
                    </Label>
                    <ChampPrix
                      id="prix"
                      devise={devise}
                      valeur={prix}
                      onChange={setPrix}
                      placeholder={prixInitialPlaceholder}
                      permettreDecimales={configDevise.decimales > 0}
                    />
                    <p className="text-xs text-muted-foreground">
                      {lang === "en"
                        ? "Leave as is if customer pays listed price."
                        : "Laissez tel quel si le client paie le prix affiché."}
                    </p>
                  </div>
                )}

                {action.champs.includes("paiement") && (
                  <div className="space-y-2">
                    <Label htmlFor="mode-paiement">
                      {t("factures.moyenPaiement")}
                      <span className="ml-0.5 text-destructive">*</span>
                    </Label>
                    <Select
                      items={{
                        cash: t("factures.cash"),
                        om_momo: t("factures.omMomo"),
                      }}
                      value={modePaiement}
                      onValueChange={(v) =>
                        setModePaiement((v ?? "cash") as ModePaiementVente)
                      }
                    >
                      <SelectTrigger id="mode-paiement" className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">{t("factures.cash")}</SelectItem>
                        <SelectItem value="om_momo">{t("factures.omMomo")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {action.champs.includes("client") && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="client-nom">
                        {t("telephones.clientNom")}
                        {(action.cle === "reservation" || action.cle === "vente") && (
                          <span className="ml-0.5 text-destructive">*</span>
                        )}
                      </Label>
                      <ChampClient
                        id="client-nom"
                        required={action.cle === "reservation" || action.cle === "vente"}
                        valeurNom={clientNom}
                        onNomChange={setClientNom}
                        valeurTelephone={clientTelephone}
                        onTelephoneChange={setClientTelephone}
                        erreur={erreurs.client_nom}
                      />
                      {erreurs.client_nom && (
                        <p className="text-xs text-destructive">
                          {erreurs.client_nom}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client-tel">
                        {t("telephones.clientTelephone")}
                        <span className="ml-0.5 text-destructive">*</span>
                      </Label>
                      <ChampTelephone
                        id="client-tel"
                        valeur={clientTelephone}
                        onChange={(val) => {
                          setClientTelephone(val);
                          if (erreurs.client_telephone) {
                            setErreurs((prev) => {
                              const copie = { ...prev };
                              delete copie.client_telephone;
                              return copie;
                            });
                          }
                        }}
                        erreur={Boolean(erreurs.client_telephone)}
                      />
                      {erreurs.client_telephone && (
                        <p className="text-xs text-destructive">
                          {erreurs.client_telephone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {action.champs.includes("boutique") && (
                  <div className="space-y-2">
                    <Label>
                      {t("telephones.boutiqueDestination")}
                      <span className="ml-0.5 text-destructive">*</span>
                    </Label>
                    {destinations.length === 0 ? (
                      <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                        {lang === "en"
                          ? "You do not have access to any other store."
                          : "Vous n'avez accès à aucune autre boutique."}
                      </p>
                    ) : (
                      <SelectRecherche
                        options={destinations.map((b) => ({
                          valeur: String(b.id),
                          libelle: b.libelle_complet || (b.adresse ? `${b.nom} — ${b.adresse}` : b.nom),
                          description: [b.adresse, b.ville].filter(Boolean).join(" · ") || undefined,
                        }))}
                        valeur={boutiqueId}
                        onChange={(v) => setBoutiqueId(v)}
                        placeholder={
                          lang === "en" ? "Select store" : "Choisir la boutique"
                        }
                        placeholderRecherche={
                          lang === "en" ? "Search store..." : "Rechercher une boutique…"
                        }
                      />
                    )}
                    {erreurs.boutique_destination_id && (
                      <p className="text-xs text-destructive">
                        {erreurs.boutique_destination_id}
                      </p>
                    )}
                  </div>
                )}

                {action.champs.includes("statut") && (
                  <div className="space-y-2">
                    <Label>{t("commun.statut")}</Label>
                    <Select
                      items={Object.fromEntries(
                        statutsDispo.map((s) => [s, libelleStatut(s)]),
                      )}
                      value={statut}
                      onValueChange={(v) =>
                        setStatut((v ?? "en_stock") as StatutTelephone)
                      }
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statutsDispo.map((valeur) => (
                          <SelectItem key={valeur} value={valeur}>
                            {libelleStatut(valeur)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {action.champs.includes("motif") && (
                  <div className="space-y-2">
                    <Label htmlFor="motif">
                      {t("telephones.motif")}
                      {(action.cle === "perte" ||
                        action.cle === "correction") && (
                        <span className="ml-0.5 text-destructive">*</span>
                      )}
                    </Label>
                    <Input
                      id="motif"
                      className="h-10"
                      required={
                        action.cle === "perte" || action.cle === "correction"
                      }
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                      placeholder={
                        action.cle === "perte"
                          ? lang === "en"
                            ? "Lost, stolen, damaged..."
                            : "Vol, casse, disparition…"
                          : lang === "en"
                            ? "Specify reason"
                            : "Précisez la raison"
                      }
                    />
                    {erreurs.motif && (
                      <p className="text-xs text-destructive">
                        {erreurs.motif}
                      </p>
                    )}
                  </div>
                )}

                {action.champs.includes("commentaire") && (
                  <div className="space-y-2">
                    <Label htmlFor="commentaire">
                      {t("telephones.commentaire")}
                    </Label>
                    <Textarea
                      id="commentaire"
                      rows={2}
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                    />
                  </div>
                )}

                {erreurs.statut && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {erreurs.statut}
                  </p>
                )}

                {rateLimitStock.estBloque && (
                  <AlerteRateLimit
                    secondes={rateLimitStock.secondes}
                    message={rateLimitStock.message}
                    compact
                  />
                )}
              </DialogCorps>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onFermer}>
                  {t("commun.annuler")}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    envoiEnCours ||
                    rateLimitStock.estBloque ||
                    (action.champs.includes("boutique") && !boutiqueId)
                  }
                >
                  {envoiEnCours && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {rateLimitStock.estBloque
                    ? t("auth.reessayerDans", {
                        secondes: rateLimitStock.secondes,
                      })
                    : t("commun.valider")}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>

      <ModalFacture
        ouvert={factureVente !== null}
        onFermer={() => {
          setFactureVente(null);
          reinitialiser();
          onSucces();
          router.refresh();
        }}
        mouvement={factureVente}
      />
    </>
  );
}
