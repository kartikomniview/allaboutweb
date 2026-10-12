import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://aawsite.s3.ap-south-1.amazonaws.com/**")],
  },
  redirects() {
    return [
      // The catalog's "Saved" tab became the cart.
      { source: "/app/catalog/furniture/saved", destination: "/app/catalog/furniture/cart", permanent: true },
    ];
  },
};

export default nextConfig;
