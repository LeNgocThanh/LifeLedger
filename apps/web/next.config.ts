import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@qlts/domain", "@qlts/validation"],
};

export default nextConfig;
