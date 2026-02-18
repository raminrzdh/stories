import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/%D8%B1%D8%B2%D8%B1%D9%88-%D9%87%D8%AA%D9%84/:path*",
        destination: "/hotel-booking/:path*",
      },
    ];
  },
};

export default nextConfig;
