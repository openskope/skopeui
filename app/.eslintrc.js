module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: ['plugin:vue/recommended', 'plugin:prettier/recommended'],
  plugins: ['vue', 'prettier'],
  // add custom rules here
  rules: {
    'no-console': 'off',
    semi: ['error', 'always'],
    'vue/max-attributes-per-line': 'off',
    'prettier/prettier': ['error', { semi: true }],
    'no-template-curly-in-string': 'off',
  },
};
