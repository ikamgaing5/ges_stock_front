"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  LISTE_PAYS,
  decomposerTelephone,
  composerTelephoneInternational,
  detecterPaysDepuisNumero,
  type Pays,
} from "@/lib/pays";

export interface ChampTelephoneProps {
  valeur: string;
  onChange: (valeurComplete: string) => void;
  id?: string;
  autoComplete?: string;
  disabled?: boolean;
  erreur?: boolean | string;
  className?: string;
  placeholder?: string;
  codePaysParDefaut?: string;
}

export function ChampTelephone({
  valeur,
  onChange,
  id,
  autoComplete = "tel",
  disabled = false,
  erreur = false,
  className = "",
  placeholder,
  codePaysParDefaut = "CM",
}: ChampTelephoneProps) {
  const { lang } = useI18n();

  // Décomposition de la valeur courante en (pays, numéroLocal)
  const [paysActif, setPaysActif] = useState<Pays>(() => {
    const { pays } = decomposerTelephone(valeur, codePaysParDefaut);
    return pays;
  });

  const [numeroLocal, setNumeroLocal] = useState<string>(() => {
    const { numeroLocal: num } = decomposerTelephone(valeur, codePaysParDefaut);
    return num;
  });

  const [menuOuvert, setMenuOuvert] = useState(false);
  const [recherche, setRecherche] = useState("");

  const champRechercheRef = useRef<HTMLInputElement>(null);
  const champNumeroRef = useRef<HTMLInputElement>(null);

  // Synchronisation si la valeur change depuis l'extérieur (ex: chargement initial des données)
  useEffect(() => {
    const { pays, numeroLocal: num } = decomposerTelephone(valeur, paysActif.code);
    setPaysActif(pays);
    setNumeroLocal(num);
  }, [valeur, paysActif.code]);

  // Focus automatique sur le champ de recherche à l'ouverture
  useEffect(() => {
    if (menuOuvert) {
      setRecherche("");
      const timer = setTimeout(() => {
        champRechercheRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [menuOuvert]);

  // Filtrage des pays selon la recherche
  const paysFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return LISTE_PAYS;
    return LISTE_PAYS.filter((p) => {
      const nom = lang === "en" ? p.nomEn : p.nomFr;
      return (
        nom.toLowerCase().includes(q) ||
        p.indicatif.includes(q) ||
        p.code.toLowerCase().includes(q)
      );
    });
  }, [recherche, lang]);

  // Gestion de la sélection d'un pays
  function selectionnerPays(nouveauPays: Pays) {
    setPaysActif(nouveauPays);
    setMenuOuvert(false);

    // Émet la nouvelle valeur complète avec le nouvel indicatif
    const nouvelleValeur = composerTelephoneInternational(
      nouveauPays,
      numeroLocal,
    );
    onChange(nouvelleValeur);

    // Redonne le focus au champ de saisie du numéro
    setTimeout(() => champNumeroRef.current?.focus(), 50);
  }

  // Gestion de la saisie dans le numéro local
  function gererChangementNumero(e: React.ChangeEvent<HTMLInputElement>) {
    const texteSaisi = e.target.value;

    // Détection si l'utilisateur colle un numéro international complet (ex: "+33 6 12...")
    if (texteSaisi.trim().startsWith("+")) {
      const paysDetecte = detecterPaysDepuisNumero(texteSaisi.trim());
      if (paysDetecte) {
        setPaysActif(paysDetecte);
        const reste = texteSaisi.trim().slice(paysDetecte.indicatif.length).trim();
        setNumeroLocal(reste);
        onChange(composerTelephoneInternational(paysDetecte, reste));
        return;
      }
    }

    setNumeroLocal(texteSaisi);
    const nouvelleValeur = composerTelephoneInternational(
      paysActif,
      texteSaisi,
    );
    onChange(nouvelleValeur);
  }

  return (
    <div
      className={`relative flex h-10 w-full items-stretch rounded-lg border bg-background shadow-xs transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/40 ${
        erreur
          ? "border-destructive focus-within:border-destructive focus-within:ring-destructive/30"
          : "border-input"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {/* Popover pour le sélecteur de pays */}
      <Popover.Root open={menuOuvert} onOpenChange={setMenuOuvert}>
        <Popover.Trigger
          type="button"
          disabled={disabled}
          className="flex shrink-0 items-center gap-1.5 rounded-l-lg border-r border-input bg-muted/40 px-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors focus:outline-none select-none cursor-pointer"
          aria-expanded={menuOuvert}
          aria-label="Sélectionner l'indicatif du pays"
        >
          <span className="text-base leading-none" role="img" aria-label={paysActif.nomFr}>
            {paysActif.drapeau}
          </span>
          <span className="font-mono font-semibold text-foreground">
            {paysActif.indicatif}
          </span>
          <ChevronDown
            className={`h-3 w-3 text-muted-foreground transition-transform duration-150 ${
              menuOuvert ? "rotate-180 text-foreground" : ""
            }`}
          />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Positioner
            side="bottom"
            align="start"
            sideOffset={4}
            className="isolate z-[9999] outline-none"
          >
            <Popover.Popup className="z-[9999] w-72 max-h-80 overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 duration-100 flex flex-col">
              {/* Barre de recherche */}
              <div className="p-2 border-b border-border/60 bg-muted/30">
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    ref={champRechercheRef}
                    type="text"
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    placeholder={
                      lang === "en"
                        ? "Search country or dial code…"
                        : "Rechercher un pays ou indicatif…"
                    }
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-background border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Liste des pays scrollable */}
              <div className="overflow-y-auto max-h-60 p-1 divide-y divide-border/20">
                {paysFiltres.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    {lang === "en" ? "No country found" : "Aucun pays trouvé"}
                  </div>
                ) : (
                  paysFiltres.map((p) => {
                    const estSelectionne = p.code === paysActif.code;
                    const nom = lang === "en" ? p.nomEn : p.nomFr;
                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => selectionnerPays(p)}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 text-xs rounded-md text-left transition-colors cursor-pointer ${
                          estSelectionne
                            ? "bg-primary/10 text-primary font-semibold"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          <span className="text-base shrink-0 leading-none">
                            {p.drapeau}
                          </span>
                          <span className="truncate">{nom}</span>
                          <span className="text-[10px] text-muted-foreground uppercase shrink-0">
                            ({p.code})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="font-mono font-medium text-xs text-muted-foreground">
                            {p.indicatif}
                          </span>
                          {estSelectionne && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      {/* Champ de saisie du numéro local */}
      <input
        ref={champNumeroRef}
        id={id}
        type="tel"
        autoComplete={autoComplete}
        disabled={disabled}
        value={numeroLocal}
        onChange={gererChangementNumero}
        placeholder={placeholder ?? paysActif.placeholder}
        className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
}
