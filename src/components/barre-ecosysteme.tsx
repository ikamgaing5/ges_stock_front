"use client";

import React from "react";

/**
 * Barre de l'écosystème matériel et logiciel compatible Telora
 * Style Photo 1 (style sobre, plat et épuré inspiré de la référence NordVPN, sans cartes blanches)
 * Adapté à l'écosystème complet de Telora :
 * 1. Windows POS
 * 2. macOS
 * 3. Linux
 * 4. Android & iOS
 * 5. Navigateurs Web
 * 6. ESC/POS 80mm
 * 7. Douchette USB
 */

export function IconeWindows({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      fill="currentColor"
      className="bi bi-microsoft"
      viewBox="0 0 16 16"
    >
      <path d="M7.462 0H0v7.19h7.462zM16 0H8.538v7.19H16zM7.462 8.211H0V16h7.462zm8.538 0H8.538V16H16z" />
    </svg>
  );
}

export function IconeMacOS({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        className="fill-slate-900 dark:fill-slate-100"
      />
      <text
        x="12"
        y="10.4"
        textAnchor="middle"
        fontSize="6.2"
        fontWeight="700"
        className="fill-white dark:fill-slate-950"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        mac
      </text>
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fontSize="6.2"
        fontWeight="700"
        className="fill-white dark:fill-slate-950"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        OS
      </text>
    </svg>
  );
}

export function IconeLinux({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      fill="currentColor"
      className="bi bi-tux"
      viewBox="0 0 16 16"
    >
      <path d="M8.996 4.497c.104-.076.1-.168.186-.158s.022.102-.098.207c-.12.104-.308.243-.46.323-.291.152-.631.336-.993.336s-.647-.167-.853-.33c-.102-.082-.186-.162-.248-.221-.11-.086-.096-.207-.052-.204.075.01.087.109.134.153.064.06.144.137.241.214.195.154.454.304.778.304s.702-.19.932-.32c.13-.073.297-.204.433-.304M7.34 3.781c.055-.02.123-.031.174-.003.011.006.024.021.02.034-.012.038-.074.032-.11.05-.032.017-.057.052-.093.054-.034 0-.086-.012-.09-.046-.007-.044.058-.072.1-.089m.581-.003c.05-.028.119-.018.173.003.041.017.106.045.1.09-.004.033-.057.046-.09.045-.036-.002-.062-.037-.093-.053-.036-.019-.098-.013-.11-.051-.004-.013.008-.028.02-.034" />
      <path
        fill-rule="evenodd"
        d="M8.446.019c2.521.003 2.38 2.66 2.364 4.093-.01.939.509 1.574 1.04 2.244.474.56 1.095 1.38 1.45 2.32.29.765.402 1.613.115 2.465a.8.8 0 0 1 .254.152l.001.002c.207.175.271.447.329.698.058.252.112.488.224.615.344.382.494.667.48.922-.015.254-.203.43-.435.57-.465.28-1.164.491-1.586 1.002-.443.527-.99.83-1.505.871a1.25 1.25 0 0 1-1.256-.716v-.001a1 1 0 0 1-.078-.21c-.67.038-1.252-.165-1.718-.128-.687.038-1.116.204-1.506.206-.151.331-.445.547-.808.63-.5.114-1.126 0-1.743-.324-.577-.306-1.31-.278-1.85-.39-.27-.057-.51-.157-.626-.384-.116-.226-.095-.538.07-.988.051-.16.012-.398-.026-.648a2.5 2.5 0 0 1-.037-.369c0-.133.022-.265.087-.386v-.002c.14-.266.368-.377.577-.451s.397-.125.53-.258c.143-.15.27-.374.443-.56q.036-.037.073-.07c-.081-.538.007-1.105.192-1.662.393-1.18 1.223-2.314 1.811-3.014.502-.713.65-1.287.701-2.016.042-.997-.705-3.974 2.112-4.2q.168-.015.321-.013m2.596 10.866-.03.016c-.223.121-.348.337-.427.656-.08.32-.107.733-.13 1.206v.001c-.023.37-.192.824-.31 1.267s-.176.862-.036 1.128v.002c.226.452.608.636 1.051.601s.947-.304 1.36-.795c.474-.576 1.218-.796 1.638-1.05.21-.126.324-.242.333-.4.009-.157-.097-.403-.425-.767-.17-.192-.217-.462-.274-.71-.056-.247-.122-.468-.26-.585l-.001-.001c-.18-.157-.356-.17-.565-.164q-.069.001-.14.005c-.239.275-.805.612-1.197.508-.359-.09-.562-.508-.587-.918m-7.204.03H3.83c-.189.002-.314.09-.44.225-.149.158-.276.382-.445.56v.002h-.002c-.183.184-.414.239-.61.31-.195.069-.353.143-.46.35v.002c-.085.155-.066.378-.029.624.038.245.096.507.018.746v.002l-.001.002c-.157.427-.155.678-.082.822.074.143.235.22.48.272.493.103 1.26.069 1.906.41.583.305 1.168.404 1.598.305.431-.098.712-.369.75-.867v-.002c.029-.292-.195-.673-.485-1.052-.29-.38-.633-.752-.795-1.09v-.002l-.61-1.11c-.21-.286-.43-.462-.68-.5a1 1 0 0 0-.106-.008M9.584 4.85c-.14.2-.386.37-.695.467-.147.048-.302.17-.495.28a1.3 1.3 0 0 1-.74.19.97.97 0 0 1-.582-.227c-.14-.113-.25-.237-.394-.322a3 3 0 0 1-.192-.126c-.063 1.179-.85 2.658-1.226 3.511a5.4 5.4 0 0 0-.43 1.917c-.68-.906-.184-2.066.081-2.568.297-.55.343-.701.27-.649-.266.436-.685 1.13-.848 1.844-.085.372-.1.749.01 1.097.11.349.345.67.766.931.573.351.963.703 1.193 1.015s.302.584.23.777a.4.4 0 0 1-.212.22.7.7 0 0 1-.307.056l.184.235c.094.124.186.249.266.375 1.179.805 2.567.496 3.568-.218.1-.342.197-.664.212-.903.024-.474.05-.896.136-1.245s.244-.634.53-.791a1 1 0 0 1 .138-.061q.005-.045.013-.087c.082-.546.569-.572 1.18-.303.588.266.81.499.71.814h.13c.122-.398-.133-.69-.822-1.025l-.137-.06a2.35 2.35 0 0 0-.012-1.113c-.188-.79-.704-1.49-1.098-1.838-.072-.003-.065.06.081.203.363.333 1.156 1.532.727 2.644a1.2 1.2 0 0 0-.342-.043c-.164-.907-.543-1.66-.735-2.014-.359-.668-.918-2.036-1.158-2.983M7.72 3.503a1 1 0 0 0-.312.053c-.268.093-.447.286-.559.391-.022.021-.05.04-.119.091s-.172.126-.321.238q-.198.151-.13.38c.046.15.192.325.459.476.166.098.28.23.41.334a1 1 0 0 0 .215.133.9.9 0 0 0 .298.066c.282.017.49-.068.673-.173s.34-.233.518-.29c.365-.115.627-.345.709-.564a.37.37 0 0 0-.01-.309c-.048-.096-.148-.187-.318-.257h-.001c-.354-.151-.507-.162-.705-.29-.321-.207-.587-.28-.807-.279m-.89-1.122h-.025a.4.4 0 0 0-.278.135.76.76 0 0 0-.191.334 1.2 1.2 0 0 0-.051.445v.001c.01.162.041.299.102.436.05.116.109.204.183.274l.089-.065.117-.09-.023-.018a.4.4 0 0 1-.11-.161.7.7 0 0 1-.054-.22v-.01a.7.7 0 0 1 .014-.234.4.4 0 0 1 .08-.179q.056-.069.126-.073h.013a.18.18 0 0 1 .123.05c.045.04.08.09.11.162a.7.7 0 0 1 .054.22v.01a.7.7 0 0 1-.002.17 1.1 1.1 0 0 1 .317-.143 1.3 1.3 0 0 0 .002-.194V3.23a1.2 1.2 0 0 0-.102-.437.8.8 0 0 0-.227-.31.4.4 0 0 0-.268-.102m1.95-.155a.63.63 0 0 0-.394.14.9.9 0 0 0-.287.376 1.2 1.2 0 0 0-.1.51v.015q0 .079.01.152c.114.027.278.074.406.138a1 1 0 0 1-.011-.172.8.8 0 0 1 .058-.278.5.5 0 0 1 .139-.2.26.26 0 0 1 .182-.069.26.26 0 0 1 .178.081c.055.054.094.12.124.21.029.086.042.17.04.27l-.002.012a.8.8 0 0 1-.057.277c-.024.059-.089.106-.122.145.046.016.09.03.146.052a5 5 0 0 1 .248.102 1.2 1.2 0 0 0 .244-.763 1.2 1.2 0 0 0-.11-.495.9.9 0 0 0-.294-.37.64.64 0 0 0-.39-.133z"
      />
    </svg>
  );
}

export function IconeAndroid({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.0805 12 8.0805c-1.8533 0-3.5902.3311-5.1367.8692L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
    </svg>
  );
}

export function IconeApple({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 3.5c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.36-.58.67-.99 1.74-.86 2.76 1.01.08 2.05-.56 2.57-1.27z" />
    </svg>
  );
}

export function IconeChromeWeb({
  className = "size-7",
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      fill="currentColor"
      className="bi bi-browser-chrome"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M16 8a8 8 0 0 1-7.022 7.94l1.902-7.098a3 3 0 0 0 .05-1.492A3 3 0 0 0 10.237 6h5.511A8 8 0 0 1 16 8M0 8a8 8 0 0 0 7.927 8l1.426-5.321a3 3 0 0 1-.723.255 3 3 0 0 1-1.743-.147 3 3 0 0 1-1.043-.7L.633 4.876A8 8 0 0 0 0 8m5.004-.167L1.108 3.936A8.003 8.003 0 0 1 15.418 5H8.066a3 3 0 0 0-1.252.243 2.99 2.99 0 0 0-1.81 2.59M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
      />
    </svg>
  );
}

export function IconeImprimante({
  className = "size-7",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm2-7.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM18 7V3H6v4h12z" />
    </svg>
  );
}

export function IconeDouchette({
  className = "size-7",
}: {
  className?: string;
}) {
  return (
    // <svg
    //   className={className}
    //   viewBox="0 0 24 24"
    //   fill="none"
    //   stroke="currentColor"
    //   strokeWidth="2"
    //   strokeLinecap="round"
    //   strokeLinejoin="round"
    //   aria-hidden="true"
    // >
    //   {/* Coins viseur de lecture */}
    //   <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    //   <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    //   <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    //   <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    //   {/* Faisceau laser rouge typique des douchettes */}
    //   <line x1="4" y1="12" x2="20" y2="12" className="stroke-red-500" strokeWidth="2.5" />
    //   {/* Barres verticales du code */}
    //   <line x1="7" y1="7.5" x2="7" y2="16.5" strokeWidth="1.8" />
    //   <line x1="10" y1="7.5" x2="10" y2="16.5" strokeWidth="2.4" />
    //   <line x1="14" y1="7.5" x2="14" y2="16.5" strokeWidth="1.4" />
    //   <line x1="17" y1="7.5" x2="17" y2="16.5" strokeWidth="2.2" />
    // </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      fill="currentColor"
      className="bi bi-upc-scan"
      viewBox="0 0 16 16"
    >
      <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5M.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5M3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0z" />
    </svg>
  );
}

interface ItemEcosysteme {
  id: string;
  nom: string;
  tooltip: string;
  composant: React.ReactNode;
}

const ITEMS_ECOSYSTEME: ItemEcosysteme[] = [
  {
    id: "windows",
    nom: "Windows POS",
    tooltip: "Compatible Windows 10, Windows 11 et caisses tactiles POSReady",
    composant: <IconeWindows className="size-6 sm:size-7" />,
  },
  {
    id: "macos",
    nom: "macOS",
    tooltip:
      "macOS Monterey, Ventura, Sonoma et Sequoia (Intel & Apple Silicon)",
    composant: <IconeMacOS className="size-6 sm:size-7" />,
  },
  {
    id: "linux",
    nom: "Linux",
    tooltip: "Postes reconditionnés Ubuntu, Debian, Mint et Raspberry Pi OS",
    composant: <IconeLinux className="size-6 sm:size-7" />,
  },
  {
    id: "mobile",
    nom: "Android & iOS",
    tooltip:
      "Smartphones et tablettes (navigateur web & scan caméra des cartons)",
    composant: (
      <div className="flex items-center gap-1.5">
        <IconeAndroid className="size-5 sm:size-6" />
        <span className="text-slate-400 dark:text-slate-500 text-xs font-light">
          /
        </span>
        <IconeApple className="size-5 sm:size-6" />
      </div>
    ),
  },
  {
    id: "web",
    nom: "Navigateurs Web",
    tooltip: "Google Chrome, Mozilla Firefox, Microsoft Edge et Safari",
    composant: <IconeChromeWeb className="size-6 sm:size-7" />,
  },
  {
    id: "printer",
    nom: "ESC/POS 80mm",
    tooltip:
      "Imprimantes thermiques de caisse (USB, Réseau Ethernet/Wi-Fi et Bluetooth)",
    composant: <IconeImprimante className="size-6 sm:size-7" />,
  },
  {
    id: "scanner",
    nom: "Douchette USB",
    tooltip:
      "Douchettes code-barres USB et Bluetooth pour scan instantané des IMEI",
    composant: <IconeDouchette className="size-6 sm:size-7" />,
  },
];

export function BarreEcosysteme() {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-10 md:gap-12 lg:gap-16 text-slate-800 dark:text-slate-200">
      {ITEMS_ECOSYSTEME.map((item) => (
        <div
          key={item.id}
          title={item.tooltip}
          className="group flex flex-col items-center gap-2.5 transition-all duration-200 hover:-translate-y-0.5 cursor-default select-none"
        >
          <div className="flex h-8 items-center justify-center text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors duration-200">
            {item.composant}
          </div>
          <span className="text-xs sm:text-[13px] font-medium tracking-tight text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors duration-200">
            {item.nom}
          </span>
        </div>
      ))}
    </div>
  );
}
