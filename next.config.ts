import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'CDN-Cache-Control',
                        value: 'public, max-age=1800, stale-while-revalidate=86400', // 1 day; 30 minutes
                    },
                ],
            },
        ]
    }
};

export default nextConfig;
