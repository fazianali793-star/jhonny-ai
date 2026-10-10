import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'backend/**'] },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.ts'],
    rules: {
      // Keep the recommended TypeScript safety rules enabled.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
);
