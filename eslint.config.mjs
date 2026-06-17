import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      'eslint.config.mjs',
      'next-env.d.ts',
      '.eslintrc.js',
      'build/*',
      'dist/*',
      'public/*',
      '**/out/*',
      '**/.next/*',
      '**/node_modules/*',
      '**/reportWebVitals.*',
      '**/service-worker.*',
      '**/serviceWorkerRegistration.*',
      '**/setupTests.*',
      '**/.eslintrc.*',
      '**/.prettier.*',
      '**/prettier.config.*',
      '**/next.config.*',
      '**/vite.config.*',
      '**/postcss.config.*',
      '**/tailwind.config.*',
      '**/craco.config.*',
      '**/jsconfig.json',
      '**/api/*',
      '**/auth/*',
      '**/session/*',
    ],
  },
  ...compat.extends('airbnb', 'airbnb-typescript', 'airbnb/hooks', 'prettier'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      perfectionist,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // general
      'import/no-cycle': 'off',
      'no-alert': 0,
      'react/prop-types': 'off',
      camelcase: 0,
      'no-console': 0,
      'no-unused-vars': 0,
      'no-nested-ternary': 0,
      'no-param-reassign': 0,
      'no-underscore-dangle': 0,
      'no-restricted-exports': 0,
      'no-promise-executor-return': 0,
      'import/prefer-default-export': 0,
      'prefer-destructuring': [1, { object: true, array: false }],
      'func-names': 0,
      'no-constant-condition': 0,
      'react/no-danger': 0,

      // typescript
      '@typescript-eslint/naming-convention': 0,
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/consistent-type-exports': 1,
      '@typescript-eslint/consistent-type-imports': 0,
      '@typescript-eslint/no-unused-vars': 0,

      // react
      'react/no-children-prop': 0,
      'react/react-in-jsx-scope': 0,
      'react/no-array-index-key': 0,
      'react/require-default-props': 0,
      'react/jsx-props-no-spreading': 0,
      'react/function-component-definition': 0,
      'react/jsx-no-useless-fragment': [1, { allowExpressions: true }],
      'react/no-unstable-nested-components': [1, { allowAsProps: true }],
      'react/jsx-no-duplicate-props': [1, { ignoreCase: false }],

      // jsx-a11y
      'jsx-a11y/anchor-is-valid': 0,
      'jsx-a11y/control-has-associated-label': 0,

      // unused imports
      'unused-imports/no-unused-imports': 1,
      'unused-imports/no-unused-vars': [
        0,
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // perfectionist
      'perfectionist/sort-exports': [1, { type: 'line-length', order: 'asc' }],
      'perfectionist/sort-named-imports': [1, { type: 'line-length', order: 'asc' }],
      'perfectionist/sort-named-exports': [1, { type: 'line-length', order: 'asc' }],
      'perfectionist/sort-imports': [
        1,
        {
          type: 'line-length',
          order: 'asc',
          groups: [
            'style',
            'type',
            ['builtin', 'external'],
            { type: 'custom', pattern: '@mui/**', group: 'custom-mui' },
            { type: 'custom', pattern: 'src/auth/**', group: 'custom-auth' },
            { type: 'custom', pattern: 'src/hooks/**', group: 'custom-hooks' },
            { type: 'custom', pattern: 'src/utils/**', group: 'custom-utils' },
            { type: 'custom', pattern: 'src/types/**', group: 'custom-types' },
            { type: 'custom', pattern: 'src/routes/**', group: 'custom-routes' },
            { type: 'custom', pattern: 'src/sections/**', group: 'custom-sections' },
            { type: 'custom', pattern: 'src/components/**', group: 'custom-components' },
            { type: 'internal', pattern: 'src/**' },
            ['parent', 'sibling', 'index'],
            ['parent-type', 'sibling-type', 'index-type'],
            'object',
            'unknown',
          ],
          'newlines-between': 'always',
        },
      ],
    },
  },
];
