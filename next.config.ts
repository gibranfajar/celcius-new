import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output: bundles only the files needed to run `node server.js`
  // (no full node_modules) so the Docker runtime image stays small.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "clcs.queensland.id" },
      { protocol: "https", hostname: "celcius.crx.my.id" },
      { protocol: "https", hostname: "cms.clcs.co.id" },
    ],
  },
};

export default nextConfig;
