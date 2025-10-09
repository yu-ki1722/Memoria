import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uuzxwyddgwpbywlkmcys.supabase.co",
      },
    ],
  },
};

export default nextConfig;
