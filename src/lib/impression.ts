/**
 * Module d'impression pour les factures
 * Permet d'imprimer uniquement la facture (sans l'interface de l'application)
 * et de définir automatiquement le nom de fichier PDF suggéré sous la forme :
 * "[Nom du client] - [JJ-MM-AAAA]"
 */

/**
 * Génère le nom de fichier suggéré pour l'enregistrement en PDF :
 * "[Nom du client] - [JJ-MM-AAAA]"
 */
export function genererNomFichierFacture(
  nomClient?: string | null,
  dateIso?: string | null
): string {
  const dateObj = dateIso ? new Date(dateIso) : new Date();
  const jour = String(dateObj.getDate()).padStart(2, "0");
  const mois = String(dateObj.getMonth() + 1).padStart(2, "0");
  const annee = dateObj.getFullYear();
  const dateStr = `${jour}-${mois}-${annee}`;

  const clientNettoye = (nomClient?.trim() || "Client")
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return `${clientNettoye} - ${dateStr}`;
}

/**
 * Imprime proprement la facture ciblée par son identifiant DOM.
 * Utilise un iframe isolé et injecte toutes les feuilles de style compilées
 * afin d'obtenir un rendu d'impression 100% identique à l'affichage dans la modale.
 */
export function imprimerFacture(
  elementId = "facture-imprimable",
  options?: {
    nomClient?: string | null;
    dateIso?: string | null;
  }
): void {
  if (typeof window === "undefined") return;

  const nomFichier = genererNomFichierFacture(options?.nomClient, options?.dateIso);
  const element = document.getElementById(elementId);

  // Mettre à jour document.title du document principal (utilisé comme fallback)
  const ancienTitre = document.title;
  document.title = nomFichier;

  const restaurerTitre = () => {
    document.title = ancienTitre;
    window.removeEventListener("afterprint", restaurerTitre);
  };
  window.addEventListener("afterprint", restaurerTitre);

  if (!element) {
    window.print();
    return;
  }

  // Nettoyer un ancien iframe résiduel
  const ancienIframe = document.getElementById("facture-iframe-print");
  if (ancienIframe) {
    ancienIframe.remove();
  }

  const iframe = document.createElement("iframe");
  iframe.id = "facture-iframe-print";
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.style.width = "820px";
  iframe.style.height = "1160px";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    return;
  }

  // Définir le titre dans l'iframe (utilisé par le navigateur pour le nom de fichier PDF)
  iframeDoc.title = nomFichier;

  // Cloner la classe html pour hériter des polices et variables
  iframeDoc.documentElement.className = document.documentElement.className;
  iframeDoc.body.className = document.body.className;

  // 1. Extraire et injecter TOUTES les règles CSS compilées déjà en mémoire dans le navigateur
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const sheet = document.styleSheets[i];
      if (sheet.cssRules) {
        const styleTag = iframeDoc.createElement("style");
        let cssText = "";
        for (let j = 0; j < sheet.cssRules.length; j++) {
          cssText += sheet.cssRules[j].cssText + "\n";
        }
        styleTag.textContent = cssText;
        iframeDoc.head.appendChild(styleTag);
      }
    } catch {
      // Ignorer les restrictions CORS de certaines polices externes
    }
  }

  // 2. Copier également les balises style et link existantes de la page principale
  const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
  styleElements.forEach((node) => {
    iframeDoc.head.appendChild(node.cloneNode(true));
  });

  // 3. Ajouter les règles d'ajustement A4 préservant fidèlement la facture de la modale
  const stylePrint = iframeDoc.createElement("style");
  stylePrint.textContent = `
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #111827 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }
    .facture-container {
      width: 100% !important;
      max-width: 100% !important;
      min-height: auto !important;
      margin: 0 auto !important;
      padding: 24px 32px !important;
      box-shadow: none !important;
      border: none !important;
      background: #ffffff !important;
    }
  `;
  iframeDoc.head.appendChild(stylePrint);

  // Injecter le contenu HTML complet de la facture affichée dans la modale
  iframeDoc.body.innerHTML = element.outerHTML;

  // Attendre le chargement des images (logo boutique, etc.)
  const images = Array.from(iframeDoc.images);
  const promesses = images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  });

  Promise.all(promesses).then(() => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error("Erreur lors de l'impression via iframe:", e);
        window.print();
      } finally {
        setTimeout(() => {
          iframe.remove();
        }, 3000);
      }
    }, 250);
  });
}
