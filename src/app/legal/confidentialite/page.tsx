"use client";

import { useI18n } from "@/lib/i18n";
import {
  Shield,
  Lock,
  EyeOff,
  Database,
  Bell,
  FileCheck,
  CheckCircle,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PagePolitiqueConfidentialite() {
  const { lang } = useI18n();

  return (
    <article className="max-w-4xl space-y-10 text-foreground pb-12">
      {/* En-tête */}
      <header className="space-y-4 border-b border-border/60 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 w-fit">
            {/* <Shield className="h-3.5 w-3.5" /> */}
            <span>
              {lang === "en"
                ? "Confidentiality & Data Protection Agreement"
                : "Accord de Confidentialité & Protection des Données"}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="w-fit text-xs gap-1.5 cursor-pointer print:hidden"
          >
            {/* <Printer className="h-3.5 w-3.5" /> */}
            <span>
              {lang === "en"
                ? "Print / Save as PDF"
                : "Imprimer / Enregistrer en PDF"}
            </span>
          </Button>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          {lang === "en"
            ? "Privacy Policy & Non-Disclosure Undertaking"
            : "Politique de Confidentialité et Engagement de Non-Divulgation"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-2">
          <span>
            {lang === "en"
              ? "Version 1.0 • Updated January 2026"
              : "Version 1.0 • Mise à jour Janvier 2026"}
          </span>
          <span>•</span>
          <span>
            {lang === "en"
              ? "Protecting your commercial trade secrets and IMEI assets"
              : "Garantie de secret d'affaires, protection des marges et des IMEI"}
          </span>
        </p>
      </header>

      {/* 3 Engagements Solennels */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
            {/* <EyeOff className="h-4 w-4" /> */}
            <span>
              {lang === "en" ? "Zero Commercial Use" : "Zéro Monétisation"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "en"
              ? "Your wholesale purchase prices, sales margins, and turnover are strictly confidential and will never be monetized."
              : "Vos prix d'achat grossistes, marges réelles et volumes ne sont jamais revendus ni cédés à des tiers ou régies."}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            {/* <Lock className="h-4 w-4" /> */}
            <span>
              {lang === "en"
                ? "Multi-Tenant Isolation"
                : "Cloisonnement Étanche"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "en"
              ? "Programmatic database isolation. Platform support and system admins have no operational view on your stock."
              : "Ségrégation stricte par boutique et propriétaire. L'administrateur technique ne consulte jamais vos stocks."}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-500 font-semibold text-sm">
            {/* <Database className="h-4 w-4" /> */}
            <span>
              {lang === "en" ? "You Own Your Data" : "Pleine Propriété"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "en"
              ? "Your client records, serial history and invoices belong exclusively to you. Instant export anytime."
              : "Vos fiches clients, historiques IMEI et factures vous appartiennent à 100 %. Exportation libre à tout moment."}
          </p>
        </div>
      </div>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
          {/* <FileCheck className="h-4 w-4 text-primary" /> */}
          <span>
            {lang === "en"
              ? "1. Scope of Protected Business Information"
              : "1. Périmètre des Informations Confidentielles Protégées"}
          </span>
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            {lang === "en"
              ? "Under this agreement, Telora protects as strictly confidential all operational and commercial information entrusted by the merchant:"
              : "Au titre du présent engagement, Telora qualifie de strictement confidentielles l'ensemble des données d'exploitation saisies par le commerçant :"}
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li>
              <strong className="text-foreground">
                {lang === "en"
                  ? "Wholesale & Pricing data: "
                  : "Données financières et tarifaires : "}
              </strong>
              {lang === "en"
                ? "Supplier acquisition costs, sales prices, discount rules, profit margins, and daily turnover."
                : "Prix d'achat consentis par les grossistes, prix de vente, règles de marge et recettes d'encaissement."}
            </li>
            <li>
              <strong className="text-foreground">
                {lang === "en"
                  ? "Serialized Stock data: "
                  : "Données de stock et appareils : "}
              </strong>
              {lang === "en"
                ? "IMEI device numbers, brand and model catalog, movement history, repair (SAV) logs, and physical distribution between outlets."
                : "Numéros IMEI uniques, répartition par point de vente, journal des mouvements et états SAV."}
            </li>
            <li>
              <strong className="text-foreground">
                {lang === "en"
                  ? "End-Customer records: "
                  : "Fichiers clients et acheteurs : "}
              </strong>
              {lang === "en"
                ? "Names, phone numbers, invoice archives, and warranty documents."
                : "Coordonnées des acheteurs finaux consignées lors des ventes ou réservations, et factures émises."}
            </li>
          </ul>
        </div>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en"
            ? "2. Non-Disclosure & Non-Monetization Undertaking"
            : "2. Engagement Formel de Non-Divulgation"}
        </h2>
        <div className="rounded-xl border bg-muted/20 p-4 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p className="flex items-start gap-2">
            {/* <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> */}
            <span>
              <strong className="text-foreground">
                {lang === "en"
                  ? "No resale to third parties: "
                  : "Aucune revente à des tiers : "}
              </strong>
              {lang === "en"
                ? "Telora will never share, broker, rent, or monetize your stock, prices, or customer identities to mobile carriers, wholesalers, advertisers, or competitors."
                : "Telora s'interdit formellement de céder, louer ou valoriser vos informations de stock et marges auprès d'opérateurs télécoms, annonceurs, grossistes ou concurrents."}
            </span>
          </p>
          <p className="flex items-start gap-2">
            {/* <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> */}
            <span>
              <strong className="text-foreground">
                {lang === "en"
                  ? "Staff duty of confidentiality: "
                  : "Secret professionnel des collaborateurs : "}
              </strong>
              {lang === "en"
                ? "All software engineers and technical personnel with access to backend infrastructure are bound by rigorous individual confidentiality covenants."
                : "L'ensemble des ingénieurs, techniciens et administrateurs d'infrastructure de Telora sont soumis à une obligation légale stricte de secret professionnel."}
            </span>
          </p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en"
            ? "3. Security Architecture & Encryption"
            : "3. Architecture Technique et Sécurité du Chiffrement"}
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            {lang === "en"
              ? "All network exchanges are secured through TLS 1.3 / HTTPS encryption. Passwords, Two-Factor Authentication (TOTP) secrets, and emergency backup codes are hashed and encrypted at rest in the database."
              : "L'ensemble des flux de transmission s'effectue sous protocole chiffré TLS 1.3 / HTTPS. Les mots de passe, clés secrètes 2FA TOTP et codes de secours sont hachés ou chiffrés au repos en base de données."}
          </p>
          <p>
            {lang === "en"
              ? "Database queries are permanently scoped to the subscriber tenant identifier (`proprietaire_id`), making cross-tenant data leaks impossible."
              : "Les requêtes de base de données sont systématiquement cloisonnées par l'identifiant du propriétaire de boutique (`proprietaire_id`), garantissant l'étanchéité absolue entre commerces concurrents."}
          </p>
        </div>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
          {/* <Bell className="h-4 w-4 text-amber-500" /> */}
          <span>
            {lang === "en"
              ? "4. Data Breach Notification Guarantee"
              : "4. Alerte et Notification en Cas d'Incident"}
          </span>
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "In the unlikely event of an identified security breach affecting your store records, Telora commits to notifying the account owner within 48 hours with full details of the incident and remediation actions."
            : "Dans l'éventualité d'un incident de sécurité avéré impactant les données de votre compte, Telora s'engage à notifier le titulaire du compte propriétaire par écrit sous 48 heures, avec le détail des mesures correctives déployées."}
        </p>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en"
            ? "5. Data Retention, Portability & Purge"
            : "5. Durée de Conservation, Export et Destruction"}
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            {lang === "en"
              ? "Data remains stored as long as your account is active. Upon account termination, you retain a 60-day window to export your serialized inventories, sales logs, and financial records."
              : "Vos données sont conservées pendant toute la durée active de votre abonnement. En cas de résiliation, une période de 60 jours vous permet d'exporter l'intégralité de vos stocks et mouvements."}
          </p>
          <p>
            {lang === "en"
              ? "After the retention period or upon express formal request, all database rows relating to your company are permanently and irreversibly purged from our active systems."
              : "À l'issue de cette période ou sur demande expresse formulée par le propriétaire, l'ensemble des enregistrements rattachés au compte est définitivement et irréversiblement purgé des serveurs de production."}
          </p>
        </div>
      </section>

      {/* Section 6 */}
      {/* <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "6. Contact Data Protection Officer" : "6. Délégué à la Protection des Données"}
        </h2>
        <div className="rounded-xl border bg-muted/30 p-4 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground">
              {lang === "en" ? "Privacy & Trade Secret Office" : "Pôle Confidentialité et Secrets d'Affaires"}
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">
              {lang === "en" ? "For export requests or non-disclosure contract signing:" : "Pour toute demande d'accord bilatéral personnalisé ou export de données :"}
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-background border text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
            confidentialite@telora.app
          </span>
        </div>
      </section> */}
    </article>
  );
}
