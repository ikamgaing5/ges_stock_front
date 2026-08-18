import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      /*
       * Ce projet charge ses données avec le trio classique
       * useState + useEffect + fetch, qui est le plus documenté et le plus
       * simple à reprendre. Cette règle, très stricte, signale ce motif
       * parce qu'elle préfère une bibliothèque de récupération de données
       * (SWR, React Query). On la garde en avertissement plutôt qu'en
       * erreur : elle reste visible sans bloquer le développement.
       */
      "react-hooks/set-state-in-effect": "warn",

      // Autorise les paramètres inutilisés dont le nom commence par « _ »,
      // pratique pour respecter une signature sans utiliser l'argument.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]);

export default eslintConfig;
