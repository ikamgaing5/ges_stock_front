"use client";

import React from "react";
import type { Mouvement } from "@/types";
import { useI18n } from "@/lib/i18n";
import { formaterImei } from "@/lib/imei";

interface ModeleFactureProps {
  mouvement: Mouvement | { data: Mouvement };
  idPrint?: string;
}

export function ModeleFacture({ mouvement: propMouvement, idPrint = "facture-imprimable" }: ModeleFactureProps) {
  const { t, formatMontant, lang } = useI18n();

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

  return (
    <div
      id={idPrint}
      className="facture-container relative mx-auto w-full max-w-[820px] bg-white text-neutral-900 shadow-sm print:shadow-none print:m-0 print:w-full print:max-w-none print:min-h-0"
      style={{
        minHeight: "1050px",
        padding: "44px 44px 36px 44px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#111827",
        backgroundColor: "#ffffff",
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
            className="max-h-[360px] max-w-[360px] object-contain opacity-[0.05] grayscale print:opacity-[0.07]"
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

      {/* Contenu au premier plan */}
      <div className="relative z-10 flex flex-col justify-between print:min-h-0" style={{ minHeight: "960px" }}>
        <div>
          {/* En-tête : Logo + Informations Boutique à gauche / Titre et N° à droite */}
          <div className="flex items-start justify-between border-b border-neutral-200 pb-5">
            {/* Logo et Informations de la boutique côte à côte */}
            <div className="flex items-start gap-4 max-w-[62%]">
              {logoBoutique ? (
                <img
                  src={logoBoutique}
                  alt={boutique?.nom ?? "Logo boutique"}
                  className="max-h-20 max-w-[140px] object-contain shrink-0 rounded"
                />
              ) : (
                <div className="inline-flex shrink-0 items-center justify-center rounded-lg bg-neutral-900 px-3.5 py-2 text-white">
                  <span className="text-base font-extrabold tracking-tight">
                    {boutique?.nom || "BOUTIQUE"}
                  </span>
                </div>
              )}

              <div className="space-y-0.5 text-xs text-neutral-700 leading-snug">
                <p className="text-sm font-bold text-neutral-900 leading-tight mb-1">
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

          {/* Section Détails de la facture */}
          <div className="mt-5">
            <h2 className="text-sm font-bold text-neutral-900 mb-3 uppercase tracking-wider">
              {t("factures.detailsFacture")}
            </h2>

            <div className="grid grid-cols-2 gap-8 text-sm">
              {/* Colonne gauche : Informations sur la commande */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1 mb-2.5">
                  {t("factures.informationsCommande")}
                </h3>
                <dl className="space-y-1.5 text-neutral-700">
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200 pb-1 mb-2.5">
                  {t("factures.clientFacture")}
                </h3>
                <dl className="space-y-1.5 text-neutral-700">
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
          <div className="mt-8">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-t border-b border-neutral-800 text-left text-xs font-bold uppercase text-neutral-800">
                  <th className="py-2.5 pr-4">{t("factures.designation")}</th>
                  <th className="py-2.5 px-3 text-right">{t("factures.prixUnitaire")}</th>
                  <th className="py-2.5 px-3 text-center w-16">{t("factures.quantite")}</th>
                  <th className="py-2.5 pl-3 text-right">{t("factures.prixTotal")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="py-3.5 pr-4 align-middle">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-bold text-neutral-900">{nomArticle}</span>

                      {/* Bloc IMEI à côté du nom de l'article */}
                      {telephone?.imei && (
                        <div className="inline-flex flex-wrap items-baseline gap-x-3 text-xs text-neutral-700 font-mono">
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
                  <td className="py-3.5 px-3 text-right align-middle font-mono font-medium text-neutral-900">
                    {formatMontant(prix, devise, devise)}
                  </td>
                  <td className="py-3.5 px-3 text-center align-middle font-medium text-neutral-800">
                    1
                  </td>
                  <td className="py-3.5 pl-3 text-right align-middle font-mono font-bold text-neutral-900">
                    {formatMontant(prix, devise, devise)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bloc Total de la facture */}
          <div className="mt-6 flex justify-end">
            <div className="w-72 space-y-1.5 text-sm">
              <div className="text-right font-bold text-neutral-900 text-base mb-1">
                {t("factures.totalCommande")}
              </div>
              <div className="flex justify-between py-1 border-t border-neutral-200 text-neutral-600">
                <span>{t("factures.sousTotal")}</span>
                <span className="font-mono font-medium text-neutral-900">
                  {formatMontant(prix, devise, devise)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-t-2 border-neutral-900 text-base font-bold text-neutral-900">
                <span>{t("factures.total")} :</span>
                <span className="font-mono text-lg">{formatMontant(prix, devise, devise)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de page : Notes & Conditions (strictement conformes aux exigences) */}
        <div className="mt-12 pt-6 border-t border-neutral-200 text-xs text-neutral-700 space-y-4">
          <div>
            <h4 className="font-bold text-neutral-900 mb-1">{t("factures.notesTitre")}</h4>
            <ul className="space-y-1 list-none pl-0">
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
            <h4 className="font-bold text-neutral-900 mb-1">{t("factures.conditionsTitre")}</h4>
            <p className="text-neutral-600 leading-relaxed">
              {t("factures.conditionsTexte")} {t("factures.conditionsTest")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
