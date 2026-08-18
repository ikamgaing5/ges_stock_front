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

const LONGUEUR = 6;

export function ChampCode({
  valeur,
  onChange,
  onComplet,
  erreur,
  autoFocus = true,
}: {
  valeur: string;
  onChange: (code: string) => void;
  /** Appelé dès que les 6 chiffres sont saisis. */
  onComplet?: (code: string) => void;
  erreur?: boolean;
  autoFocus?: boolean;
}) {
  const cases = useRef<(HTMLInputElement | null)[]>([]);
  const dejaSignale = useRef(false);

  const chiffres = valeur.replace(/\D/g, "").slice(0, LONGUEUR);

  useEffect(() => {
    if (chiffres.length === LONGUEUR && !dejaSignale.current) {
      dejaSignale.current = true;
      onComplet?.(chiffres);
    }
    if (chiffres.length < LONGUEUR) {
      dejaSignale.current = false;
    }
  }, [chiffres, onComplet]);

  function ecrire(index: number, saisie: string) {
    const propre = saisie.replace(/\D/g, "");
    if (!propre) return;

    // Le collage d'un code entier remplit toutes les cases d'un coup.
    const suite = (
      chiffres.slice(0, index) +
      propre +
      chiffres.slice(index + propre.length)
    ).slice(0, LONGUEUR);

    onChange(suite);

    const suivante = Math.min(index + propre.length, LONGUEUR - 1);
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

    if (evenement.key === "ArrowRight" && index < LONGUEUR - 1) {
      evenement.preventDefault();
      cases.current[index + 1]?.focus();
    }
  }

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="Code de vérification">
      {Array.from({ length: LONGUEUR }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            cases.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={LONGUEUR}
          autoFocus={autoFocus && index === 0}
          value={chiffres[index] ?? ""}
          onChange={(e) => ecrire(index, e.target.value)}
          onKeyDown={(e) => toucheSpeciale(index, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`Chiffre ${index + 1}`}
          className={cn(
            "chiffres h-14 w-full rounded-lg border bg-transparent text-center font-mono text-xl transition-colors",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            erreur ? "border-destructive" : "border-input",
          )}
        />
      ))}
    </div>
  );
}
