"use client";

/**
 * L'équipe (/equipe).
 *
 * Le rattachement aux boutiques est le point important : c'est lui qui
 * détermine le stock que chaque personne pourra voir.
 */

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { useListe } from "@/lib/useListe";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { permissions } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { VerificationSecuriteInvitation } from "@/components/equipe/verification-securite-invitation";
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
import { ChampTelephone } from "@/components/champ-telephone";
import { formaterTelephoneVisuel } from "@/lib/pays";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvitationEmploye, Role, Utilisateur } from "@/types";

export default function PageEquipe() {
  const { utilisateur: moi, parametresBoutique } = useAuth();
  const { t, libelleRole, descriptionRole, formatDate } = useI18n();

  const [enEdition, setEnEdition] = useState<Partial<Utilisateur> | null>(null);
  const [aSupprimer, setASupprimer] = useState<Utilisateur | null>(null);

  const [onglet, setOnglet] = useState<"membres" | "invitations">("membres");
  const [invitations, setInvitations] = useState<InvitationEmploye[]>([]);
  const [chargementInvitations, setChargementInvitations] = useState(false);
  const [invitationEnRenvoi, setInvitationEnRenvoi] = useState<string | null>(null);
  const [invitationASupprimer, setInvitationASupprimer] = useState<InvitationEmploye | null>(null);
  const [invitationRecente, setInvitationRecente] = useState<InvitationEmploye | null>(null);

  // Sécurité et déverrouillage préalable des invitations
  const [estVerifie, setEstVerifie] = useState(false);
  const [verifModalOuvert, setVerifModalOuvert] = useState(false);

  const peutGerer = Boolean(moi && permissions.gererEmployes(moi.role));

  const { donnees, chargement, erreur, recharger } = useListe(
    (signal) =>
      api.get<{ data: Utilisateur[] }>("/employes", parametresBoutique, signal),
    [parametresBoutique],
  );

  const equipe = donnees?.data ?? [];

  // Vérifier si le propriétaire a déjà validé l'accès dans la session actuelle
  useEffect(() => {
    if (!peutGerer) return;
    api
      .get<{ verifie: boolean }>("/employes/invitations/statut-acces")
      .then((res) => {
        setEstVerifie(res.verifie);
        if (!res.verifie && typeof window !== "undefined") {
          window.sessionStorage.removeItem("telora_invitation_token");
        }
      })
      .catch(() => {
        setEstVerifie(false);
      });
  }, [peutGerer]);

  const chargerInvitations = useCallback(async () => {
    if (!peutGerer) return;
    setChargementInvitations(true);
    try {
      const res = await api.get<{ data: InvitationEmploye[] }>("/employes/invitations");
      setInvitations(res.data);
      setEstVerifie(true);
    } catch (e) {
      if (e instanceof ErreurApi && (e.statut === 403 || e.donnees?.verification_requise)) {
        setEstVerifie(false);
      }
    } finally {
      setChargementInvitations(false);
    }
  }, [peutGerer]);

  useEffect(() => {
    if (estVerifie) {
      void chargerInvitations();
    }
  }, [estVerifie, chargerInvitations]);

  function ouvrirAjoutMembre() {
    if (!estVerifie) {
      setVerifModalOuvert(true);
      return;
    }
    setEnEdition({});
  }

  async function reverrouiller() {
    try {
      await api.post("/employes/invitations/verrouiller-acces");
    } catch {
      // Ignorer
    }
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("telora_invitation_token");
    }
    setEstVerifie(false);
    setInvitations([]);
    toast.success(t("equipe.verrouilleSucces"));
  }

  async function supprimer() {
    if (!aSupprimer) return;
    try {
      await api.delete(`/employes/${aSupprimer.id}`);
      toast.success(t("equipe.compteSupprime"));
      setASupprimer(null);
      recharger();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    }
  }

  async function renvoyer(invitation: InvitationEmploye) {
    setInvitationEnRenvoi(invitation.id);
    try {
      await api.post(`/employes/invitations/${invitation.id}/renvoyer`);
      toast.success(t("equipe.renvoyerSucces"));
      void chargerInvitations();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    } finally {
      setInvitationEnRenvoi(null);
    }
  }

  async function supprimerInvitation() {
    if (!invitationASupprimer) return;
    try {
      await api.delete(`/employes/invitations/${invitationASupprimer.id}`);
      toast.success(t("equipe.invitationAnnulee"));
      setInvitationASupprimer(null);
      void chargerInvitations();
    } catch (e) {
      toast.error(e instanceof ErreurApi ? e.resume() : t("commun.erreur"));
    }
  }

  if (chargement && equipe.length === 0) {
    return (
      <SquelettePageTableau
        lignes={6}
        colonnes={6}
        avecFiltres={false}
        avecBouton={true}
      />
    );
  }

  return (
    <>
      <TitrePage
        titre={t("equipe.titre")}
        description={t("equipe.description")}
      >
        {peutGerer && (
          <Button onClick={ouvrirAjoutMembre}>
            <Plus className="mr-2 h-4 w-4" />
            {t("equipe.ajouterPersonne")}
          </Button>
        )}
      </TitrePage>

      {peutGerer && (
        <div className="mb-4 flex border-b border-border">
          <button
            type="button"
            onClick={() => setOnglet("membres")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              onglet === "membres"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Users className="h-4 w-4" />
            <span>{t("equipe.membresActifs")}</span>
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {equipe.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOnglet("invitations")}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              onglet === "invitations"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Mail className="h-4 w-4" />
            <span>{t("equipe.invitationsEnAttente")}</span>
            {invitations.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {invitations.length}
              </span>
            )}
          </button>
        </div>
      )}

      {onglet === "membres" ? (
        erreur ? (
          <EtatErreur message={erreur} onReessayer={recharger} />
        ) : chargement ? (
          <SquelettesTableau lignes={5} colonnes={6} />
        ) : equipe.length === 0 ? (
          <EtatVide
            icone={<Users className="h-5 w-5" />}
            titre={t("equipe.aucunMembre")}
            description={t("equipe.aucunMembreDesc")}
          >
            {peutGerer && (
              <Button onClick={ouvrirAjoutMembre}>
                <Plus className="mr-2 h-4 w-4" />
                {t("equipe.ajouterPersonne")}
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
                        <TableHead>{t("equipe.tableauPersonne")}</TableHead>
                        <TableHead>{t("equipe.tableauRole")}</TableHead>
                        <TableHead>{t("equipe.tableauBoutiques")}</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          {t("monCompte.telephone")}
                        </TableHead>
                        <TableHead>{t("equipe.tableauStatut")}</TableHead>
                        {peutGerer && (
                          <TableHead className="text-right">
                            {t("commun.actions")}
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipe.map((personne) => (
                        <TableRow key={personne.id}>
                          <TableCell>
                            <p className="font-medium">{personne.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {personne.email}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p>{libelleRole(personne.role)}</p>
                            <p className="text-xs text-muted-foreground">
                              {descriptionRole(personne.role)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(personne.boutiques_rattachees ?? []).map(
                                (boutique) => (
                                  <span
                                    key={boutique.id}
                                    className="rounded-full bg-muted px-2 py-0.5 text-xs"
                                  >
                                    {boutique.adresse
                                      ? `${boutique.nom} (${boutique.adresse})`
                                      : boutique.nom}
                                  </span>
                                ),
                              )}
                              {(personne.boutiques_rattachees ?? []).length ===
                                0 && (
                                <span className="text-xs text-statut-alerte">
                                  {t("equipe.aucuneBoutique")}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden text-muted-foreground lg:table-cell">
                            {formaterTelephoneVisuel(personne.telephone) || "—"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                personne.actif
                                  ? "text-sm text-statut-ok"
                                  : "text-sm text-muted-foreground"
                              }
                            >
                              {personne.actif
                                ? t("commun.actif")
                                : t("commun.inactif")}
                            </span>
                          </TableCell>
                          {peutGerer && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setEnEdition(personne)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">
                                    {t("commun.modifier")}
                                  </span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setASupprimer(personne)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">
                                    {t("commun.supprimer")}
                                  </span>
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </Apparait>
        )
      ) : (
        /* Onglet des invitations */
        !estVerifie ? (
          <div className="py-6">
            <VerificationSecuriteInvitation
              mode="carte"
              onSucces={() => {
                setEstVerifie(true);
                void chargerInvitations();
              }}
            />
          </div>
        ) : chargementInvitations ? (
          <SquelettesTableau lignes={4} colonnes={5} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-foreground">
                  {t("equipe.accesDeverrouille")}
                </span>
                <span className="hidden sm:inline text-muted-foreground">
                  — {t("equipe.sessionDeverrouilleeInfo")}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void reverrouiller()}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                <Lock className="mr-1.5 h-3.5 w-3.5" />
                {t("equipe.verrouillerAcces")}
              </Button>
            </div>

            {invitations.length === 0 ? (
              <EtatVide
                icone={<Mail className="h-5 w-5" />}
                titre={t("equipe.aucuneInvitation")}
                description={t("equipe.aucuneInvitationDesc")}
              >
                {peutGerer && (
                  <Button onClick={ouvrirAjoutMembre}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("equipe.ajouterPersonne")}
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
                            <TableHead>{t("equipe.tableauEmail")}</TableHead>
                            <TableHead>{t("equipe.tableauRole")}</TableHead>
                            <TableHead>{t("equipe.tableauBoutiques")}</TableHead>
                            <TableHead>{t("equipe.tableauStatutEmail")}</TableHead>
                            <TableHead>{t("equipe.tableauExpireLe")}</TableHead>
                            <TableHead className="text-right">
                              {t("commun.actions")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invitations.map((invitation) => (
                            <TableRow key={invitation.id}>
                              <TableCell>
                                <p className="font-medium">{invitation.email}</p>
                                <p className="text-xs text-muted-foreground">
                                  {t("equipe.tableauEnvoyeLe")}{" "}
                                  {formatDate(invitation.created_at)}
                                </p>
                              </TableCell>
                              <TableCell>
                                <p>{libelleRole(invitation.role)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {descriptionRole(invitation.role)}
                                </p>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {invitation.boutiques.map((b) => (
                                    <span
                                      key={b.id}
                                      className="rounded-full bg-muted px-2 py-0.5 text-xs"
                                    >
                                      {b.nom}
                                    </span>
                                  ))}
                                  {invitation.boutiques.length === 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      {t("equipe.toutesLesBoutiques")}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {invitation.email_envoye ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    <MailCheck className="h-3 w-3" />
                                    {t("equipe.emailEnvoye")}
                                    {invitation.email_envoye_le && (
                                      <span className="hidden sm:inline text-[10px] text-emerald-600/75 dark:text-emerald-400/75">
                                        ({formatDate(invitation.email_envoye_le)})
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {t("equipe.emailNonEnvoye")}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {invitation.est_expiree ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                                    <AlertCircle className="h-3 w-3" />
                                    {t("equipe.expiree")}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                                    {formatDate(invitation.expire_le)}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end items-center gap-1.5">
                                  {invitation.lien_invitation && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        void navigator.clipboard.writeText(invitation.lien_invitation!);
                                        toast.success(t("equipe.lienCopie"));
                                      }}
                                      title={t("equipe.copierLien")}
                                    >
                                      <Copy className="h-3.5 w-3.5 mr-1" />
                                      <span className="hidden md:inline">{t("equipe.copierLien")}</span>
                                    </Button>
                                  )}
                                  <Button
                                    variant={invitation.email_envoye ? "outline" : "default"}
                                    size="sm"
                                    className="h-8 text-xs"
                                    disabled={invitationEnRenvoi === invitation.id}
                                    onClick={() => void renvoyer(invitation)}
                                  >
                                    {invitationEnRenvoi === invitation.id ? (
                                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    ) : invitation.email_envoye ? (
                                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                    ) : (
                                      <Mail className="mr-1.5 h-3.5 w-3.5" />
                                    )}
                                    {invitation.email_envoye ? t("equipe.renvoyerEmail") : t("equipe.envoyerEmailMaintenant")}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => setInvitationASupprimer(invitation)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">
                                      {t("equipe.annulerInvitation")}
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
          </div>
        )
      )}

      <FenetreEmploye
        cible={enEdition}
        onFermer={() => setEnEdition(null)}
        onSucces={(estNouvelleInvitation, invitationCreee) => {
          setEnEdition(null);
          recharger();
          void chargerInvitations();
          if (estNouvelleInvitation) {
            setOnglet("invitations");
            if (invitationCreee) {
              setInvitationRecente(invitationCreee);
            }
          }
        }}
        onVerifRequise={() => {
          setEnEdition(null);
          setEstVerifie(false);
          setVerifModalOuvert(true);
        }}
      />

      <VerificationSecuriteInvitation
        ouvert={verifModalOuvert}
        mode="modal"
        onFermer={() => setVerifModalOuvert(false)}
        onSucces={() => {
          setEstVerifie(true);
          setVerifModalOuvert(false);
          setEnEdition({});
          void chargerInvitations();
        }}
      />

      <Dialog
        open={aSupprimer !== null}
        onOpenChange={(o) => !o && setASupprimer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("equipe.supprimerConfirmationTitre", {
                nom: aSupprimer?.name ?? "",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("equipe.supprimerConfirmationDesc")}
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

      <Dialog
        open={invitationASupprimer !== null}
        onOpenChange={(o) => !o && setInvitationASupprimer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("equipe.annulerInvitationTitre")}</DialogTitle>
            <DialogDescription>
              {t("equipe.annulerInvitationDesc", {
                email: invitationASupprimer?.email ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInvitationASupprimer(null)}
            >
              {t("commun.annuler")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => void supprimerInvitation()}
            >
              {t("commun.supprimer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={invitationRecente !== null}
        onOpenChange={(o) => !o && setInvitationRecente(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              {t("equipe.invitationModalTitre")}
            </DialogTitle>
            <DialogDescription>
              {invitationRecente?.email_envoye
                ? t("equipe.invitationModalAvecEmailDesc")
                : t("equipe.invitationModalSansEmailDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("equipe.tableauEmail")}
              </Label>
              <div className="font-medium text-sm text-foreground">
                {invitationRecente?.email}
              </div>
            </div>

            {invitationRecente?.lien_invitation && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {t("equipe.copierLien")}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={invitationRecente.lien_invitation}
                    className="h-9 font-mono text-xs select-all bg-muted/50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      if (invitationRecente.lien_invitation) {
                        void navigator.clipboard.writeText(invitationRecente.lien_invitation);
                        toast.success(t("equipe.lienCopie"));
                      }
                    }}
                  >
                    <Copy className="h-4 w-4 mr-1.5" />
                    {t("equipe.copierLien")}
                  </Button>
                </div>
              </div>
            )}

            {!invitationRecente?.email_envoye && (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <span>{t("equipe.emailNonEnvoye")}</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={invitationEnRenvoi === invitationRecente?.id}
                  onClick={async () => {
                    if (!invitationRecente) return;
                    await renvoyer(invitationRecente);
                    setInvitationRecente((prev) =>
                      prev
                        ? {
                            ...prev,
                            email_envoye: true,
                            email_envoye_le: new Date().toISOString(),
                          }
                        : null
                    );
                  }}
                  className="h-8 text-xs shrink-0"
                >
                  {invitationEnRenvoi === invitationRecente?.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {t("equipe.envoyerEmailMaintenant")}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setInvitationRecente(null)}
            >
              {t("commun.fermer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FenetreEmploye({
  cible,
  onFermer,
  onSucces,
  onVerifRequise,
}: {
  cible: Partial<Utilisateur> | null;
  onFermer: () => void;
  onSucces: (estNouvelleInvitation?: boolean, invitationCreee?: InvitationEmploye) => void;
  onVerifRequise?: () => void;
}) {
  const { boutiques } = useAuth();
  const { t, libelleRole, descriptionRole } = useI18n();
  const modification = Boolean(cible?.id);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState<Role>("vendeuse");
  const [telephone, setTelephone] = useState("");
  const [actif, setActif] = useState(true);
  const [choisies, setChoisies] = useState<string[]>([]);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    if (!cible) return;
    setNom(cible.name ?? "");
    setEmail(cible.email ?? "");
    setMotDePasse("");
    setRole((cible.role as Role) ?? "vendeuse");
    setTelephone(cible.telephone ?? "");
    setActif(cible.actif ?? true);
    setChoisies((cible.boutiques_rattachees ?? []).map((b) => b.id));
    setErreurs({});
  }, [cible]);

  function basculerBoutique(id: string) {
    setChoisies((precedent) => {
      const maj = precedent.includes(id)
        ? precedent.filter((valeur) => valeur !== id)
        : [...precedent, id];
      if (maj.length > 0) {
        setErreurs((prev) => {
          if (!prev.boutiques) return prev;
          const copie = { ...prev };
          delete copie.boutiques;
          return copie;
        });
      }
      return maj;
    });
  }

  async function envoyer(evenement?: React.FormEvent, avecEmail: boolean = false) {
    if (evenement) evenement.preventDefault();
    setErreurs({});

    const errs: Record<string, string> = {};
    if (modification && !nom.trim()) {
      errs.name = t("commun.nomRequis");
    }
    if (modification && !telephone.trim()) {
      errs.telephone = "Le numéro de téléphone est obligatoire.";
    }
    if (!email.trim()) {
      errs.email = t("commun.emailRequis");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = t("commun.emailInvalide");
    }
    if (choisies.length === 0) {
      errs.boutiques = "Rattachez cette personne à au moins une boutique.";
    }

    if (Object.keys(errs).length > 0) {
      setErreurs(errs);
      return;
    }

    setEnvoiEnCours(true);

    const corps: Record<string, unknown> = modification
      ? {
          name: nom,
          email,
          role,
          telephone: telephone.trim(),
          actif,
          boutiques: choisies,
          ...(motDePasse ? { password: motDePasse } : {}),
        }
      : { email, role, boutiques: choisies, envoyer_email: avecEmail };

    if (motDePasse) corps.password = motDePasse;

    try {
      if (modification) {
        await api.put(`/employes/${cible!.id}`, corps);
        toast.success(t("equipe.compteModifie"));
        onSucces(false);
      } else {
        const reponse = await api.post<{ message: string; data?: InvitationEmploye }>("/employes", corps);
        toast.success(avecEmail ? t("equipe.invitationEnvoyee") : t("equipe.invitationCreeeSucces"));
        onSucces(true, reponse.data);
      }
    } catch (e) {
      if (e instanceof ErreurApi) {
        if (
          e.statut === 403 &&
          (e.donnees?.verification_requise || e.message?.includes("confirmation"))
        ) {
          toast.error(e.message || "Vérification de sécurité requise ou expirée.");
          onVerifRequise?.();
          return;
        }
        setErreurs(e.parChamp());
        toast.error(e.resume());
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Dialog open={cible !== null} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-lg">
        <form noValidate onSubmit={envoyer} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>
              {modification
                ? t("equipe.modifierCompte")
                : t("equipe.ajouterPersonne")}
            </DialogTitle>
            <DialogDescription>
              {modification
                ? " "
                : t("equipe.invitationDesc")}
            </DialogDescription>
          </DialogHeader>

          <DialogCorps>
            {modification && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="e-nom">
                    {t("auth.nomComplet")}
                    <span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  <Input
                    id="e-nom"
                    className={`h-10 ${erreurs.name ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    value={nom}
                    onChange={(e) => {
                      setNom(e.target.value);
                      if (erreurs.name) setErreurs((prev) => ({ ...prev, name: "" }));
                    }}
                  />
                  {erreurs.name && (
                    <p className="text-xs text-destructive">{erreurs.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="e-tel">
                    {t("monCompte.telephone")}
                    <span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  <ChampTelephone
                    id="e-tel"
                    valeur={telephone}
                    onChange={(val) => {
                      setTelephone(val);
                      if (erreurs.telephone) {
                        setErreurs((prev) => {
                          const copie = { ...prev };
                          delete copie.telephone;
                          return copie;
                        });
                      }
                    }}
                    erreur={Boolean(erreurs.telephone)}
                  />
                  {erreurs.telephone && (
                    <p className="text-xs text-destructive">{erreurs.telephone}</p>
                  )}
                </div>
              </>
            )}

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="e-email">
                  {t("auth.email")}
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                <Input
                  id="e-email"
                  type="email"
                  className={`h-10 ${erreurs.email ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (erreurs.email) setErreurs((prev) => ({ ...prev, email: "" }));
                  }}
                />
                {erreurs.email && (
                  <p className="text-xs text-destructive">{erreurs.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("equipe.role")}</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["vendeuse", "secretaire"] as const).map((valeur) => (
                  <button
                    key={valeur}
                    type="button"
                    onClick={() => setRole(valeur)}
                    className={[
                      "rounded-lg border px-3 py-2.5 text-left transition-colors",
                      role === valeur
                        ? "border-primary bg-accent"
                        : "hover:bg-muted",
                    ].join(" ")}
                  >
                    <p className="text-sm font-medium">
                      {libelleRole(valeur)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {descriptionRole(valeur)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                {t("equipe.boutiquesRattachees")}
                <span className="ml-0.5 text-destructive">*</span>
              </Label>
              <div className="space-y-1.5 rounded-lg border p-3">
                {boutiques.map((boutique) => (
                  <label
                    key={boutique.id}
                    className="flex cursor-pointer items-center gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input accent-primary"
                      checked={choisies.includes(boutique.id)}
                      onChange={() => basculerBoutique(boutique.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-snug">
                        {boutique.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[boutique.adresse, boutique.ville]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("equipe.restrictionBoutiquesDesc")}
              </p>
              {erreurs.boutiques && (
                <p className="text-xs text-destructive">{erreurs.boutiques}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch id="e-actif" checked={actif} onCheckedChange={setActif} />
              <Label htmlFor="e-actif" className="font-normal">
                {t("equipe.compteActif")}
              </Label>
            </div>
          </DialogCorps>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button type="button" variant="outline" onClick={onFermer}>
              {t("commun.annuler")}
            </Button>
            {modification ? (
              <Button type="submit" disabled={envoiEnCours}>
                {envoiEnCours && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("commun.enregistrer")}
              </Button>
            ) : (
              <>
                {/* <Button
                  type="button"
                  variant="secondary"
                  disabled={envoiEnCours}
                  onClick={(e) => void envoyer(e, false)}
                >
                  {envoiEnCours && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("equipe.creerSansEmail")}
                </Button> */}
                <Button
                  type="button"
                  disabled={envoiEnCours}
                  onClick={(e) => void envoyer(e, true)}
                >
                  {envoiEnCours ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  {t("equipe.envoyerEmailInvitation")}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
