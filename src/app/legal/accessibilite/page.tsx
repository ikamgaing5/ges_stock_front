"use client";

import { useI18n } from "@/lib/i18n";

export default function PageAccessibilite() {
  const { lang } = useI18n();

  return (
    <article className="max-w-3xl space-y-8 text-foreground">
      <header className="space-y-2 border-b pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {lang === "en" ? "Accessibility Statement" : "Déclaration d'Accessibilité"}
        </h1>
        <p className="text-xs text-muted-foreground">
          {lang === "en" ? "Last updated: January 2026" : "Dernière mise à jour : Janvier 2026"}
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "1. General Approach" : "1. Démarche et Conformité"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Nous nous engageons à concevoir une application utilisable par tous les professionnels, y compris les personnes en situation de handicap, en conformité avec les recommandations internationales d'accessibilité numérique (WCAG 2.1 niveau AA).
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "2. Implemented Features" : "2. Dispositions Prises pour l'Accessibilité"}
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p><strong className="text-foreground">Mode sombre et contrastes :</strong> Prise en charge native d'un mode sombre contrasté pour réduire la fatigue oculaire lors des inventaires prolongés ou en faible éclairage.</p>
          <p><strong className="text-foreground">Retour sonore au scan :</strong> Émission d'un signal audio distinct lors de la lecture d'un code-barres ou IMEI pour valider la prise en compte sans obliger à regarder l'écran.</p>
          <p><strong className="text-foreground">Navigation au clavier :</strong> Possibilité d'accéder à l'ensemble des champs de formulaire et tableaux sans souris, via les touches Tabulation et Entrée.</p>
          <p><strong className="text-foreground">Lecteurs d'écran :</strong> Présence de libellés descriptifs masqués et d'attributs ARIA sur les boutons d'action et éléments interactifs.</p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {lang === "en" ? "3. Feedback & Contact" : "3. Signalement et Assistance"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Si vous constatez un défaut d'accessibilité ou une difficulté d'utilisation sur un équipement spécifique, nous vous invitons à nous le signaler pour prise en charge :
        </p>
        <div className="rounded-lg border bg-muted/30 p-4 text-xs sm:text-sm">
          <p><span className="font-semibold text-foreground">Contact accessibilité :</span> support@gestionstock.local</p>
        </div>
      </section>
    </article>
  );
}
