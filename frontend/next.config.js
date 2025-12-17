/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://backend:5281/api/:path*", // docker service name
      },
    ];
  },
};

module.exports = nextConfig;