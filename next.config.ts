import type { NextConfig } from 'next';

const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'cdr-vs-esaf';

const nextConfig: NextConfig = {
  output: 'export',
  outputFileTracingRoot: process.cwd(),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: isGithubPages ? `/${repoName}` : undefined,
  assetPrefix: isGithubPages ? `/${repoName}/` : undefined,
};

export default nextConfig;
