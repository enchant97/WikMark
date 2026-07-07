import type { NextConfig } from "next";
import "@/env"; // causes validation at build-time

const nextConfig: NextConfig = {
  transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true, // prevents OOM errors on build
  },
  productionBrowserSourceMaps: false, // prevents OOM errors on build
  experimental: {
    serverSourceMaps: false, // prevents OOM errors on build
  },
  outputFileTracingExcludes: {
    // prevents OOM errors on build
    "*": [
      "**/node_modules/@mui/icons-material/**",
    ],
  },
  enablePrerenderSourceMaps: false, // prevents OOM errors on build
};

export default nextConfig;
