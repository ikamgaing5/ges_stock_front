export interface TeloraDesktopApi {
  isDesktop: boolean;
  version: string;
  platform: string;

  listerImprimantes: () => Promise<Array<{ name: string; isDefault: boolean }>>;
  imprimerDirect: (options?: {
    silent?: boolean;
    printBackground?: boolean;
    deviceName?: string;
    copies?: number;
  }) => Promise<{ success: boolean; failureReason?: string }>;

  minimiser: () => void;
  maximiser: () => void;
  fermer: () => void;
  basculerPleinEcran: () => void;

  getServerUrl: () => Promise<string>;
  setServerUrl: (url: string) => Promise<boolean>;
  recharger: () => void;
  viderCache: () => Promise<boolean>;
  ouvrirLienExterne: (url: string) => Promise<boolean>;
}

declare global {
  interface Window {
    teloraDesktop?: TeloraDesktopApi;
  }
}
