"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CLE_CONSENTEMENT = "gestion-stock-cookies-consent";

/**
 * Intégration Google Analytics 4 (GA4).
 * Respecte le consentement utilisateur : ne déclenche les balises que si
 * le consentement aux données analytiques est actif.
 */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [consentementValide, setConsentementValide] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà consenti aux cookies techniques & analytiques
    const consentement = window.localStorage.getItem(CLE_CONSENTEMENT);
    if (consentement) {
      setConsentementValide(true);
    }

    // Écouteur en cas d'acceptation du bandeau pendant la navigation
    function verifierConsentement() {
      if (window.localStorage.getItem(CLE_CONSENTEMENT)) {
        setConsentementValide(true);
      }
    }

    window.addEventListener("storage", verifierConsentement);
    return () => window.removeEventListener("storage", verifierConsentement);
  }, []);

  // Si aucun identifiant n'est fourni ou consentement non donné, ne pas charger le traceur
  if (!gaId || !consentementValide) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              anonymize_ip: true
            });
          `,
        }}
      />
    </>
  );
}
