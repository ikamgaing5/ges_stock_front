import React from "react";

/**
 * Composant d'injection des données structurées Schema.org (JSON-LD).
 * Optimisé pour le référencement local, les rich snippets Google et la reconnaissance logicielle SaaS.
 */
export function SchemaOrg() {
  const domaine = process.env.NEXT_PUBLIC_APP_URL || "https://telora.app";

  // Schéma Logiciel Professionnel (SoftwareApplication)
  const schemaLogiciel = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Telora",
    operatingSystem: "Web, All modern browsers, iOS, Android",
    applicationCategory: "BusinessApplication",
    description:
      "Logiciel de gestion de stock unitaire par IMEI, traçabilité et encaissement en point de vente pour boutiques de téléphones mobiles et appareils électroniques.",
    url: domaine,
    image: `${domaine}/telora-abstract-2.jpg`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      description: "Essai gratuit de démarrage sans engagement ni carte bancaire.",
    },
    featureList: [
      "Scan d'IMEI unitaire par caméra et douchette",
      "Reconnaissance automatique de marque et modèle via base TAC mondiale",
      "Gestion multi-boutiques et multi-utilisateurs avec droits d'accès",
      "Enregistrement de ventes, suivi de marge et clôture de caisse en 3 minutes",
      "Support multi-devises automatique par géolocalisation IP (XAF, XOF, EUR, USD, CAD, CDF)",
    ],
    author: {
      "@type": "Organization",
      name: "Impact Tech Solutions",
      url: domaine,
    },
  };

  // Schéma Entreprise & Commerce Local (LocalBusiness / Organization)
  const schemaEntreprise = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Telora — Solution Commerces & Téléphonie",
    image: `${domaine}/telora-abstract-2.jpg`,
    url: domaine,
    telephone: "+33100000000",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressCountry: "FR",
      addressLocality: "Paris",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "08:00",
      closes: "20:00",
    },
    sameAs: [
      "https://twitter.com/telora_app",
      "https://linkedin.com/company/telora-app",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLogiciel) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaEntreprise) }}
      />
    </>
  );
}
