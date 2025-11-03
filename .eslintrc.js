module.exports = {
  root: true,
  extends: ['./packages/config/eslint-base.js'],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    '.turbo/',
    'coverage/',
    '*.config.js',
    '*.config.ts',
    '*.config.mjs',
    '*.config.mts',
  ],
  // Override for Next.js app
  overrides: [
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      extends: ['./packages/config/eslint-nextjs.js'],
    },
  ],
};
