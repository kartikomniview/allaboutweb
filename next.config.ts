import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://aawsite.s3.ap-south-1.amazonaws.com/**")],
  },
};

export default nextConfig;
