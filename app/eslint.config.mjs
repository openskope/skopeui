// ESLint 9 flat config for SkopeUI
// Replaces legacy .eslintrc.js — uses @nuxt/eslint-config for Nuxt-aware Vue/TS linting.
// Prettier formatting is handled separately via `make format` (npx prettier --write).
import { createConfigForNuxt } from "@nuxt/eslint-config/flat";

export default createConfigForNuxt(
  {
    features: {
      stylistic: false,
    },
  },
  {
    rules: {
      "no-console": "off",
      "no-template-curly-in-string": "off",
      "vue/max-attributes-per-line": "off",
      "vue/multi-word-component-names": "off",
      "vue/no-useless-template-attributes": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-dynamic-delete": "off",
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
  {
    // Legacy Vuex store modules use vuex-module-decorators (decorators in .js files)
    // which the TypeScript parser cannot handle. These are being phased out per AGENTS.md.
    ignores: ["store/modules/**/*.js"],
  },
  {
    // Legacy Vuetify config has unused imports that are kept for reference.
    files: ["assets/style/vuetify.js"],
    rules: {
      "no-unused-vars": "off",
    },
  },
);
