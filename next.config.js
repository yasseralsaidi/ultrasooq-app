const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = withNextIntl({
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "puremoon.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  }
});

module.exports = nextConfig;
