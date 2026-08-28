"use client";

import { useI18n } from "@/lib/i18n";

export default function PagePolitiqueConfidentialite() {
  const { lang } = useI18n();

  return (
    <article className="max-w-3xl space-y-8 text-foreground">
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {lang === "en" ? "Privacy Policy" : "Politique de Confidentialité"}
        </h1>
        <p className="text-xs text-muted-foreground">
          {lang === "en" ? "Last updated: January 2026" : "Dernière mise à jour : Janvier 2026"}
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "1. General Principles" : "1. Principes Généraux"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "The platform guarantees the protection of personal and commercial data in accordance with applicable regulations. No customer data is ever sold, rented, or transferred to third parties for advertising or commercial purposes."
            : "La plateforme garantit la protection des données personnelles et d'entreprise conformément aux réglementations applicables. Aucune donnée n'est vendue, louée ou cédée à des tiers à des fins publicitaires ou commerciales."}
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "2. Data Collected" : "2. Données Collectées"}
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p><strong className="text-foreground">Données d'identification du compte :</strong> nom complet, adresse email, numéro de téléphone, mot de passe sécurisé et rôle attribué au sein de l'entreprise.</p>
          <p><strong className="text-foreground">Données opérationnelles de stock :</strong> numéros IMEI, marques, modèles de téléphones, prix d'achat, prix de vente et boutiques de rattachement.</p>
          <p><strong className="text-foreground">Historique et traçabilité :</strong> dates, heures et auteurs des entrées, sorties, transferts inter-boutiques et ventes enregistrées.</p>
          <p><strong className="text-foreground">Données techniques :</strong> adresse IP (utilisée pour la détection de la devise de travail locale, mise en cache sur le terminal).</p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "3. Purposes of Processing" : "3. Finalités du Traitement"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Les données recueillies sont strictement destinées aux opérations suivantes :
        </p>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1.5 leading-relaxed">
          <li>Gestion des stocks, identification par code-barres et suivi unitaire des numéros IMEI.</li>
          <li>Enregistrement des ventes, génération des historiques et rapports d'activité.</li>
          <li>Contrôle d'accès et sécurisation des comptes (double authentification, détection d'anomalies).</li>
          <li>Gestion technique des abonnements et support utilisateur.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "4. Data Retention" : "4. Conservation des Données"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Les données sont conservées pendant toute la durée active du compte professionnel. En cas de résiliation, l'utilisateur a la possibilité d'exporter ses données. À l'issue d'un délai légal de conservation fiscale et comptable, les informations sont définitivement purgées de nos serveurs.
        </p>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "5. User Rights" : "5. Droits des Utilisateurs"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Tout utilisateur dispose d'un droit d'accès, de rectification, de portabilité et de suppression de ses données personnelles. Ces droits peuvent être exercés directement depuis l'espace « Mon compte » ou en adressant une demande à notre équipe à l'adresse suivante :
        </p>
        <div className="rounded-lg border bg-muted/30 p-4 text-xs sm:text-sm">
          <p><span className="font-semibold text-foreground">Contact données personnelles :</span> privacy@gestionstock.local</p>
        </div>
      </section>
    </article>
  );
}
