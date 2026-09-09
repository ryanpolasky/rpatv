import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      new URL("https://cdn.akamai.steamstatic.com/steam/apps/**"),
    ],
  },
};

export default nextConfig;
