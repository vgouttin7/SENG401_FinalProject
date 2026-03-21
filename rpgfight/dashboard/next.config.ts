import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/dashboard",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/dashboard",
  },
};

export default nextConfig;
