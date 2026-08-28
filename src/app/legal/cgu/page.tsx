"use client";

import { useI18n } from "@/lib/i18n";

export default function PageConditionsUtilisation() {
  const { lang } = useI18n();

  return (
    <article className="max-w-3xl space-y-8 text-foreground">
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {lang === "en" ? "Terms of Service" : "Conditions Générales d'Utilisation (CGU)"}
        </h1>
        <p className="text-xs text-muted-foreground">
          {lang === "en" ? "Last updated: January 2026" : "Dernière mise à jour : Janvier 2026"}
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "1. Purpose of the Platform" : "1. Objet de la Plateforme"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          La plateforme Telora est une application professionnelle de gestion de stock, d'inventaire unitaire par IMEI et de suivi des ventes destinée aux commerces de téléphonie et produits électroniques.
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "2. Accounts & Responsibilities" : "2. Comptes et Responsabilités"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          L'accès au service est réservé aux professionnels. Le titulaire du compte principal est responsable de la conservation de ses identifiants et des accès délégués accordés à ses employés. Toute action réalisée depuis un compte collaborateur est réputée effectuée sous la responsabilité du titulaire de l'abonnement.
        </p>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "3. Subscription & Free Trial" : "3. Modalités d'Abonnement et Essai"}
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p><strong className="text-foreground">Période d'essai :</strong> Chaque nouvel utilisateur dispose d'une période d'essai gratuit lui permettant de tester les fonctionnalités sans engagement.</p>
          <p><strong className="text-foreground">Abonnement actif :</strong> À l'issue de l'essai, l'accès continu aux fonctionnalités d'écriture et de vente requiert un abonnement valide.</p>
          <p><strong className="text-foreground">Suspension :</strong> En l'absence de renouvellement, les fonctionnalités d'enregistrement sont suspendues sans destruction immédiate des données.</p>
        </div>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "4. Hardware & IMEI Compliance" : "4. Réglementation sur les Appareils et Numéros IMEI"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          L'utilisateur s'engage formellement à n'enregistrer dans l'application que des équipements acquis légalement. L'éditeur agit uniquement en tant que fournisseur de moyens logiciels et décline toute responsabilité quant à la provenance des matériels renseignés par les utilisateurs. La vérification automatique d'IMEI est fournie à titre indicatif et n'exonère pas le commerçant de son devoir de contrôle physique.
        </p>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "5. Availability & Termination" : "5. Disponibilité et Résiliation"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          L'éditeur met en œuvre tous les moyens raisonnables pour assurer la disponibilité continue du service 24h/24 et 7j/7, hors opérations de maintenance programmées. L'utilisateur peut résilier son abonnement à tout moment et demander l'exportation de ses données d'inventaire.
        </p>
      </section>
    </article>
  );
}
