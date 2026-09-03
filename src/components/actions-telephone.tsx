"use client";

/**
 * Les actions possibles sur un appareil : vendre, réserver, retour,
 * réparation, perte, transfert, correction.
 */

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import type { StatutTelephone, Telephone } from "@/types";

/** Les champs qu'une action demande. */
type Champ = "prix" | "client" | "motif" | "commentaire" | "boutique" | "statut";

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
    champs: ["prix", "client", "commentaire"],
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
  const [clientNom, setClientNom] = useState("");
  const [clientTelephone, setClientTelephone] = useState("");
  const [motif, setMotif] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [boutiqueId, setBoutiqueId] = useState<string | null>(null);
  const [statut, setStatut] = useState<StatutTelephone>("en_stock");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  // Rate limiting dynamique sur les actions de stock
  const rateLimitStock = useRateLimit();

  const destinations = boutiques.filter((b) => b.id !== telephone.boutique?.id);

  function reinitialiser() {
    setPrix(prixInitialPlaceholder);
    setClientNom("");
    setClientTelephone("");
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

    if (action.champs.includes("prix")) {
      if (prix) {
        const montantSaisi = Number(prix);
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
      const reponse = await api.post<{ message: string }>(
        `/telephones/${telephone.id}/${action.route}`,
        corps,
      );
      toast.success(reponse.message || t("telephones.mouvementEnregistre"));
      reinitialiser();
      onSucces();
      router.refresh();
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
    <Dialog
      open={action !== null}
      onOpenChange={(ouvert) => {
        if (!ouvert) onFermer();
        else reinitialiser();
      }}
    >
      <DialogContent>
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
                      {t("telephones.prixVendu")} ({devise})
                    </Label>
                    <Input
                      id="prix"
                      type="number"
                      min={0}
                      className="chiffres h-10"
                      value={prix}
                      onChange={(e) => setPrix(e.target.value)}
                      placeholder={prixInitialPlaceholder}
                    />
                    <p className="text-xs text-muted-foreground">
                      {lang === "en"
                        ? "Leave as is if customer pays listed price."
                        : "Laissez tel quel si le client paie le prix affiché."}
                    </p>
                  </div>
                )}

                {action.champs.includes("client") && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="client-nom">
                        {t("telephones.clientNom")}
                        {action.cle === "reservation" && (
                          <span className="ml-0.5 text-destructive">*</span>
                        )}
                      </Label>
                      <Input
                        id="client-nom"
                        className="h-10"
                        required={action.cle === "reservation"}
                        value={clientNom}
                        onChange={(e) => setClientNom(e.target.value)}
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
                      </Label>
                      <ChampTelephone
                        id="client-tel"
                        valeur={clientTelephone}
                        onChange={setClientTelephone}
                      />
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
                          libelle: b.nom,
                          description: b.ville ?? undefined,
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
  );
}
