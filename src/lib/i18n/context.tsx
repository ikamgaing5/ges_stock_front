"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  EtatTelephone,
  Role,
  StatutAbonnement,
  StatutTelephone,
  TypeMouvement,
} from "@/types";
import { en } from "./dictionnaires/en";
import { fr } from "./dictionnaires/fr";
import type { ContexteI18n, Langue, ParametresTraduction } from "./types";
import { formaterMontantAvecConversion } from "@/lib/devises";

const CLE_LANGUE = "gestion-stock-lang";

const dictionnaires = {
  fr,
  en,
} as const;

const I18nContext = createContext<ContexteI18n | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Langue>("fr");
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    try {
      const stocke = localStorage.getItem(CLE_LANGUE) as Langue | null;
      if (stocke && (stocke === "fr" || stocke === "en")) {
        setLangState(stocke);
        document.documentElement.lang = stocke;
      } else {
        const navLang = navigator.language?.toLowerCase() ?? "";
        const detecte: Langue = navLang.startsWith("en") ? "en" : "fr";
        setLangState(detecte);
        document.documentElement.lang = detecte;
      }
    } catch {
      // Ignorer si localStorage n'est pas accessible
    }
    setMonte(true);
  }, []);

  const setLang = useCallback((nouvelleLangue: Langue) => {
    setLangState(nouvelleLangue);
    try {
      localStorage.setItem(CLE_LANGUE, nouvelleLangue);
      document.documentElement.lang = nouvelleLangue;
    } catch {
      // Ignorer
    }
  }, []);

  const t = useCallback(
    (cle: string, params?: ParametresTraduction): string => {
      const dictionnaireActif = dictionnaires[lang] ?? fr;
      const parties = cle.split(".");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let valeur: any = dictionnaireActif;
      for (const partie of parties) {
        if (valeur && typeof valeur === "object" && partie in valeur) {
          valeur = valeur[partie];
        } else {
          valeur = undefined;
          break;
        }
      }

      // Fallback sur le français si manquant en anglais
      if (valeur === undefined && lang !== "fr") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fallback: any = fr;
        for (const partie of parties) {
          if (fallback && typeof fallback === "object" && partie in fallback) {
            fallback = fallback[partie];
          } else {
            fallback = undefined;
            break;
          }
        }
        valeur = fallback;
      }

      if (typeof valeur !== "string") {
        return cle;
      }

      if (!params) {
        return valeur;
      }

      let resultat = valeur;
      for (const [nomParam, valParam] of Object.entries(params)) {
        resultat = resultat.replaceAll(`{${nomParam}}`, String(valParam));
      }

      return resultat;
    },
    [lang],
  );

  const formatMontant = useCallback(
    (valeur: number, devise = "XAF", deviseSource?: string): string => {
      return formaterMontantAvecConversion(
        valeur,
        deviseSource ?? devise,
        devise,
        lang,
      );
    },
    [lang],
  );

  const formatNombre = useCallback(
    (valeur: number): string => {
      const locale = lang === "en" ? "en-US" : "fr-FR";
      return new Intl.NumberFormat(locale).format(valeur);
    },
    [lang],
  );

  const formatDate = useCallback(
    (iso: string): string => {
      const locale = lang === "en" ? "en-US" : "fr-FR";
      return new Date(iso).toLocaleString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [lang],
  );

  const formatDateCourte = useCallback(
    (iso: string): string => {
      const locale = lang === "en" ? "en-US" : "fr-FR";
      return new Date(iso).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },
    [lang],
  );

  const libelleRole = useCallback(
    (role: Role): string => {
      return (
        dictionnaires[lang]?.roles[role] ??
        fr.roles[role] ??
        role
      );
    },
    [lang],
  );

  const descriptionRole = useCallback(
    (role: Role): string => {
      return (
        dictionnaires[lang]?.rolesDesc[role] ??
        fr.rolesDesc[role] ??
        ""
      );
    },
    [lang],
  );

  const libelleStatut = useCallback(
    (statut: StatutTelephone): string => {
      return (
        dictionnaires[lang]?.statuts[statut] ??
        fr.statuts[statut] ??
        statut
      );
    },
    [lang],
  );

  const libelleEtat = useCallback(
    (etat: EtatTelephone): string => {
      return (
        dictionnaires[lang]?.etats[etat] ??
        fr.etats[etat] ??
        etat
      );
    },
    [lang],
  );

  const libelleMouvement = useCallback(
    (type: TypeMouvement): string => {
      return (
        dictionnaires[lang]?.typesMouvement[type] ??
        fr.typesMouvement[type] ??
        type
      );
    },
    [lang],
  );

  const libelleAbonnement = useCallback(
    (statut: StatutAbonnement): string => {
      return (
        dictionnaires[lang]?.abonnements[statut] ??
        fr.abonnements[statut] ??
        statut
      );
    },
    [lang],
  );

  const valeurContexte = useMemo(
    () => ({
      lang,
      setLang,
      t,
      formatMontant,
      formatNombre,
      formatDate,
      formatDateCourte,
      libelleRole,
      descriptionRole,
      libelleStatut,
      libelleEtat,
      libelleMouvement,
      libelleTypeMouvement: libelleMouvement,
      libelleAbonnement,
      libelleStatutAbonnement: libelleAbonnement,
    }),
    [
      lang,
      setLang,
      t,
      formatMontant,
      formatNombre,
      formatDate,
      formatDateCourte,
      libelleRole,
      descriptionRole,
      libelleStatut,
      libelleEtat,
      libelleMouvement,
      libelleAbonnement,
    ],
  );

  return (
    <I18nContext.Provider value={valeurContexte}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): ContexteI18n {
  const contexte = useContext(I18nContext);
  if (!contexte) {
    throw new Error("useI18n doit être utilisé au sein d'un I18nProvider.");
  }
  return contexte;
}
