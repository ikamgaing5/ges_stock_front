"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Barcode,
  Check,
  CheckCircle2,
  Coins,
  FileText,
  Hash,
  Loader2,
  Lock,
  Palette,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { api, ErreurApi } from "@/lib/api";
import { imeiValide } from "@/lib/imei";
import { useAuth } from "@/components/auth-provider";
import { useI18n } from "@/lib/i18n";
import { convertirMontant, obtenirDevise } from "@/lib/devises";
import { PastilleStatut } from "@/components/ui-commun";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogCorps,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EtatTelephone, Telephone } from "@/types";

interface ModalModifierTelephoneProps {
  ouvert: boolean;
  onFermer: () => void;
  telephone: Telephone;
  surSucces: (maj: Telephone) => void;
}

export function ModalModifierTelephone({
  ouvert,
  onFermer,
  telephone,
  surSucces,
}: ModalModifierTelephoneProps) {
  const { devise, deviseBoutique, utilisateur } = useAuth();
  const { t, libelleEtat, lang } = useI18n();

  const deviseOrigine = telephone.boutique?.devise ?? deviseBoutique;
  const configDevise = obtenirDevise(devise);

  const [imei, setImei] = useState(telephone.imei ?? "");
  const [imei2, setImei2] = useState(telephone.imei2 ?? "");
  const [numeroSerie, setNumeroSerie] = useState(telephone.numero_serie ?? "");
  const [couleur, setCouleur] = useState(telephone.couleur ?? "");
  const [etat, setEtat] = useState<EtatTelephone>(telephone.etat ?? "neuf");
  const [prixAchat, setPrixAchat] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [fournisseur, setFournisseur] = useState(telephone.fournisseur ?? "");
  const [notes, setNotes] = useState(telephone.notes ?? "");

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    if (ouvert) {
      setImei(telephone.imei ?? "");
      setImei2(telephone.imei2 ?? "");
      setNumeroSerie(telephone.numero_serie ?? "");
      setCouleur(telephone.couleur ?? "");
      setEtat(telephone.etat ?? "neuf");
      setFournisseur(telephone.fournisseur ?? "");
      setNotes(telephone.notes ?? "");

      const achat = convertirMontant(telephone.prix_achat || 0, deviseOrigine, devise);
      setPrixAchat(
        achat > 0
          ? String(
              configDevise.decimales === 0
                ? Math.round(achat)
                : Number(achat.toFixed(configDevise.decimales)),
            )
          : "",
      );

      const vente = convertirMontant(telephone.prix_vente || 0, deviseOrigine, devise);
      setPrixVente(
        vente > 0
          ? String(
              configDevise.decimales === 0
                ? Math.round(vente)
                : Number(vente.toFixed(configDevise.decimales)),
            )
          : "",
      );

      setErreurs({});
    }
  }, [ouvert, telephone, deviseOrigine, devise, configDevise.decimales]);

  // Validation dynamique de l'IMEI 1
  const imei1Chiffres = imei.replace(/\D/g, "");
  const imei1Complet = imei1Chiffres.length === 15;
  const imei1EstValide = imei1Complet && imeiValide(imei1Chiffres);

  // Validation dynamique de l'IMEI 2 (si renseigné)
  const imei2Chiffres = imei2.replace(/\D/g, "");
  const imei2EstValide =
    !imei2Chiffres || (imei2Chiffres.length === 15 && imeiValide(imei2Chiffres));

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setErreurs({});

    const errs: Record<string, string> = {};

    if (!imei1Chiffres) {
      errs.imei = t("commun.champRequis");
    } else if (!imeiValide(imei1Chiffres)) {
      errs.imei =
        lang === "en"
          ? "15 digits required with valid Luhn key."
          : "L'IMEI doit comporter 15 chiffres valides (clé de Luhn).";
    }

    if (imei2.trim() && !imei2EstValide) {
      errs.imei2 =
        lang === "en"
          ? "Invalid secondary IMEI (15 digits required)."
          : "L'IMEI 2 doit comporter 15 chiffres valides.";
    }

    if (Object.keys(errs).length > 0) {
      setErreurs(errs);
      return;
    }

    setEnvoiEnCours(true);

    const corps: Record<string, unknown> = {
      imei: imei1Chiffres,
      imei2: imei2.trim() ? imei2Chiffres : null,
      numero_serie: numeroSerie.trim() || null,
      couleur: couleur.trim() || null,
      etat,
      fournisseur: fournisseur.trim() || null,
      notes: notes.trim() || null,
    };

    if (prixAchat) {
      const montantDevise = convertirMontant(Number(prixAchat), devise, deviseOrigine);
      const confBoutique = obtenirDevise(deviseOrigine);
      corps.prix_achat =
        confBoutique.decimales === 0
          ? Math.round(montantDevise)
          : Number(montantDevise.toFixed(confBoutique.decimales));
    } else {
      corps.prix_achat = null;
    }

    if (prixVente) {
      const montantDevise = convertirMontant(Number(prixVente), devise, deviseOrigine);
      const confBoutique = obtenirDevise(deviseOrigine);
      corps.prix_vente =
        confBoutique.decimales === 0
          ? Math.round(montantDevise)
          : Number(montantDevise.toFixed(confBoutique.decimales));
    } else {
      corps.prix_vente = null;
    }

    try {
      const res = await api.put<{ message: string; data: Telephone }>(
        `/telephones/${telephone.id}`,
        corps,
      );
      toast.success(res.message || t("telephones.appareilModifie"));
      surSucces(res.data);
      onFermer();
    } catch (err) {
      if (err instanceof ErreurApi) {
        setErreurs(err.parChamp());
        toast.error(err.resume());
      } else {
        toast.error(t("commun.erreur"));
      }
    } finally {
      setEnvoiEnCours(false);
    }
  }

  const etatsOptions: {
    valeur: EtatTelephone;
    libelle: string;
    icone: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      valeur: "neuf",
      libelle: libelleEtat("neuf"),
      icone: Sparkles,
    },
    {
      valeur: "reconditionne",
      libelle: libelleEtat("reconditionne"),
      icone: RefreshCw,
    },
    {
      valeur: "occasion",
      libelle: libelleEtat("occasion"),
      icone: ShieldCheck,
    },
  ];

  return (
    <Dialog open={ouvert} onOpenChange={(v) => !v && onFermer()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden border border-border/80 shadow-2xl rounded-2xl bg-card">
        <form onSubmit={enregistrer} className="flex min-h-0 flex-1 flex-col">
          {/* En-tête aéré et élégant */}
          <DialogHeader className="border-b border-border/50 bg-muted/20 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Pencil className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base font-semibold tracking-tight text-foreground">
                  {lang === "en" ? "Edit Device" : "Modifier l'appareil"}
                </DialogTitle>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="font-medium text-xs text-foreground truncate max-w-[220px]">
                    {telephone.modele?.libelle || "Téléphone"}
                  </span>
                  {telephone.boutique?.nom && (
                    <span className="text-xs text-muted-foreground">
                      · {telephone.boutique.nom}
                    </span>
                  )}
                  <PastilleStatut statut={telephone.statut} className="text-[11px] px-2 py-0.5" />
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Corps du formulaire */}
          <DialogCorps className="px-6 py-5 space-y-6 max-h-[70dvh]">
            {/* Section 1 : Identifiants & IMEI */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Hash className="h-3.5 w-3.5 text-primary" />
                <span>
                  {lang === "en" ? "Identification & IMEI" : "Identification & IMEI"}
                </span>
              </div>

              {/* IMEI 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-imei" className="text-xs font-medium text-foreground">
                    {t("telephones.imei")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>

                  {/* Badge de statut IMEI 1 */}
                  {imei1Chiffres && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        imei1EstValide
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {imei1EstValide ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{lang === "en" ? "Valid IMEI (Luhn)" : "IMEI conforme"}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          <span>
                            {imei1Chiffres.length < 15
                              ? `${imei1Chiffres.length}/15 chiffres`
                              : lang === "en"
                                ? "Invalid Luhn key"
                                : "Clé Luhn invalide"}
                          </span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="edit-imei"
                    className={`font-mono text-sm pl-9.5 h-10 tracking-wider ${
                      erreurs.imei
                        ? "border-destructive focus-visible:ring-destructive/30"
                        : imei1EstValide
                          ? "border-emerald-500/50 focus-visible:ring-emerald-500/20"
                          : ""
                    }`}
                    maxLength={17}
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    placeholder="358912345678901"
                    required
                  />
                </div>
                {erreurs.imei && (
                  <p className="text-xs text-destructive font-medium">{erreurs.imei}</p>
                )}
              </div>

              {/* IMEI 2 & Numéro de Série */}
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-imei2" className="text-xs font-medium text-foreground">
                      {t("telephones.imei2")}
                    </Label>
                    {imei2Chiffres && (
                      <span
                        className={`text-[11px] font-medium ${
                          imei2EstValide
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {imei2EstValide
                          ? "✓ Valide"
                          : `${imei2Chiffres.length}/15`}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="edit-imei2"
                      className={`font-mono text-sm pl-9.5 h-10 tracking-wider ${
                        erreurs.imei2 ? "border-destructive focus-visible:ring-destructive/30" : ""
                      }`}
                      maxLength={17}
                      value={imei2}
                      onChange={(e) => setImei2(e.target.value)}
                      placeholder="Optionnel (SIM 2)"
                    />
                  </div>
                  {erreurs.imei2 && (
                    <p className="text-xs text-destructive font-medium">{erreurs.imei2}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-num-serie" className="text-xs font-medium text-foreground">
                    {t("telephones.numeroSerie")}
                  </Label>
                  <div className="relative">
                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="edit-num-serie"
                      className="font-mono text-sm pl-9.5 h-10 uppercase"
                      value={numeroSerie}
                      onChange={(e) => setNumeroSerie(e.target.value)}
                      placeholder="F17D90K0L2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Séparateur subtil */}
            <div className="border-t border-border/50 pt-5 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>
                  {lang === "en" ? "Condition & Appearance" : "État & Caractéristiques"}
                </span>
              </div>

              {/* Sélecteur d'état visuel en barre segmentée moderne */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  {t("commun.etat")}
                </Label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/50">
                  {etatsOptions.map((opt) => {
                    const estActif = etat === opt.valeur;
                    const Icone = opt.icone;
                    return (
                      <button
                        key={opt.valeur}
                        type="button"
                        onClick={() => setEtat(opt.valeur)}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          estActif
                            ? "bg-card text-foreground shadow-xs ring-1 ring-border/80 font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <Icone
                          className={`h-3.5 w-3.5 ${
                            estActif ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <span className="capitalize">{opt.libelle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Couleur & Fournisseur */}
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-couleur" className="text-xs font-medium text-foreground">
                    {t("telephones.couleur")}
                  </Label>
                  <div className="relative">
                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="edit-couleur"
                      className="pl-9.5 h-10"
                      value={couleur}
                      onChange={(e) => setCouleur(e.target.value)}
                      placeholder={t("telephones.couleurPlaceholder")}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-fournisseur" className="text-xs font-medium text-foreground">
                    {t("telephones.fournisseur")}
                  </Label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="edit-fournisseur"
                      className="pl-9.5 h-10"
                      value={fournisseur}
                      onChange={(e) => setFournisseur(e.target.value)}
                      placeholder="Grossiste, Arrivage..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Séparateur subtil - Tarification */}
            <div className="border-t border-border/50 pt-5 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Coins className="h-3.5 w-3.5 text-primary" />
                <span>
                  {lang === "en" ? "Commercial & Pricing" : "Tarification & Commerce"}
                </span>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                {/* Prix de vente */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-prix-vente" className="text-xs font-medium text-foreground">
                    {t("telephones.prixVente")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit-prix-vente"
                      type="number"
                      min={0}
                      className="h-10 font-mono text-sm font-semibold pr-16"
                      value={prixVente}
                      onChange={(e) => setPrixVente(e.target.value)}
                      placeholder="0"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        {devise}
                      </span>
                    </div>
                  </div>
                  {erreurs.prix_vente && (
                    <p className="text-xs text-destructive font-medium">{erreurs.prix_vente}</p>
                  )}
                </div>

                {/* Prix d'achat (propriétaire uniquement) */}
                {utilisateur?.role === "proprietaire" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-prix-achat" className="text-xs font-medium text-foreground">
                        {t("telephones.prixAchat")}
                      </Label>
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        <Lock className="h-2.5 w-2.5" />
                        <span>Confidentiel</span>
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        id="edit-prix-achat"
                        type="number"
                        min={0}
                        className="h-10 font-mono text-sm pr-16"
                        value={prixAchat}
                        onChange={(e) => setPrixAchat(e.target.value)}
                        placeholder="0"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-xs font-bold text-muted-foreground uppercase">
                          {devise}
                        </span>
                      </div>
                    </div>
                    {erreurs.prix_achat && (
                      <p className="text-xs text-destructive font-medium">{erreurs.prix_achat}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Séparateur subtil - Notes */}
            <div className="border-t border-border/50 pt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>{t("telephones.notes")}</span>
              </div>
              <Textarea
                id="edit-notes"
                rows={2}
                className="resize-none text-xs leading-relaxed"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("telephones.notesPlaceholder")}
              />
            </div>
          </DialogCorps>

          {/* Pied de dialogue */}
          <DialogFooter className="border-t border-border/50 bg-muted/30 px-6 py-4 flex items-center justify-between sm:justify-between">
            <span className="hidden sm:inline text-xs text-muted-foreground">
              {lang === "en"
                ? "Changes take effect immediately."
                : "Les données sont mises à jour en direct."}
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button type="button" variant="outline" onClick={onFermer} className="h-9 px-4">
                {t("commun.annuler")}
              </Button>
              <Button
                type="submit"
                disabled={envoiEnCours || !imei1EstValide}
                className="h-9 px-5 font-semibold gap-2 shadow-xs"
              >
                {envoiEnCours ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>{t("commun.enregistrer")}</span>
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

