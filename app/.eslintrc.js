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
    ecmaVersion: 2017,
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    'no-async-promise-executor': ['off'],
    'require-await': ['off'],
  },
}
