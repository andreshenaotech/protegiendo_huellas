import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "irwdfcacgpznmvjofszq.supabase.co",
        pathname: "/storage/v1/object/public/dog-images/**",
      },
    ],
  },
};

export default nextConfig;
