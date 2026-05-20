const globals = require("globals");
const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2021,
      sourceType: "commonjs"
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
];
