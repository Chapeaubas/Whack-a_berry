const nextConfig = {
  transpilePackages: [
    "@abstract-foundation/agw-react",
    "@abstract-foundation/agw-client"
  ],
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
