/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  outputFileTracingExcludes: {
    '*': ['./vis3d-suite/**'],
  },
};

export default nextConfig;
