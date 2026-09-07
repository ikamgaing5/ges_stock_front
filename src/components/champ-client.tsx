"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { ClientResume } from "@/types";

export interface ChampClientProps {
  valeurNom: string;
  onNomChange: (nom: string) => void;
  valeurTelephone: string;
  onTelephoneChange: (telephone: string) => void;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  erreur?: string;
  className?: string;
}

// Cache global en mémoire pour les clients
let clientsCache: ClientResume[] | null = null;
let chargementEnCoursPromise: Promise<ClientResume[]> | null = null;

export function ChampClient({
  valeurNom,
  onNomChange,
  valeurTelephone,
  onTelephoneChange,
  id = "client-nom",
  required = false,
  disabled = false,
  erreur,
  className = "",
}: ChampClientProps) {
  const { t } = useI18n();

  const [clients, setClients] = useState<ClientResume[]>(clientsCache ?? []);
  const [chargement, setChargement] = useState(!clientsCache);
  const [ouvert, setOuvert] = useState(false);
  const [indexSurvol, setIndexSurvol] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [monte, setMonte] = useState(false);

  const conteneurRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMonte(true);
  }, []);

  // Calcul dynamique de la position du dropdown pour ne jamais être coupé par la modale
  const mettreAJourPosition = useCallback(() => {
    if (!inputRef.current) return;
    const b = inputRef.current.getBoundingClientRect();
    const espaceBas = window.innerHeight - b.bottom;
    const hauteurDropdown = 220;
    const afficherEnHaut = espaceBas < hauteurDropdown && b.top > hauteurDropdown;

    setPosition({
      top: afficherEnHaut ? Math.max(8, b.top - hauteurDropdown - 4) : b.bottom + 4,
      left: b.left,
      width: b.width,
    });
  }, []);

  // Charger les clients depuis l'API (toutes boutiques)
  const chargerClients = useCallback(async () => {
    if (clientsCache) {
      setClients(clientsCache);
      setChargement(false);
      return;
    }

    if (chargementEnCoursPromise) {
      try {
        const data = await chargementEnCoursPromise;
        setClients(data);
      } finally {
        setChargement(false);
      }
      return;
    }

    setChargement(true);
    chargementEnCoursPromise = api
      .get<{ data: ClientResume[] }>("/clients")
      .then((res) => {
        clientsCache = res.data ?? [];
        return clientsCache;
      })
      .catch(() => []);

    try {
      const data = await chargementEnCoursPromise;
      setClients(data);
    } finally {
      chargementEnCoursPromise = null;
      setChargement(false);
    }
  }, []);

  // Mettre à jour la position au défilement / redimensionnement
  useEffect(() => {
    if (!ouvert) return;
    mettreAJourPosition();

    function onScrollOrResize() {
      mettreAJourPosition();
    }

    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [ouvert, mettreAJourPosition]);

  // Fermer la liste déroulante au clic en dehors
  useEffect(() => {
    function gererClicExterieur(event: MouseEvent) {
      const cible = event.target as Node;
      if (
        conteneurRef.current &&
        !conteneurRef.current.contains(cible) &&
        listeRef.current &&
        !listeRef.current.contains(cible)
      ) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", gererClicExterieur);
    return () => document.removeEventListener("mousedown", gererClicExterieur);
  }, []);

  // Liste des clients uniques par nom (juste les noms sans doublons)
  const clientsUniques = useMemo(() => {
    const vus = new Set<string>();
    const liste: ClientResume[] = [];
    for (const c of clients) {
      const nomTrim = (c.nom || "").trim();
      if (nomTrim && !vus.has(nomTrim.toLowerCase())) {
        vus.add(nomTrim.toLowerCase());
        liste.push(c);
      }
    }
    return liste;
  }, [clients]);

  // Filtrer uniquement selon le nom saisi
  const clientsFiltres = useMemo(() => {
    const q = valeurNom.trim().toLowerCase();
    if (!q) {
      return clientsUniques.slice(0, 10);
    }
    return clientsUniques
      .filter((c) => c.nom.toLowerCase().includes(q))
      .slice(0, 10);
  }, [clientsUniques, valeurNom]);

  useEffect(() => {
    setIndexSurvol(0);
  }, [clientsFiltres]);

  function selectionnerClient(client: ClientResume) {
    onNomChange(client.nom);
    if (client.telephone) {
      onTelephoneChange(client.telephone);
    }
    setOuvert(false);
  }

  function gererKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!ouvert) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        chargerClients();
        mettreAJourPosition();
        setOuvert(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndexSurvol((prev) => (prev + 1 < clientsFiltres.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndexSurvol((prev) => (prev > 0 ? prev - 1 : clientsFiltres.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = clientsFiltres[indexSurvol];
      if (c) {
        selectionnerClient(c);
      } else {
        setOuvert(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOuvert(false);
    }
  }

  return (
    <div ref={conteneurRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          className={cn(
            "h-10 pr-16 pl-9",
            erreur && "border-destructive focus-visible:ring-destructive/30",
          )}
          required={required}
          disabled={disabled}
          autoComplete="off"
          placeholder={t("telephones.rechercherClientPlaceholder")}
          value={valeurNom}
          onFocus={() => {
            chargerClients();
            mettreAJourPosition();
            setOuvert(true);
          }}
          onChange={(e) => {
            onNomChange(e.target.value);
            mettreAJourPosition();
            if (!ouvert) setOuvert(true);
          }}
          onKeyDown={gererKeyDown}
        />

        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {valeurNom && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                onNomChange("");
                setOuvert(true);
                inputRef.current?.focus();
              }}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              title={t("commun.reinitialiser") || "Effacer"}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => {
              if (!ouvert) {
                chargerClients();
                mettreAJourPosition();
              }
              setOuvert(!ouvert);
              inputRef.current?.focus();
            }}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-150", ouvert && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Menu déroulant des noms uniquement, flottant en portail pour ne pas être coupé */}
      {ouvert && !disabled && monte && position && typeof document !== "undefined" && createPortal(
        <div
          ref={listeRef}
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: position.width,
          }}
          className="z-[99999] max-h-56 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 duration-75"
        >
          {chargement ? (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>{t("commun.chargementEnCours")}</span>
            </div>
          ) : clientsFiltres.length > 0 ? (
            <div className="space-y-0.5">
              {clientsFiltres.map((c, index) => {
                const estSelectionne = index === indexSurvol;
                return (
                  <div
                    key={c.cle}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectionnerClient(c);
                    }}
                    onMouseEnter={() => setIndexSurvol(index)}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
                      estSelectionne ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted/60",
                    )}
                  >
                    <span className="truncate">{c.nom}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-2.5 text-xs text-muted-foreground text-center">
              {t("telephones.aucunClientTrouve")}
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
