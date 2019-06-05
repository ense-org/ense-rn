module.exports = {
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": [
    "airbnb"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly",
    "__DEV__": "readonly"
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module",
    "babelOptions": {
      "configFile": "babel.config.js"
    },
  },
  "plugins": [
  ],
  "rules": {
    "global-require": 0,
    "spaced-comment": 0,
    "no-use-before-define": 0,
    "no-underscore-dangle": 0,
    "no-else-return": 0,
    "no-unused-vars": 1,
    "no-console": 0,
    "no-param-reassign": 1,
    "object-curly-newline": 0,
    "arrow-body-style": 1,
    "arrow-parens": 0,
    "space-before-function-paren": 0,
    "quotes": 1,
    "comma-dangle": 0,
    "padded-blocks": 0,
    "prefer-destructuring": 1,
    "import/prefer-default-export": 0,
    "import/no-extraneous-dependencies": 0,
    "react/sort-comp": 0,
    "react/prefer-stateless-function": 1,
    "react/destructuring-assignment": 0,
    "react/prop-types": 0,
    "react/jsx-filename-extension": 0,
    "react/jsx-indent": 0,
    "react/jsx-boolean-value": 1,
    "react/jsx-one-expression-per-line": 0
  }
};
