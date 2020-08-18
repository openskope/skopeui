module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: [
    'plugin:vue/recommended',
    'plugin:prettier/recommended',
    'prettier',
    'prettier/vue',
  ],
  plugins: ['vue', 'prettier'],
  // add custom rules here
  rules: {
    'no-console': 'off',
    semi: [2, 'never'],
    'vue/max-attributes-per-line': 'off',
    'prettier/prettier': ['error', { semi: false }],
    'no-template-curly-in-string': 'off',
  },
}
