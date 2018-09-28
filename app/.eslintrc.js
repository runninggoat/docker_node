module.exports = {
  // extends: 'airbnb-base',
  root: true,
  env: {
    node: true,
    commonjs: true,
    es6: true,
    jquery: false,
    jest: true,
    jasmine: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'comma-dangle': ['error', 'always'],
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
  },
}
