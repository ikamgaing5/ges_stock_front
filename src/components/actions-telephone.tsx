"use client";

/**
 * Les actions possibles sur un appareil : vendre, réserver, retour,
 * réparation, perte, transfert, correction.
 *
 * Chaque action ouvre une petite fenêtre avec uniquement les champs qui
 * la concernent. On n'affiche que les actions réellement possibles depuis
 * le statut courant : proposer « Vendre » sur un appareil déjà vendu ne
 * servirait qu'à produire une erreur.
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
import { useAuth } from "@/components/auth-provider";
import { permissions } from "@/lib/permissions";
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
import { Textarea } from "@/components/ui/textarea";
import { libellesStatuts } from "@/lib/format";
import type { StatutTelephone, Telephone } from "@/types";

/** Les champs qu'une action demande. */
type Champ = "prix" | "client" | "motif" | "commentaire" | "boutique" | "statut";

type Action = {
  cle: string;
  libelle: string;
  /** Chemin appelé sur l'API, après /telephones/{id}/ */
  route: string;
  icone: LucideIcon;
  /** Depuis quels statuts cette action est proposée. */
  depuis: StatutTelephone[];
  champs: Champ[];
  description: string;
  /** Corps supplémentaire envoyé systématiquement. */
  corpsFixe?: Record<string, unknown>;
  destructive?: boolean;
  /** Qui a le droit de déclencher cette action. */
  autorise: (role: "proprietaire" | "vendeuse" | "secretaire" | "admin") => boolean;
};

const actions: Action[] = [
  {
    cle: "vente",
    libelle: "Vendre",
    route: "vente",
    icone: Banknote,
    depuis: ["en_stock", "reserve"],
    champs: ["prix", "client", "commentaire"],
    description: "L'appareil sort du stock et passe en « vendu ».",
    autorise: permissions.bougerStock,
  },
  {
    cle: "reservation",
    libelle: "Réserver",
    route: "reservation",
    icone: BookmarkCheck,
    depuis: ["en_stock"],
    champs: ["client", "commentaire"],
    description: "Mis de côté pour un client, sans sortir du stock.",
    autorise: permissions.bougerStock,
  },
  {
    cle: "annuler-reservation",
    libelle: "Annuler la réservation",
    route: "retour",
    icone: Undo2,
    depuis: ["reserve"],
    champs: ["motif"],
    description: "L'appareil redevient disponible à la vente.",
    autorise: permissions.bougerStock,
  },
  {
    cle: "retour",
    libelle: "Retour client",
    route: "retour",
    icone: RotateCcw,
    depuis: ["vendu"],
    champs: ["motif", "commentaire"],
    description: "Le client rapporte l'appareil : il revient en stock.",
    autorise: permissions.bougerStock,
  },
  {
    cle: "sav-depart",
    libelle: "Envoyer en réparation",
    route: "sav",
    icone: Wrench,
    depuis: ["en_stock", "vendu"],
    champs: ["motif", "commentaire"],
    corpsFixe: { sens: "depart" },
    description: "L'appareil part au service après-vente.",
    autorise: permissions.bougerStock,
  },
  {
    cle: "sav-retour",
    libelle: "Revenu de réparation",
    route: "sav",
    icone: Wrench,
    depuis: ["sav"],
    champs: ["motif", "commentaire"],
    corpsFixe: { sens: "retour" },
    description: "L'appareil est réparé et remis en stock.",
    autorise: permissions.bougerStock,
  },
  {
    cle: "transfert",
    libelle: "Transférer",
    route: "transfert",
    icone: ArrowLeftRight,
    depuis: ["en_stock", "reserve"],
    champs: ["boutique", "motif"],
    description: "Déplacer l'appareil vers une autre de vos boutiques.",
    autorise: permissions.transferer,
  },
  {
    cle: "perte",
    libelle: "Déclarer perdu",
    route: "perte",
    icone: ShieldAlert,
    depuis: ["en_stock", "reserve", "sav"],
    champs: ["motif", "commentaire"],
    description: "Vol, casse ou disparition. L'appareil sort du stock.",
    destructive: true,
    autorise: permissions.bougerStock,
  },
  {
    cle: "correction",
    libelle: "Corriger le statut",
    route: "correction",
    icone: ShieldAlert,
    depuis: ["en_stock", "reserve", "vendu", "sav", "perdu"],
    champs: ["statut", "motif", "commentaire"],
    description:
      "Rattrape une situation incohérente. La correction reste dans l'historique.",
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
  const [ouverte, setOuverte] = useState<Action | null>(null);

  if (!utilisateur) return null;

  const disponibles = actions.filter(
    (action) =>
      action.depuis.includes(telephone.statut) && action.autorise(utilisateur.role),
  );

  if (disponibles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune action disponible sur cet appareil avec votre rôle.
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
              {action.libelle}
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

/* -------------------------------------------------------------------------- */

function FenetreAction({
  action,
  telephone,
  onFermer,
  onSucces,
}: {
  action: Action | null;
  telephone: Telephone;
  onFermer: () => void;
  onSucces: () => void;
}) {
  const router = useRouter();
  const { boutiques, devise } = useAuth();

  const [prix, setPrix] = useState("");
  const [clientNom, setClientNom] = useState("");
  const [clientTelephone, setClientTelephone] = useState("");
  const [motif, setMotif] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [boutiqueId, setBoutiqueId] = useState<string | null>(null);
  const [statut, setStatut] = useState<StatutTelephone>("en_stock");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  // Les autres boutiques : on ne transfère pas vers celle où l'on est déjà.
  const destinations = boutiques.filter((b) => b.id !== telephone.boutique?.id);

  function reinitialiser() {
    setPrix(String(telephone.prix_vente || ""));
    setClientNom("");
    setClientTelephone("");
    setMotif("");
    setCommentaire("");
    setBoutiqueId("");
    setStatut("en_stock");
    setErreurs({});
  }

  async function envoyer(evenement: React.FormEvent) {
    evenement.preventDefault();
    if (!action) return;

    setErreurs({});
    setEnvoiEnCours(true);

    const corps: Record<string, unknown> = { ...action.corpsFixe };

    if (action.champs.includes("prix")) corps.prix = prix ? Number(prix) : null;
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
      toast.success(reponse.message);
      reinitialiser();
      onSucces();
      router.refresh();
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.parChamp());
        toast.error(e.resume());
        console.log("Boutique de destination", boutiqueId);
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

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
                <DialogTitle>{action.libelle}</DialogTitle>
                <DialogDescription>
                  {telephone.modele?.libelle} · {action.description}
                </DialogDescription>
              </DialogHeader>

              <DialogCorps>
                {action.champs.includes("prix") && (
                  <div className="space-y-2">
                    <Label htmlFor="prix">Prix de vente réel ({devise})</Label>
                    <Input
                      id="prix"
                      type="number"
                      min={0}
                      className="chiffres h-10"
                      value={prix}
                      onChange={(e) => setPrix(e.target.value)}
                      placeholder={String(telephone.prix_vente)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Laissez tel quel si le client paie le prix affiché.
                    </p>
                  </div>
                )}

                {action.champs.includes("client") && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="client-nom">
                        Nom du client
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
                      <Label htmlFor="client-tel">Téléphone</Label>
                      <Input
                        id="client-tel"
                        className="h-10"
                        value={clientTelephone}
                        onChange={(e) => setClientTelephone(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {action.champs.includes("boutique") && (
                  <div className="space-y-2">
                    <Label>
                      Boutique de destination
                      <span className="ml-0.5 text-destructive">*</span>
                    </Label>
                    {destinations.length === 0 ? (
                      <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                        Vous n&apos;avez accès à aucune autre boutique.
                      </p>
                    ) : (
                      <Select
                        items={Object.fromEntries(
                          destinations.map((b) => [String(b.id), b.nom]),
                        )}
                        value={boutiqueId}
                        onValueChange={(v) => setBoutiqueId(v ?? "")}
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Choisir la boutique" />
                        </SelectTrigger>
                        <SelectContent>
                          {destinations.map((boutique) => (
                            <SelectItem
                              key={boutique.id}
                              value={String(boutique.id)}
                            >
                              {boutique.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <Label>Nouveau statut</Label>
                    <Select
                      items={libellesStatuts}
                      value={statut}
                      onValueChange={(v) =>
                        setStatut((v ?? "en_stock") as StatutTelephone)
                      }
                    >
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(libellesStatuts).map(
                          ([valeur, libelle]) => (
                            <SelectItem key={valeur} value={valeur}>
                              {libelle}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {action.champs.includes("motif") && (
                  <div className="space-y-2">
                    <Label htmlFor="motif">
                      Motif
                      {(action.cle === "perte" || action.cle === "correction") && (
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
                          ? "Vol, casse, disparition…"
                          : "Précisez la raison"
                      }
                    />
                    {erreurs.motif && (
                      <p className="text-xs text-destructive">{erreurs.motif}</p>
                    )}
                  </div>
                )}

                {action.champs.includes("commentaire") && (
                  <div className="space-y-2">
                    <Label htmlFor="commentaire">Commentaire</Label>
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
              </DialogCorps>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onFermer}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={
                    envoiEnCours ||
                    (action.champs.includes("boutique") && !boutiqueId)
                  }
                >
                  {envoiEnCours && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirmer
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
