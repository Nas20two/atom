/** @type {import('next').NextConfig} */
const nextConfig = {
  // This repo sits inside a larger workspace that contains other lockfiles;
  // pin tracing to the repo root so the build can't pick the wrong one.
  outputFileTracingRoot: import.meta.dirname ?? process.cwd(),
};

export default nextConfig;
