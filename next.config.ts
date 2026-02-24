import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['playwright', '@axe-core/playwright', 'cheerio', 'p-limit'],
  outputFileTracingRoot: '/Users/armenaslikyan/Projects/Personal/vivatech-audit-poc',
};

export default nextConfig;
