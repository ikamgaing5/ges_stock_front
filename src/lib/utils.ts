import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Détermine si l'appareil courant est un téléphone/smartphone mobile.
 * Retourne false sur ordinateur (PC / Mac).
 */
export function estAppareilMobile(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent || "";
  const estUaMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const estTactileMobile =
    Boolean(window.matchMedia && window.matchMedia("(pointer: coarse)").matches) &&
    navigator.maxTouchPoints > 0 &&
    window.innerWidth < 768;

  return estUaMobile || estTactileMobile;
}

