"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

const CLE_URL_RETOUR = "telora_url_avant_hors_ligne";

export default function PageHorsLigne() {
  const router = useRouter();
  const { lang } = useI18n();
  const [enChargement, setEnChargement] = useState(false);
  const [echecTentative, setEchecTentative] = useState(false);

  const estAnglais = lang === "en";

  const titre = estAnglais ? "Can’t reach Telora" : "Impossible de joindre Telora";
  const sousTitre = estAnglais ? "Check your connection." : "Vérifiez votre connexion.";
  const texteBouton = estAnglais ? "Try again" : "Réessayer";
  const texteConnexion = estAnglais ? "Connecting..." : "Connexion...";

  // Vérifier si le réseau ou le serveur répond
  const testerConnexion = useCallback(async (): Promise<boolean> => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return false;
    }
    try {
      // Test de connectivité avec le serveur (requête ultra-légère anti-cache)
      const res = await fetch(`/favicon.svg?ping=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });
      return res.ok || res.status < 500;
    } catch {
      return false;
    }
  }, []);

  const tenterReconnexion = useCallback(async () => {
    setEnChargement(true);
    setEchecTentative(false);

    const estEnLigne = await testerConnexion();

    if (estEnLigne) {
      // Récupérer l'URL précédente ou aller sur la racine
      let urlRetour = "/";
      try {
        const sauvegardee = sessionStorage.getItem(CLE_URL_RETOUR);
        if (sauvegardee && !sauvegardee.startsWith("/hors-ligne")) {
          urlRetour = sauvegardee;
          sessionStorage.removeItem(CLE_URL_RETOUR);
        }
      } catch {
        // Ignorer l'erreur sessionStorage
      }
      // Recharger la page pour rafraîchir l'état
      window.location.href = urlRetour;
    } else {
      setEnChargement(false);
      setEchecTentative(true);
    }
  }, [testerConnexion]);

  useEffect(() => {
    // Si la connexion revient spontanément, tenter immédiatement de revenir
    const gererEnLigne = async () => {
      await tenterReconnexion();
    };

    window.addEventListener("online", gererEnLigne);

    // Tentative silencieuse toutes les 6 secondes
    const intervalle = setInterval(async () => {
      if (typeof navigator !== "undefined" && navigator.onLine) {
        const ok = await testerConnexion();
        if (ok) {
          await tenterReconnexion();
        }
      }
    }, 6000);

    return () => {
      window.removeEventListener("online", gererEnLigne);
      clearInterval(intervalle);
    };
  }, [tenterReconnexion, testerConnexion]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
      style={{
        backgroundColor: "#1f1e1d",
        color: "#f3f3f3",
      }}
    >
      <div className="flex max-w-[420px] flex-col items-center px-5 text-center">
        {/* En-tête : Icône officielle icon.png + Typographie TELORA */}
        <div className="mb-11 inline-flex items-center gap-3">
          <div className="relative h-[34px] w-[34px] overflow-hidden rounded-[6px]">
            <Image
              src="/icon.png"
              alt="Telora"
              width={34}
              height={34}
              priority
              className="object-contain"
            />
          </div>
          <span className="text-[26px] font-bold tracking-tight text-[#f4f4f5]">
            Telora
          </span>
        </div>

        {/* Titre minimaliste inspiré de Claude */}
        <h1 className="mb-2 text-[24px] font-medium tracking-tight text-[#f3f3f3]">
          {titre}
        </h1>

        {/* Sous-titre discret */}
        <p className="mb-7 text-[15px] font-normal text-[#9e9d99]">
          {sousTitre}
        </p>

        {/* Bouton d'action épuré */}
        <button
          onClick={tenterReconnexion}
          disabled={enChargement}
          className="inline-flex items-center gap-2 rounded-lg bg-[#ececec] px-[22px] py-[9px] text-[14px] font-semibold text-[#1f1e1d] transition-all hover:bg-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enChargement && (
            <span
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#1f1e1d]/20 border-t-[#1f1e1d]"
              aria-hidden="true"
            />
          )}
          <span>{enChargement ? texteConnexion : texteBouton}</span>
        </button>

        {/* Indication subtile si la tentative échoue */}
        {echecTentative && (
          <p className="mt-4 text-xs text-red-400/80 transition-opacity">
            {estAnglais
              ? "Connection still unavailable. Please check your network."
              : "Connexion toujours indisponible. Veuillez vérifier votre réseau."}
          </p>
        )}
      </div>
    </div>
  );
}
