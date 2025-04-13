import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";


export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: {
        ...globals.browser,  //includes global objects like window, document...
        ...globals.node,    
      },
    },
  },

  //fixes for test files 
  {
    files: ["**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.jest, //allows adds, describe, it from the test files 
      },
    },
  },
  pluginReact.configs.flat.recommended,
]);