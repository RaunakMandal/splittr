import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  experimental: {
    // File uploads pass through proxy/middleware; keep headroom above 10 MB receipts.
    proxyClientMaxBodySize: "12mb",
  },
};

export default nextConfig;
