import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        // Removed unsupported option "serverExternalPackages"
    },
    webpack: (config) => {
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
        }
        return config
    }
};

export default nextConfig;
