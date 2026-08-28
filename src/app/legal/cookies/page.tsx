"use client";

import { useI18n } from "@/lib/i18n";

export default function PagePolitiqueCookies() {
  const { lang } = useI18n();

  return (
    <article className="max-w-3xl space-y-8 text-foreground">
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {lang === "en" ? "Cookie & Local Storage Policy" : "Politique des Cookies & Stockage Local"}
        </h1>
        <p className="text-xs text-muted-foreground">
          {lang === "en" ? "Last updated: January 2026" : "Dernière mise à jour : Janvier 2026"}
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "1. Principles & Absence of Advertising Trackers" : "1. Absence de Traceurs Publicitaires"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          La plateforme n'emploie aucun cookie publicitaire, aucun traceur d'audience tiers invasif et aucun pixel de reciblage commercial. Seules des données strictement nécessaires au maintien de votre session et à vos préférences de navigation sont enregistrées localement sur votre appareil.
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "2. Technical Data Stored Locally" : "2. Détail des Clés Techniques Utilisées"}
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-foreground">
                <th className="py-2.5 px-3 font-semibold">Clé / Identifiant</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold">Utilité</th>
                <th className="py-2.5 px-3 font-semibold">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y text-muted-foreground">
              <tr>
                <td className="py-2.5 px-3 font-mono font-medium text-foreground">gestion-stock-token</td>
                <td className="py-2.5 px-3">Session</td>
                <td className="py-2.5 px-3">Maintien de la connexion sécurisée (API).</td>
                <td className="py-2.5 px-3">Durée de session</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-medium text-foreground">gestion-stock-boutique</td>
                <td className="py-2.5 px-3">Préférence</td>
                <td className="py-2.5 px-3">Mémorise la boutique actuellement active.</td>
                <td className="py-2.5 px-3">Persistant</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-medium text-foreground">gestion-stock-devise-affichage</td>
                <td className="py-2.5 px-3">Préférence</td>
                <td className="py-2.5 px-3">Mémorise la devise sélectionnée par l'utilisateur.</td>
                <td className="py-2.5 px-3">Persistant</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-medium text-foreground">gestion-stock-langue</td>
                <td className="py-2.5 px-3">Préférence</td>
                <td className="py-2.5 px-3">Conserve la langue de travail (Français / Anglais).</td>
                <td className="py-2.5 px-3">Persistant</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-mono font-medium text-foreground">theme</td>
                <td className="py-2.5 px-3">Affichage</td>
                <td className="py-2.5 px-3">Conserve le mode d'affichage choisi (sombre ou clair).</td>
                <td className="py-2.5 px-3">Persistant</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "3. Managing and Deleting Local Data" : "3. Suppression et Réinitialisation"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          L'utilisateur peut à tout moment purger ses données de session en cliquant sur « Se déconnecter ». Vous pouvez également effacer les données de site directement depuis les paramètres de votre navigateur web (rubrique Paramètres &gt; Confidentialité &gt; Effacer les données de navigation).
        </p>
      </section>
    </article>
  );
}
