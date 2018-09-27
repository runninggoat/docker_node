module.exports = {
    "root": true,
    "env": {
        "node": true,
        "commonjs": true,
        "es6": true,
        "jquery": false,
        "jest": true,
        "jasmine": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
      'comma-dangle': ["error", {
        "arrays": "ignore",
        "objects": "ignore",
        "imports": "ignore",
        "exports": "ignore",
        "functions": "ignore",
      }],
    }
};