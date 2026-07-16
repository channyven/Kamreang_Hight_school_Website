import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Global ignores — files and directories ESLint should skip entirely.
  // Placed first so they apply across all config objects.
  {
    ignores: [
      ".next/",
      "out/",
      "build/",
      "node_modules/",
      "src/dataconnect-generated/",
    ],
  },

  // Next.js recommended rules (core-web-vitals + TypeScript)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Disable ESLint rules that conflict with Prettier formatting
  eslintConfigPrettier,
];

export default eslintConfig;
