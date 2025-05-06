module.exports = {
    env: {
      browser: false,
      es6: true,
      node: true,
    },
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: 'tsconfig.eslint.json',
      sourceType: 'module',
    },
    plugins: [
      '@typescript-eslint',
      'import',
      'prefer-arrow',
      'prettier',
    ],
    root: true,
    rules: {
      // Prettier integration
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          semi: true,
          printWidth: 100,
          tabWidth: 2,
          trailingComma: 'all',
          endOfLine: 'auto',
        },
      ],
  
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'no-console': 'warn',
      'no-debugger': 'warn',
      'max-len': [
        'warn',
        {
          code: 120,
          ignoreUrls: true,
          ignoreComments: true,
          ignoreTrailingComments: true,
        },
      ],
    },
  };
  