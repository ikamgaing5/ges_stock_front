"use client";

import { useI18n } from "@/lib/i18n";
import {
  ShieldCheck,
  FileText,
  Smartphone,
  Lock,
  AlertTriangle,
  Scale,
  RefreshCw,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageConditionsUtilisation() {
  const { lang } = useI18n();

  return (
    <article className="max-w-4xl space-y-10 text-foreground pb-12">
      {/* En-tête */}
      <header className="space-y-4 border-b border-border/60 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-full text-xs font-medium text-primary w-fit">
            {/* <Scale className="h-3.5 w-3.5" /> */}
            <span>
              {lang === "en"
                ? "Official Contract • Terms of Service"
                : "Contrat Officiel • Conditions Générales"}
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
            ? "Terms of Service & SaaS Agreement"
            : "Conditions Générales d'Utilisation et de Service (CGU / CGV)"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-2">
          <span>
            {lang === "en"
              ? "Version 1.0 • Effective Date: January 2026"
              : "Version 1.0 • Date d'effet : Janvier 2026"}
          </span>
          <span>•</span>
          <span>
            {lang === "en"
              ? "Applicable to all Telora business accounts"
              : "Applicable à l'ensemble des comptes professionnels Telora"}
          </span>
        </p>
      </header>

      {/* Résumé des points cardinaux */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            {/* <Smartphone className="h-4 w-4" /> */}
            <span>
              {lang === "en" ? "1 Device = 1 Line" : "1 Appareil = 1 Ligne"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "en"
              ? "Individual IMEI serial tracking with immutable audit trail. No generic aggregated stock quantities."
              : "Suivi unitaire par IMEI avec historique de mouvements infalsifiable. Aucune quantité globale arbitraire."}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
            {/* <AlertTriangle className="h-4 w-4" /> */}
            <span>
              {lang === "en" ? "Anti-Fencing & IMEI" : "Lutte contre le Recel"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "en"
              ? "Strict subscriber warranty regarding the lawful origin of all enrolled handsets. Zero tolerance policy."
              : "Engagement légal exclusif du commerçant sur l'origine licite de ses appareils. Tolérance zéro."}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
            {/* <ShieldCheck className="h-4 w-4" /> */}
            <span>
              {lang === "en" ? "Data Ownership" : "Propriété des Données"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "en"
              ? "You retain full ownership of your inventory, prices and customer database. Full data portability (CSV/JSON)."
              : "Vous restez propriétaire exclusif de vos stocks, marges et clients. Réversibilité intégrale (CSV/JSON)."}
          </p>
        </div>
      </div>

      {/* Préambule */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
          {/* <FileText className="h-4 w-4 text-primary" /> */}
          <span>
            {lang === "en"
              ? "Preamble & Legal Parties"
              : "Préambule et Parties Contractantes"}
          </span>
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "This SaaS Agreement governs relations between Telora (the 'Platform Publisher') and the subscribing business merchant (the 'Client' or 'Store Owner') operating phone retail, wholesale, or repair outlets. Account creation and use of the platform constitute full and irrevocable acceptance of these terms."
            : "Le présent contrat régit les relations contractuelles entre l'éditeur de la solution Telora (« le Prestataire ») et l'exploitant de boutique de téléphonie (« le Client » ou « Propriétaire »). La création d'un compte et l'accès à la solution emportent acceptation expresse, pleine et entière des présentes conditions."}
        </p>
      </section>

      {/* Article 1 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en"
            ? "Article 1 — Purpose & SaaS License Grant"
            : "Article 1 — Objet et Concession de Licence SaaS"}
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            {lang === "en"
              ? "Telora grants the Client a non-exclusive, personal, and non-transferable license to use the Telora cloud application for serialized inventory management, IMEI tracking, store transfers, repairs and invoicing."
              : "Telora concède au Client un droit d'accès et d'utilisation non exclusif, personnel et non transmissible de la plateforme en mode SaaS (Software as a Service) pour la gestion de son stock unitaire, le suivi IMEI, les transferts inter-boutiques, le SAV et la facturation."}
          </p>
          <p>
            {lang === "en"
              ? "Telora operates exclusively as a software provider. Telora is not an intermediary, broker, wholesaler, or participant in the commercial trade of physical mobile devices."
              : "Telora intervient à titre exclusif de fournisseur de moyens logiciels. Telora n'est ni grossiste, ni détaillant, ni courtier, et n'intervient à aucun titre dans les transactions commerciales physiques conclues par le Client."}
          </p>
        </div>
      </section>

      {/* Article 2 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en"
            ? "Article 2 — Account Hierarchy & Security Responsibilities"
            : "Article 2 — Hiérarchie des Comptes et Responsabilité de Sécurité"}
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            {lang === "en"
              ? "The Owner Account controls store setup and user delegation (cashiers, sales clerks, secretaries). The Client is strictly liable for the confidentiality of access credentials and all operational actions performed by assigned staff."
              : "Le compte Propriétaire administre les points de vente et les délégations accordées à son équipe (vendeuses, secrétaires). Le Client répond pleinement de la préservation de ses mots de passe et de tous les actes accomplis par ses collaborateurs rattachés."}
          </p>
          <p>
            {lang === "en"
              ? "Two-Factor Authentication (2FA TOTP) and single-use recovery codes are provided. The Publisher strongly advises enabling 2FA for all high-privilege access."
              : "Un système de double authentification (2FA TOTP conforme RFC 6238) et des codes de secours à usage unique chiffrés sont mis à disposition. L'activation de cette protection est vivement recommandée."}
          </p>
        </div>
      </section>

      {/* Article 3 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en"
            ? "Article 3 — Hardware Compliance & IMEI Anti-Fencing Warranty"
            : "Article 3 — Conformité Matérielle et Garantie Anti-Recel IMEI"}
        </h2>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2 text-sm leading-relaxed">
          <p className="font-semibold text-foreground">
            {lang === "en"
              ? "Mandatory Legal Undertaking:"
              : "Engagement légal impératif du commerçant :"}
          </p>
          <p className="text-muted-foreground">
            {lang === "en"
              ? "The Client solemnly commits under penalty of law to register only legitimately acquired hardware and never to use the software to track or conceal stolen, counterfeit, or smuggled items. Software Luhn checks and TAC lookups are algorithmic utilities only and do not constitute an official title or customs clearance."
              : "Le Client s'engage formellement et sous sa responsabilité pénale exclusive à n'enregistrer que des appareils acquis licitement et à ne jamais employer la plateforme pour dissimuler des équipements issus de vol, braquage ou contrebande. La vérification technique (clé de Luhn et table TAC) ne vaut en aucun cas certificat de dédouanement ou titre de propriété."}
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "en"
              ? "The Client indemnifies and holds Telora harmless against any legal requisition, criminal seizure, or regulatory investigation concerning the registered handsets."
              : "Le Client garantit Telora contre toute action, réquisition judiciaire, saisie ou mise en cause relative à l'origine illicite des téléphones saisis sur son compte."}
          </p>
        </div>
      </section>

      {/* Article 4 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en"
            ? "Article 4 — Subscription Plans, Mobile Payments & Suspension"
            : "Article 4 — Modalités d'Abonnement, Paiements et Suspension"}
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            {lang === "en"
              ? "New accounts start with a no-commitment free trial period (14 to 30 days). Subsequent access requires an active plan paid via Mobile Money (Orange Money, MTN MoMo) or accepted debit/credit cards."
              : "Tout nouveau compte bénéficie d'une période d'essai gratuit sans engagement (14 à 30 jours). L'accès ultérieur requiert un abonnement valide réglé par Mobile Money (MTN MoMo, Orange Money) ou carte bancaire."}
          </p>
          <p>
            {lang === "en"
              ? "In the event of an expired or overdue subscription, write permissions are locked (HTTP 402 Payment Required). Data is preserved intact during a 60-day grace period to enable account renewal or data export."
              : "En cas d'échéance non réglée, les droits d'écriture et de vente sont temporairement suspendus (erreur 402). L'intégrité des données est intégralement conservée pendant une période de grâce de 60 jours pour permettre la régularisation ou l'exportation."}
          </p>
        </div>
      </section>

      {/* Article 5 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en"
            ? "Article 5 — Data Isolation & Intellectual Property"
            : "Article 5 — Cloisonnement et Propriété Intellectuelle"}
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            {lang === "en"
              ? "Telora retains all proprietary rights over the source code, branding, and algorithms. The Client remains the sole owner of all uploaded commercial data, customer records, supplier pricing, and sales history."
              : "Telora conserve la propriété exclusive du code source, de la marque et de l'architecture logicielle. Le Client demeure le propriétaire exclusif de ses données de stock, marges d'achat, fichiers clients et factures."}
          </p>
          <p>
            {lang === "en"
              ? "Data isolation is enforced programmatically. Platform administrators have zero access to client inventory catalogs or operational transactions."
              : "Le cloisonnement multi-tenant est garanti au niveau architectural. Les administrateurs de la plateforme n'ont aucun accès opérationnel de consultation sur le stock d'un commerçant."}
          </p>
        </div>
      </section>

      {/* Article 6 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en"
            ? "Article 6 — Service Availability (SLA) & Backups"
            : "Article 6 — Disponibilité du Service et Sauvegardes"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "Telora uses best commercially reasonable efforts to ensure 99.5% service availability 24/7, excluding planned maintenance windows. Daily automated backups are performed to safeguard platform resilience."
            : "Telora met en œuvre des moyens raisonnables pour viser une disponibilité de 99,5 % 24h/24 et 7j/7, hors fenêtres de maintenance programmée. Des sauvegardes automatisées quotidiennes sont opérées pour garantir la résilience du service."}
        </p>
      </section>

      {/* Article 7 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en"
            ? "Article 7 — Data Portability & Account Termination"
            : "Article 7 — Réversibilité et Résiliation"}
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            {lang === "en"
              ? "The Client may cancel the subscription at any time without penalty before the next renewal cycle. Full data export (CSV/JSON) remains accessible during the active period and the 30-day post-termination window."
              : "Le Client peut résilier son abonnement à tout moment sans pénalité avant l'échéance suivante. L'exportation complète de ses données (inventaire, mouvements, factures au format CSV/JSON) est garantie pendant la durée d'adhésion et pendant 30 jours après résiliation."}
          </p>
        </div>
      </section>

      {/* Article 8 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en"
            ? "Article 8 — Applicable Law & Jurisdiction"
            : "Article 8 — Droit Applicable et Juridiction Compétente"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "These terms are governed by the OHADA Uniform Acts on General Commercial Law and local cybersecurity legislation. Any unresolved dispute following a 30-day friendly settlement attempt will fall under the exclusive jurisdiction of the competent courts of the Publisher's registered office."
            : "Les présentes conditions sont soumises aux dispositions de l'Acte Uniforme OHADA relatif au droit commercial général et à la législation sur la cybersécurité. En cas de différend non résolu amiablement sous 30 jours, compétence exclusive est attribuée aux juridictions du siège social de l'Éditeur."}
        </p>
      </section>

      {/* Carte d'assistance */}
      {/* <div className="rounded-xl border bg-muted/30 p-4 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">
            {lang === "en" ? "Legal & Compliance Inquiry" : "Service Juridique & Conformité"}
          </p>
          <p className="text-muted-foreground text-xs mt-0.5">
            {lang === "en" ? "For specific corporate agreements or data inquiries:" : "Pour tout accord d'entreprise spécifique ou question contractuelle :"}
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-background border text-primary font-medium shrink-0">
          legal@telora.app
        </span>
      </div> */}
    </article>
  );
}
