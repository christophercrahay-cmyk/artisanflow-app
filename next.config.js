/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/devis',
        destination: '/fonctionnalites',
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Exclure les fichiers React Native du build Next.js
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    };
    return config;
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;

