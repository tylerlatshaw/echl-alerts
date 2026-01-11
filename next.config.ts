import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://files.eliteprospects.com/**"),
      new URL("https://flagsapi.com/**"),
      new URL("https://assets.leaguestat.com/**")
    ],
  }
};

export default nextConfig;
