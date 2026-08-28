"use client";

import { useI18n } from "@/lib/i18n";

export default function PageMentionsLegales() {
  const { lang } = useI18n();

  return (
    <article className="max-w-3xl space-y-8 text-foreground">
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {lang === "en" ? "Legal Notice" : "Mentions Légales"}
        </h1>
        <p className="text-xs text-muted-foreground">
          {lang === "en" ? "Last updated: January 2026" : "Dernière mise à jour : Janvier 2026"}
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "1. Platform Publisher" : "1. Éditeur de la Plateforme"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "The Telora software application is developed and operated as an inventory and sales tracking solution for telephony and electronics retail professionals."
            : "L'application Telora est développée et exploitée en tant que solution logicielle de gestion d'inventaire et de vente destinée aux professionnels du commerce de téléphones et équipements électroniques."}
        </p>
        <div className="rounded-lg border bg-muted/30 p-4 text-xs sm:text-sm space-y-1.5">
          <p><span className="font-semibold text-foreground">Éditeur :</span> Impact Tech Solutions</p>
          <p><span className="font-semibold text-foreground">Activité :</span> Conception de logiciels et services numériques</p>
          <p><span className="font-semibold text-foreground">Contact :</span> contact@gestionstock.local</p>
          <p><span className="font-semibold text-foreground">Directeur de publication :</span> Responsable des opérations</p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "2. Hosting & Infrastructure" : "2. Hébergement & Infrastructure"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "The platform application services, database engines, and storage systems are deployed on secure, dedicated cloud infrastructure."
            : "Les services applicatifs, bases de données et espaces de stockage sont hébergés sur des serveurs cloud sécurisés et infogérés, répondant aux normes de fiabilité et de haute disponibilité."}
        </p>
        <div className="rounded-lg border bg-muted/30 p-4 text-xs sm:text-sm space-y-1.5">
          <p><span className="font-semibold text-foreground">Type d'infrastructure :</span> Serveurs d'applications et bases de données isolées</p>
          <p><span className="font-semibold text-foreground">Sécurité réseau :</span> Chiffrement des flux HTTPS (TLS 1.3), pare-feu applicatif</p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "3. Intellectual Property" : "3. Propriété Intellectuelle"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "All components of the application, including source code, graphic assets, database structure, and documentation, are the intellectual property of the publisher. Any unauthorized copy or reproduction is prohibited."
            : "L'ensemble des éléments constitutifs de l'application (code source, structure de base de données, chartes graphiques, base technique de reconnaissance TAC/IMEI et interfaces utilisateur) demeure la propriété exclusive de l'éditeur. Toute reproduction ou décompilation sans autorisation écrite préalable est interdite."}
        </p>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "4. Ownership of Business Data" : "4. Propriété des Données Métier"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {lang === "en"
            ? "Users retain complete and exclusive ownership of all inventory records, serial numbers/IMEIs, transactions, pricing, and point-of-sale data entered into their account. The publisher does not sell, rent, or transfer customer business data under any circumstances."
            : "Chaque utilisateur demeure l'unique propriétaire de l'ensemble des données qu'il enregistre dans son espace (stocks, numéros IMEI, prix d'achat, prix de vente, mouvements et historique de ventes). L'éditeur s'interdit expressément de vendre, exploiter ou céder les données commerciales de ses clients."}
        </p>
      </section>
    </article>
  );
}
