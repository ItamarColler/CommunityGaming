module.exports = {
  extends: ['./eslint-base.js', 'next/core-web-vitals'],
  rules: {
    'react/no-unescaped-entities': 'off',
    // Disable pages directory check since we use App Router
    '@next/next/no-html-link-for-pages': 'off',
  },
};
