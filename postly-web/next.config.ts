import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['node-cron', '@prisma/client'],
};

export default nextConfig;
