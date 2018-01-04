/* eslint-env node */

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended'
 ],
  env: {
    'browser': false,
    'node': true,
    'es6': true
  },
  globals: {
    'it': '1',
    'describe': '1'
  },
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
    'space-before-function-paren': ['error', { 'anonymous': 'never', 'named': 'never' }],
    'indent': ['error', 2, {
      'VariableDeclarator': {
        'var': 2,
        'let': 2,
        'const': 3
      },
      'SwitchCase': 1,
      'MemberExpression': 'off'
    }],
    'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
    'max-statements-per-line': [2, { 'max': 2 }],
    'operator-linebreak': ['error', 'after'],
    'new-cap': ['error', {
      'capIsNewExceptions': [
        'Ember$',
        'A',
        'EmberObject',
        'Event',
        'Velocity',
        'Logger',
        'EmberSet',
        'Stripe'
      ],
      'newIsCapExceptions': ['defer']
    }],
    'camelcase': 'error',
    'no-eval': 'error',
    'one-var': 'off'
  }
};
