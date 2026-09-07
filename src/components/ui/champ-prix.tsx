"use client";

import React, { useRef, useId } from "react";
import { Input } from "@/components/ui/input";
import { formaterNombreSaisie, nettoyerNombreSaisie } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ChampPrixProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  valeur: string | number;
  onChange: (valeurNettoyee: string) => void;
  devise?: string;
  permettreDecimales?: boolean;
  erreur?: boolean | string;
}

export function ChampPrix({
  valeur,
  onChange,
  devise,
  permettreDecimales = false,
  placeholder,
  erreur,
  className,
  id,
  disabled,
  ...props
}: ChampPrixProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id || generatedId;

  // Affichage formaté (ex: 850 000)
  const valeurAffichee = formaterNombreSaisie(valeur, permettreDecimales);
  const placeholderAffiche = placeholder
    ? formaterNombreSaisie(placeholder, permettreDecimales)
    : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawValue = input.value;
    const cursorPos = input.selectionStart ?? rawValue.length;

    // Nombre de caractères non-espaces avant le curseur
    const nonSpacesBefore = rawValue.slice(0, cursorPos).replace(/\s/g, "").length;

    const nettoye = nettoyerNombreSaisie(rawValue, permettreDecimales);
    const formatee = formaterNombreSaisie(nettoye, permettreDecimales);

    onChange(nettoye);

    // Repositionnement précis du curseur dans la valeur formatée
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      let targetPos = 0;
      let count = 0;
      for (let i = 0; i < formatee.length; i++) {
        if (formatee[i] !== " ") {
          count++;
        }
        if (count === nonSpacesBefore) {
          targetPos = i + 1;
          break;
        }
      }
      // Si on était au début
      if (nonSpacesBefore === 0) targetPos = 0;
      inputRef.current.setSelectionRange(targetPos, targetPos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const input = e.currentTarget;
      const { selectionStart, selectionEnd, value } = input;
      if (
        selectionStart !== null &&
        selectionStart === selectionEnd &&
        selectionStart > 0
      ) {
        // Si le caractère juste avant le curseur est un espace, supprimer le chiffre d'avant
        if (value[selectionStart - 1] === " ") {
          e.preventDefault();
          const avant = value.slice(0, selectionStart - 2);
          const apres = value.slice(selectionStart);
          const nouveau = avant + apres;
          const nettoye = nettoyerNombreSaisie(nouveau, permettreDecimales);
          const formatee = formaterNombreSaisie(nettoye, permettreDecimales);
          onChange(nettoye);

          const nonSpacesBefore = avant.replace(/\s/g, "").length;
          requestAnimationFrame(() => {
            if (!inputRef.current) return;
            let targetPos = 0;
            let count = 0;
            for (let i = 0; i < formatee.length; i++) {
              if (formatee[i] !== " ") count++;
              if (count === nonSpacesBefore) {
                targetPos = i + 1;
                break;
              }
            }
            if (nonSpacesBefore === 0) targetPos = 0;
            inputRef.current.setSelectionRange(targetPos, targetPos);
          });
        }
      }
    }
  };

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        id={inputId}
        type="text"
        inputMode={permettreDecimales ? "decimal" : "numeric"}
        autoComplete="off"
        className={cn(
          "chiffres h-10 font-mono tracking-wide",
          devise && "pr-14",
          erreur && "border-destructive focus-visible:ring-destructive/30",
          className
        )}
        value={valeurAffichee}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholderAffiche}
        disabled={disabled}
        {...props}
      />
      {devise && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">
            {devise}
          </span>
        </div>
      )}
    </div>
  );
}
