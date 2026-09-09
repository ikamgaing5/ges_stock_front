"use client";

import React, { useEffect, useRef, useState } from "react";
import { ZoomIn, Minimize2 } from "lucide-react";
import type { Mouvement } from "@/types";
import { useI18n } from "@/lib/i18n";
import { formaterImei } from "@/lib/imei";

export interface ModeleFactureProps {
  mouvement: Mouvement | { data: Mouvement };
  idPrint?: string;
  zoomMode?: "auto" | "100%";
  onZoomChange?: (mode: "auto" | "100%") => void;
  afficherControlesZoom?: boolean;
}

const DOC_WIDTH = 794;
const DOC_HEIGHT = 1123;

export function ModeleFacture({
  mouvement: propMouvement,
  idPrint = "facture-imprimable",
  zoomMode: propZoomMode,
  onZoomChange,
  afficherControlesZoom = true,
}: ModeleFactureProps) {
  const { t, formatMontant, lang } = useI18n();

  const conteneurRef = useRef<HTMLDivElement>(null);
  const [echelle, setEchelle] = useState<number>(1);
  const [modeZoomInterne, setModeZoomInterne] = useState<"auto" | "100%">("auto");

  const modeZoom = propZoomMode ?? modeZoomInterne;

  // Calcul automatique de l'échelle pour s'adapter parfaitement à la largeur de l'écran (mobile/tablette)
  useEffect(() => {
    const el = conteneurRef.current;
    if (!el) return;

    const recalculerEchelle = () => {
      const largeurConteneur = el.clientWidth;
      if (largeurConteneur > 0 && largeurConteneur < DOC_WIDTH) {
        // Laisser 8px de marge visuelle sur mobile
        const ratio = Math.min(1, Math.max(0.25, (largeurConteneur - 8) / DOC_WIDTH));
        setEchelle(ratio);
      } else {
        setEchelle(1);
      }
    };

    recalculerEchelle();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => recalculerEchelle());
      observer.observe(el);
    }

    window.addEventListener("resize", recalculerEchelle);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", recalculerEchelle);
    };
  }, []);

  const basculerZoom = () => {
    const nouveauMode = modeZoom === "auto" ? "100%" : "auto";
    if (onZoomChange) {
      onZoomChange(nouveauMode);
    } else {
      setModeZoomInterne(nouveauMode);
    }
  };

  const mouvement: Mouvement =
    propMouvement && typeof propMouvement === "object" && "data" in propMouvement && propMouvement.data
      ? (propMouvement.data as Mouvement)
      : (propMouvement as Mouvement);

  const telephone = mouvement?.telephone;
  const modele = telephone?.modele;
  const boutique = mouvement?.boutique ?? telephone?.boutique;
  const devise = boutique?.devise ?? "XAF";

  // Date et heure formatées avec gestion des dates invalides
  const dateObj = mouvement?.created_at ? new Date(mouvement.created_at) : new Date();
  const dateValide = !isNaN(dateObj.getTime());
  const dateFormatee = dateValide
    ? dateObj.toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString(lang === "en" ? "en-US" : "fr-FR");
  const heureFormatee = dateValide
    ? dateObj.toLocaleTimeString(lang === "en" ? "en-US" : "fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleTimeString(lang === "en" ? "en-US" : "fr-FR", { hour: "2-digit", minute: "2-digit" });

  // Libellé désignation
  const marqueNom =
    modele?.gamme?.marque?.nom ??
    (modele as any)?.marque?.nom ??
    (telephone as any)?.marque ??
    "";
  const modeleNom = modele?.nom ?? (telephone as any)?.modele ?? "";
  const designationBrute =
    modele?.libelle ||
    (marqueNom && modeleNom ? `${marqueNom} ${modeleNom}`.trim() : modeleNom || marqueNom);

  const nomArticle = [
    designationBrute || (lang === "en" ? "Mobile Phone" : "Téléphone portable"),
    telephone?.couleur ? `(${telephone.couleur})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Mode de paiement
  const libellePaiement =
    mouvement?.mode_paiement === "om_momo"
      ? t("factures.omMomo")
      : t("factures.cash");

  const prix =
    mouvement?.prix !== null && Number(mouvement?.prix) > 0
      ? Number(mouvement.prix)
      : (telephone?.prix_vente_reel ?? telephone?.prix_vente ?? 0);
  const logoBoutique = boutique?.logo_url;

  const doitEtreMisAEchelle = echelle < 1 && modeZoom === "auto";

  return (
    <div
      ref={conteneurRef}
      className="facture-responsive-wrapper w-full flex flex-col items-center overflow-x-hidden print:overflow-visible print:w-full print:block"
    >
      {/* Barre de contrôle du zoom mobile / écran réduit (masquée à l'impression) */}
      {afficherControlesZoom && echelle < 1 && (
        <div className="print:hidden mb-2.5 flex items-center justify-center">
          <button
            type="button"
            onClick={basculerZoom}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            {modeZoom === "auto" ? (
              <>
                <ZoomIn className="h-3.5 w-3.5" />
                <span>{t("factures.zoomTailleReelle")}</span>
              </>
            ) : (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>{t("factures.zoomAjuster")}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Conteneur de cadrage / défilement proportionnel */}
      <div
        className="facture-scale-wrapper relative flex justify-center print:block print:!w-full print:!h-auto print:!overflow-visible"
        style={{
          width: doitEtreMisAEchelle ? `${Math.ceil(DOC_WIDTH * echelle)}px` : `${DOC_WIDTH}px`,
          height: doitEtreMisAEchelle ? `${Math.ceil(DOC_HEIGHT * echelle)}px` : `${DOC_HEIGHT}px`,
          maxWidth: "100%",
          overflow: modeZoom === "100%" ? "auto" : "hidden",
        }}
      >
        {/* Conteneur intermédiaire appliquant la mise à l'échelle vectorielle */}
        <div
          className="facture-scale-inner print:!transform-none print:!w-full print:!h-full"
          style={{
            transform: doitEtreMisAEchelle ? `scale(${echelle})` : undefined,
            transformOrigin: "top left",
            width: `${DOC_WIDTH}px`,
            minWidth: `${DOC_WIDTH}px`,
            height: `${DOC_HEIGHT}px`,
            maxHeight: `${DOC_HEIGHT}px`,
          }}
        >
          {/* Feuille de facture A4 (strictement 1 page) */}
          <div
            id={idPrint}
            className="facture-container relative bg-white text-neutral-900 shadow-md print:shadow-none print:m-0 print:w-full print:max-w-none print:h-full overflow-hidden"
            style={{
              width: `${DOC_WIDTH}px`,
              height: `${DOC_HEIGHT}px`,
              maxHeight: `${DOC_HEIGHT}px`,
              padding: "36px 40px 30px 40px",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              color: "#111827",
              backgroundColor: "#ffffff",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Filigrane (Watermark) centré en arrière-plan */}
            {logoBoutique ? (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
                style={{ zIndex: 0 }}
              >
                <img
                  src={logoBoutique}
                  alt=""
                  className="max-h-[300px] max-w-[300px] object-contain opacity-[0.045] grayscale print:opacity-[0.06]"
                />
              </div>
            ) : (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
                style={{ zIndex: 0 }}
              >
                <span className="text-7xl font-extrabold uppercase tracking-widest text-neutral-900 opacity-[0.03]">
                  {boutique?.nom || "TELORA"}
                </span>
              </div>
            )}

            {/* Contenu de la facture */}
            <div className="relative z-10 flex flex-col justify-between h-full print:h-full">
              <div>
                {/* En-tête : Logo + Informations Boutique à gauche / Titre et N° à droite */}
                <div className="flex items-start justify-between border-b border-neutral-200 pb-4 break-inside-avoid">
                  {/* Logo et Informations de la boutique côte à côte */}
                  <div className="flex items-start gap-3.5 max-w-[62%]">
                    {logoBoutique ? (
                      <img
                        src={logoBoutique}
                        alt={boutique?.nom ?? "Logo boutique"}
                        className="max-h-16 max-w-[130px] object-contain shrink-0 rounded"
                      />
                    ) : (
                      <div className="inline-flex shrink-0 items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-white">
                        <span className="text-sm font-extrabold tracking-tight">
                          {boutique?.nom || "BOUTIQUE"}
                        </span>
                      </div>
                    )}

                    <div className="space-y-0.5 text-xs text-neutral-700 leading-tight">
                      <p className="text-sm font-bold text-neutral-900 leading-tight mb-0.5">
                        {boutique?.nom ?? "—"}
                      </p>
                      {boutique?.niu && (
                        <p>
                          <span className="font-semibold text-neutral-800">{t("factures.niu")} :</span>{" "}
                          <span className="font-mono">{boutique.niu}</span>
                        </p>
                      )}
                      {boutique?.registre_commerce && (
                        <p>
                          <span className="font-semibold text-neutral-800">{t("factures.rccm")} :</span>{" "}
                          <span className="font-mono">{boutique.registre_commerce}</span>
                        </p>
                      )}
                      {(boutique?.adresse || boutique?.ville) && (
                        <p className="text-neutral-600">
                          {[boutique.adresse, boutique.ville].filter(Boolean).join(", ")}
                        </p>
                      )}
                      {boutique?.telephone && (
                        <p className="text-neutral-600">
                          <span className="font-semibold text-neutral-700">{t("factures.telephone")} :</span>{" "}
                          <span className="font-medium text-neutral-800">{boutique.telephone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Titre et N° Facture à droite */}
                  <div className="text-right shrink-0">
                    <h1 className="text-2xl font-black tracking-widest text-neutral-900 uppercase">
                      {t("factures.factureTitre")}
                    </h1>
                    <p className="font-mono text-base font-bold text-neutral-800 mt-1">
                      {mouvement.numero_facture || `№0${mouvement.id}`}
                    </p>
                  </div>
                </div>

                {/* Section Détails de la facture (2 colonnes) */}
                <div className="mt-4 break-inside-avoid">
                  <h2 className="text-xs font-bold text-neutral-900 mb-2 uppercase tracking-wider">
                    {t("factures.detailsFacture")}
                  </h2>

                  <div className="grid grid-cols-2 gap-8 text-xs">
                    {/* Colonne gauche : Informations sur la commande */}
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1 mb-2">
                        {t("factures.informationsCommande")}
                      </h3>
                      <dl className="space-y-1 text-neutral-700">
                        <div className="flex justify-between py-0.5">
                          <dt className="text-neutral-500">{t("factures.commandePasseLe")}</dt>
                          <dd className="font-medium capitalize text-right text-neutral-900">
                            {dateFormatee}
                          </dd>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <dt className="text-neutral-500">{t("factures.dateHeure")}</dt>
                          <dd className="font-medium text-right text-neutral-900">{heureFormatee}</dd>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <dt className="text-neutral-500">{t("factures.moyenPaiement")}</dt>
                          <dd className="font-medium text-right text-neutral-900">{libellePaiement}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Colonne droite : Client (Facturé à) */}
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1 mb-2">
                        {t("factures.clientFacture")}
                      </h3>
                      <dl className="space-y-1 text-neutral-700">
                        <div className="flex justify-between py-0.5">
                          <dt className="text-neutral-500">{t("factures.client")}</dt>
                          <dd className="font-bold text-right text-neutral-900">
                            {mouvement.client_nom || telephone?.client_nom || "—"}
                          </dd>
                        </div>
                        {(mouvement.client_telephone || telephone?.client_telephone) && (
                          <div className="flex justify-between py-0.5">
                            <dt className="text-neutral-500">{t("factures.telephoneClient")}</dt>
                            <dd className="font-medium text-right text-neutral-900">
                              {mouvement.client_telephone || telephone?.client_telephone}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>

                {/* Tableau des articles achetés */}
                <div className="mt-5 break-inside-avoid">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-t border-b border-neutral-800 text-left text-[11px] font-bold uppercase text-neutral-800">
                        <th className="py-2 pr-4">{t("factures.designation")}</th>
                        <th className="py-2 px-3 text-right">{t("factures.prixUnitaire")}</th>
                        <th className="py-2 px-3 text-center w-14">{t("factures.quantite")}</th>
                        <th className="py-2 pl-3 text-right">{t("factures.prixTotal")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-neutral-200">
                        <td className="py-3 pr-4 align-middle">
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                            <span className="font-bold text-neutral-900 text-sm">{nomArticle}</span>

                            {/* Bloc IMEI à côté du nom de l'article */}
                            {telephone?.imei && (
                              <div className="inline-flex flex-wrap items-baseline gap-x-2.5 text-[11px] text-neutral-700 font-mono">
                                <span>
                                  <strong className="font-sans font-semibold text-neutral-800">
                                    {t("factures.imei")} :
                                  </strong>{" "}
                                  {formaterImei(telephone.imei)}
                                </span>
                                {telephone.imei2 && (
                                  <span>
                                    <strong className="font-sans font-semibold text-neutral-800">
                                      IMEI 2 :
                                    </strong>{" "}
                                    {formaterImei(telephone.imei2)}
                                  </span>
                                )}
                                {telephone.numero_serie && (
                                  <span>
                                    <strong className="font-sans font-semibold text-neutral-800">
                                      S/N :
                                    </strong>{" "}
                                    {telephone.numero_serie}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right align-middle font-mono font-medium text-neutral-900 text-xs">
                          {formatMontant(prix, devise, devise)}
                        </td>
                        <td className="py-3 px-3 text-center align-middle font-medium text-neutral-800 text-xs">
                          1
                        </td>
                        <td className="py-3 pl-3 text-right align-middle font-mono font-bold text-neutral-900 text-xs">
                          {formatMontant(prix, devise, devise)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Bloc Total de la facture */}
                <div className="mt-4 flex justify-end break-inside-avoid">
                  <div className="w-64 space-y-1 text-xs">
                    <div className="text-right font-bold text-neutral-900 text-sm mb-1">
                      {t("factures.totalCommande")}
                    </div>
                    <div className="flex justify-between py-0.5 border-t border-neutral-200 text-neutral-600">
                      <span>{t("factures.sousTotal")}</span>
                      <span className="font-mono font-medium text-neutral-900">
                        {formatMontant(prix, devise, devise)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-t-2 border-neutral-900 text-sm font-bold text-neutral-900">
                      <span>{t("factures.total")} :</span>
                      <span className="font-mono text-base">{formatMontant(prix, devise, devise)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pied de page : Notes & Conditions (strictement 1 page) */}
              <div className="mt-auto pt-4 border-t border-neutral-200 text-[11px] text-neutral-700 space-y-2.5 break-inside-avoid">
                <div>
                  <h4 className="font-bold text-neutral-900 mb-0.5">{t("factures.notesTitre")}</h4>
                  <ul className="space-y-0.5 list-none pl-0">
                    <li className="font-semibold text-neutral-900">
                      • {t("factures.notesGarantie")}
                    </li>
                    <li className="font-semibold text-neutral-900">
                      • {t("factures.notesNb")}
                    </li>
                    <li className="font-bold text-red-600 print:text-neutral-900">
                      • {t("factures.notesNonRemboursable")}
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-neutral-900 mb-0.5">{t("factures.conditionsTitre")}</h4>
                  <p className="text-neutral-600 leading-snug">
                    {t("factures.conditionsTexte")} {t("factures.conditionsTest")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
