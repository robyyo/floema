module.exports = {
  root: true,
  extends: 'eslint:standard',
  env: {
    node: true,
    es2020: true,
  },
  rules: {
    semi: ['error', 'always'],
  },
  globals: {
    IS_DEVELOPMENT: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
};
