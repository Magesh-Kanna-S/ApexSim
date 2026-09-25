import type { NextConfig } from "next";

/**
 * ApexStrategy Enterprise — Next.js config
 *
 * Ships as a fully static site (`output: "export"`), perfect for
 * GitHub Pages, Netlify, Vercel (static), or any static host.
 *
 * NEXT_PUBLIC_BASE_PATH:
 *   Set automatically by the GitHub Actions workflow to "/<repo-name>"
 *   when deploying to GitHub Pages (https://<user>.github.io/<repo>).
 *   Leave empty for local dev, custom domains, or Vercel/Netlify.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  images: {
    // Required for static export (no server-side image optimization)
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
