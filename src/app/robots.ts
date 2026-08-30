import type { MetadataRoute } from "next";

/**
 * Directives robots.txt pour guider l'indexation par les moteurs de recherche.
 */
export default function robots(): MetadataRoute.Robots {
  const domaine = process.env.NEXT_PUBLIC_APP_URL || "https://telora.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/connexion",
          "/inscription",
          "/mot-de-passe-oublie",
          "/faq",
          "/legal/",
          "/etudes-de-cas",
          "/merci",
          "/icon.svg",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/invitation/",
          "/mon-compte",
          "/telephones",
          "/scanner",
          "/modeles",
          "/mouvements",
          "/equipe",
          "/boutiques",
          "/_next/",
        ],
      },
    ],
    sitemap: `${domaine}/sitemap.xml`,
  };
}
