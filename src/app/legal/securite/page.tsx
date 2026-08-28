"use client";

import { useI18n } from "@/lib/i18n";

export default function PageCentreSecurite() {
  const { lang } = useI18n();

  return (
    <article className="max-w-3xl space-y-8 text-foreground">
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {lang === "en" ? "Security Standards & Architecture" : "Sécurité & Protection des Données"}
        </h1>
        <p className="text-xs text-muted-foreground">
          {lang === "en" ? "Last updated: January 2026" : "Dernière mise à jour : Janvier 2026"}
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "1. Multi-Tenant Data Isolation" : "1. Cloisonnement Multi-Entreprises"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Chaque compte entreprise dispose d'une étanchéité logique stricte. Les requêtes de base de données sont systématiquement filtrées au niveau applicatif par identifiant de propriétaire. Aucune entreprise ou utilisateur externe ne peut accéder aux inventaires, marges, prix ou informations d'un autre compte.
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "2. Authentication & Access Control" : "2. Authentification et Contrôle d'Accès"}
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p><strong className="text-foreground">Chiffrement des mots de passe :</strong> Les mots de passe sont hachés de manière irréversible via bcrypt avec un facteur de coût élevé (12 rounds). Aucun mot de passe n'est stocké en clair.</p>
          <p><strong className="text-foreground">Authentification à deux facteurs (2FA) :</strong> Possibilité de configurer une vérification en deux étapes pour sécuriser les comptes administrateurs et propriétaires contre les usurpations d'identité.</p>
          <p><strong className="text-foreground">Rôles et permissions :</strong> Les permissions sont strictement délimitées (Propriétaire, Vendeuse, Secrétaire) pour restreindre l'accès des collaborateurs aux seules fonctions nécessaires à leur mission.</p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "3. Stock Traceability & Anti-Fraud" : "3. Traçabilité et Audit des Mouvements"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Chaque opération sur un appareil (entrée, sortie, vente, transfert entre boutiques) est enregistrée de manière immuable avec horodatage, boutique d'origine et identifiant de l'auteur. Les numéros IMEI garantissent une traçabilité unitaire empêchant les modifications rétroactives suspectes.
        </p>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "4. Backups & Service Continuity" : "4. Sauvegardes et Continuité d'Activité"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Des sauvegardes automatiques quotidiennes des bases de données sont générées et stockées sur des serveurs physiquement distincts. En cas d'incident matériel sur un serveur, les procédures de restauration permettent une reprise d'activité rapide sans perte de données d'inventaire.
        </p>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "5. Network & Transport Security" : "5. Sécurité Réseau et Chiffrement des Échanges"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Toutes les communications entre le navigateur web, l'application et les serveurs API sont chiffrées via le protocole HTTPS / TLS 1.3 avec certificats de sécurité à jour, empêchant toute interception de trafic.
        </p>
      </section>
    </article>
  );
}
