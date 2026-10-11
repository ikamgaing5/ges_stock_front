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
  estMaximise?: () => Promise<boolean>;
  surChangementMaximise?: (callback: (estMax: boolean) => void) => () => void;
  estPleinEcran?: () => Promise<boolean>;
  surChangementPleinEcran?: (callback: (estPlein: boolean) => void) => () => void;

  getServerUrl: () => Promise<string>;
  setServerUrl: (url: string) => Promise<boolean>;
  recharger: () => void;
  viderCache: () => Promise<boolean>;
  ouvrirLienExterne: (url: string) => Promise<boolean>;

  ouvrirAPropos?: () => void;
  fermerAPropos?: () => void;
  getMachineInfo?: () => Promise<{
    appVersion: string;
    appName: string;
    electronVersion: string;
    chromeVersion: string;
    nodeVersion: string;
    platform: string;
    osType: string;
    osRelease: string;
    osArch: string;
    hostname: string;
    userInfo: string;
    serverUrl: string;
  }>;
  getMacAddress?: () => Promise<string | null>;
  ouvrirLienLegal?: (route: string) => Promise<boolean>;
}

declare global {
  interface Window {
    teloraDesktop?: TeloraDesktopApi;
  }
}
