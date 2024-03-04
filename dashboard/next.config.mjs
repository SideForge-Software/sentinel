/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Allow all of the image cdn domains, such as cdn.dsicordapp or cdn.sideforge
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**"
            }
        ]
    }
};

export default nextConfig;
