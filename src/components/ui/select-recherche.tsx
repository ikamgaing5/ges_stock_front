"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface OptionSelect {
  valeur: string;
  libelle: string;
  description?: string;
  badge?: string;
}

export interface SelectRechercheProps {
  valeur?: string | null;
  onChange: (valeur: string) => void;
  options: OptionSelect[];
  placeholder?: string;
  placeholderRecherche?: string;
  texteVide?: string;
  disabled?: boolean;
  chargement?: boolean;
  texteChargement?: string;
  className?: string;
  triggerClassName?: string;
  erreur?: boolean | string;
  id?: string;
  name?: string;
}

export function SelectRecherche({
  valeur,
  onChange,
  options,
  placeholder,
  placeholderRecherche,
  texteVide,
  disabled = false,
  chargement = false,
  texteChargement,
  className = "",
  triggerClassName = "",
  erreur = false,
  id,
}: SelectRechercheProps) {
  const { lang } = useI18n();
  const [ouvert, setOuvert] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [indexSurvol, setIndexSurvol] = useState(0);

  const inputRechercheRef = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLDivElement>(null);

  const valeurNormalisee = valeur ?? "";

  // Trouve l'option sélectionnée courante
  const optionActive = useMemo(
    () => options.find((opt) => opt.valeur === valeurNormalisee),
    [options, valeurNormalisee],
  );

  // Filtrage des options selon la recherche
  const optionsFiltrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.libelle.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q)) ||
        (opt.badge && opt.badge.toLowerCase().includes(q)),
    );
  }, [options, recherche]);

  // Réinitialisation de l'index de survol quand la recherche change
  useEffect(() => {
    setIndexSurvol(0);
  }, [recherche]);

  // Focus automatique sur le champ de recherche à l'ouverture
  useEffect(() => {
    if (ouvert) {
      setRecherche("");
      setIndexSurvol(0);
      const timer = setTimeout(() => {
        inputRechercheRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [ouvert]);

  // Navigation clavier
  function gererToucheClavier(e: React.KeyboardEvent) {
    if (!ouvert) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndexSurvol((prec) =>
        prec < optionsFiltrees.length - 1 ? prec + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndexSurvol((prec) =>
        prec > 0 ? prec - 1 : optionsFiltrees.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = optionsFiltrees[indexSurvol];
      if (opt) {
        onChange(opt.valeur);
        setOuvert(false);
      }
    }
  }

  function choisir(opt: OptionSelect) {
    onChange(opt.valeur);
    setOuvert(false);
  }

  const libelleChargement =
    texteChargement ??
    (lang === "en" ? "Loading in progress..." : "Chargement en cours…");
  const textePlaceholder =
    placeholder ?? (lang === "en" ? "Select..." : "Sélectionner…");
  const texteRecherchePlaceholder =
    placeholderRecherche ??
    (lang === "en" ? "Type to search..." : "Saisir pour chercher…");
  const texteAucunResultat =
    texteVide ??
    (lang === "en" ? "No results found" : "Aucun résultat trouvé");

  const estDesactive = disabled || chargement;

  return (
    <Popover.Root
      open={ouvert && !chargement}
      onOpenChange={(v) => {
        if (!chargement) setOuvert(v);
      }}
    >
      <Popover.Trigger
        id={id}
        disabled={estDesactive}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-3 py-2 text-sm text-left shadow-xs transition-colors outline-none select-none cursor-pointer",
          erreur
            ? "border-destructive focus-visible:border-destructive focus-visible:ring-3 focus-visible:ring-destructive/30"
            : "border-input hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          estDesactive && "cursor-not-allowed opacity-60 bg-muted/20",
          chargement && "border-primary/40 bg-primary/5 cursor-wait opacity-80 pointer-events-none",
          triggerClassName,
          className,
        )}
      >
        <span
          className={cn(
            "truncate flex-1 min-w-0 flex items-center gap-2",
            chargement && "text-primary font-medium animate-pulse",
            !optionActive && !chargement && "text-muted-foreground",
          )}
        >
          {chargement ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
              <span className="truncate">{libelleChargement}</span>
            </>
          ) : optionActive ? (
            optionActive.libelle
          ) : (
            textePlaceholder
          )}
        </span>

        {optionActive?.badge && !chargement && (
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
            {optionActive.badge}
          </span>
        )}

        {chargement ? (
          <span className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150",
              ouvert && "rotate-180 text-foreground",
            )}
          />
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="start"
          sideOffset={4}
          className="isolate z-[9999] outline-none"
        >
          <Popover.Popup
            onKeyDown={gererToucheClavier}
            className="z-[9999] w-(--anchor-width) min-w-[220px] max-h-80 overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 duration-100 flex flex-col"
          >
            {/* Barre de saisie de recherche */}
            <div className="p-2 border-b border-border/60 bg-muted/25">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRechercheRef}
                  type="text"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder={texteRecherchePlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-md bg-background border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {recherche && (
                  <button
                    type="button"
                    onClick={() => setRecherche("")}
                    className="absolute right-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Liste filtrée */}
            <div
              ref={listeRef}
              role="listbox"
              className="overflow-y-auto max-h-60 p-1 space-y-0.5"
            >
              {optionsFiltrees.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  {texteAucunResultat}
                </div>
              ) : (
                optionsFiltrees.map((opt, index) => {
                  const estSelectionne = opt.valeur === valeurNormalisee;
                  const estSurvole = index === indexSurvol;

                  return (
                    <button
                      key={opt.valeur}
                      type="button"
                      role="option"
                      aria-selected={estSelectionne}
                      onClick={() => choisir(opt)}
                      onMouseEnter={() => setIndexSurvol(index)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-2.5 py-2 text-xs rounded-md text-left transition-colors cursor-pointer",
                        estSelectionne && "bg-primary/10 text-primary font-medium",
                        estSurvole && !estSelectionne && "bg-muted text-foreground",
                        !estSelectionne && !estSurvole && "text-foreground",
                      )}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate">{opt.libelle}</span>
                        {opt.description && (
                          <span className="truncate text-[11px] text-muted-foreground">
                            {opt.description}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {opt.badge && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground uppercase">
                            {opt.badge}
                          </span>
                        )}
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
  );
}
