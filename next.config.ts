import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  turbopack: {
    // Avoid root inference when parent directories contain lockfiles.
    root: process.cwd(),
  },
};

export default withNextIntl(nextConfig);
