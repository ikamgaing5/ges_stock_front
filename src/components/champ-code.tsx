"use client";

/**
 * Saisie d'un code à 6 chiffres, une case par chiffre.
 *
 * Six cases plutôt qu'un seul champ : on voit d'un coup d'œil combien de
 * chiffres il reste, et le collage du code depuis l'application mail
 * remplit tout d'un coup.
 */

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function ChampCode({
  valeur,
  onChange,
  onComplet,
  erreur,
  autoFocus = true,
  longueur = 6,
}: {
  valeur: string;
  onChange: (code: string) => void;
  /** Appelé dès que tous les chiffres sont saisis. */
  onComplet?: (code: string) => void;
  erreur?: boolean;
  autoFocus?: boolean;
  longueur?: number;
}) {
  const cases = useRef<(HTMLInputElement | null)[]>([]);
  const dejaSignale = useRef(false);

  const chiffres = valeur.replace(/\D/g, "").slice(0, longueur);

  useEffect(() => {
    if (chiffres.length === longueur && !dejaSignale.current) {
      dejaSignale.current = true;
      onComplet?.(chiffres);
    }
    if (chiffres.length < longueur) {
      dejaSignale.current = false;
    }
  }, [chiffres, longueur, onComplet]);

  function ecrire(index: number, saisie: string) {
    const propre = saisie.replace(/\D/g, "");
    if (!propre) return;

    // Le collage d'un code entier remplit toutes les cases d'un coup.
    const suite = (
      chiffres.slice(0, index) +
      propre +
      chiffres.slice(index + propre.length)
    ).slice(0, longueur);

    onChange(suite);

    const suivante = Math.min(index + propre.length, longueur - 1);
    cases.current[suivante]?.focus();
  }

  function toucheSpeciale(
    index: number,
    evenement: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (evenement.key === "Backspace") {
      evenement.preventDefault();

      if (chiffres[index]) {
        // Efface le chiffre de la case courante.
        onChange(chiffres.slice(0, index) + chiffres.slice(index + 1));
      } else if (index > 0) {
        // Case déjà vide : on remonte et on efface la précédente.
        onChange(chiffres.slice(0, index - 1) + chiffres.slice(index));
        cases.current[index - 1]?.focus();
      }
      return;
    }

    if (evenement.key === "ArrowLeft" && index > 0) {
      evenement.preventDefault();
      cases.current[index - 1]?.focus();
    }

    if (evenement.key === "ArrowRight" && index < longueur - 1) {
      evenement.preventDefault();
      cases.current[index + 1]?.focus();
    }
  }

  return (
    <div
      className={cn(
        "flex justify-between",
        longueur > 6 ? "gap-1 sm:gap-2" : "gap-2",
      )}
      role="group"
      aria-label="Code de vérification"
    >
      {Array.from({ length: longueur }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            cases.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={longueur}
          autoFocus={autoFocus && index === 0}
          value={chiffres[index] ?? ""}
          onChange={(e) => ecrire(index, e.target.value)}
          onKeyDown={(e) => toucheSpeciale(index, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`Chiffre ${index + 1}`}
          className={cn(
            "chiffres w-full rounded-lg border bg-transparent text-center font-mono transition-colors",
            longueur > 6 ? "h-11 sm:h-14 text-lg sm:text-xl" : "h-14 text-xl",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            erreur ? "border-destructive" : "border-input",
          )}
        />
      ))}
    </div>
  );
}
