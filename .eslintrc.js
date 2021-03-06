module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: { ecmaVersion: 12 },
  rules: {
    'arrow-body-style': 'off',
    'object-curly-newline': [
      'error',
      { multiline: true },
    ],
  },
};
