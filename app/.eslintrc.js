module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: "babel-eslint",
  },
  extends: ["plugin:vue/recommended", "plugin:prettier/recommended"],
  plugins: ["vue"],
  // add custom rules here
  rules: {
    "no-console": "off",
    semi: ["error", "always"],
    "vue/max-attributes-per-line": "off",
    "prettier/prettier": ["error"],
    "no-template-curly-in-string": "off",
  },
};
