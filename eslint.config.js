import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import jsxInlineSpace from "./eslint-rules/jsx-inline-space.js";

export default tseslint.config(
  { ignores: ["build", ".claude", ".react-router", "worker-configuration.d.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["mockups/**/*.js"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.{ts,tsx}"], languageOptions: { globals: { ...globals.browser, ...globals.node } }, plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh }, rules: { ...reactHooks.configs.recommended.rules, "react-refresh/only-export-components": "off" } },
  { files: ["**/*.tsx"], plugins: { local: { rules: { "jsx-inline-space": jsxInlineSpace } } }, rules: { "local/jsx-inline-space": "error" } },
);
