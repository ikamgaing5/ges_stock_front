"use client";

import { Clock, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface AlerteRateLimitProps {
  /** Nombre de secondes restantes */
  secondes: number;
  /** Message personnalisé optionnel */
  message?: string | null;
  /** Classe CSS additionnelle */
  className?: string;
  /** Taille compacte pour intégration dans un formulaire étroit */
  compact?: boolean;
}

/**
 * Composant visuel moderne qui affiche un décompte dynamique en temps réel
 * lors d'un blocage de type rate limiting.
 */
export function AlerteRateLimit({
  secondes,
  message,
  className = "",
  compact = false,
}: AlerteRateLimitProps) {
  const { lang, t } = useI18n();

  if (secondes <= 0) return null;

  const estAnglais = lang === "en";

  const messageAffiche =
    message ||
    (estAnglais
      ? `Too many requests. Please wait ${secondes}s before trying again.`
      : `Trop de tentatives. Veuillez patienter ${secondes}s avant de réessayer.`);

  if (compact) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 ${className}`}
      >
        <Clock className="h-3.5 w-3.5 shrink-0 animate-pulse text-amber-500" />
        <span className="flex-1">{messageAffiche}</span>
        <span className="shrink-0 font-mono font-bold">{secondes}s</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm text-amber-700 dark:text-amber-300 shadow-sm ${className}`}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
        <ShieldAlert className="h-4 w-4 animate-pulse" />
      </div>
      <div className="flex-1">
        <p className="font-semibold leading-tight text-amber-900 dark:text-amber-200">
          {estAnglais ? "Rate limit active" : "Délai de sécurité actif"}
        </p>
        <p className="mt-1 text-xs text-amber-700/90 dark:text-amber-300/90">
          {messageAffiche}
        </p>
      </div>
      <div className="flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-1 font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
        <Clock className="h-3 w-3" />
        <span>{secondes}s</span>
      </div>
    </div>
  );
}
