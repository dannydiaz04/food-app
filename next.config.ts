import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverExternalPackages: ['google-spreadsheet']
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
