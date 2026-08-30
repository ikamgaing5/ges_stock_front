import type { MetadataRoute } from "next";

/**
 * Génération du sitemap XML pour le référencement naturel.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const domaine = process.env.NEXT_PUBLIC_APP_URL || "https://telora.app";
  const maintenant = new Date();

  const pagesPubliques = [
    { url: `${domaine}/`, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${domaine}/connexion`, priority: 0.8, changeFrequency: "monthly" as const },
    { url: `${domaine}/inscription`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${domaine}/faq`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${domaine}/etudes-de-cas`, priority: 0.85, changeFrequency: "weekly" as const },
    { url: `${domaine}/merci`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${domaine}/legal/mentions-legales`, priority: 0.5, changeFrequency: "yearly" as const },
    { url: `${domaine}/legal/securite`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${domaine}/legal/confidentialite`, priority: 0.5, changeFrequency: "yearly" as const },
    { url: `${domaine}/legal/cookies`, priority: 0.4, changeFrequency: "yearly" as const },
    { url: `${domaine}/legal/cgu`, priority: 0.5, changeFrequency: "yearly" as const },
    { url: `${domaine}/legal/accessibilite`, priority: 0.4, changeFrequency: "yearly" as const },
  ];

  return pagesPubliques.map((page) => ({
    url: page.url,
    lastModified: maintenant,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
