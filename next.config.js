/** @type {import('next').NextConfig} */
const nextConfig = {
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
    
    // Exclure les modules React Native du build côté serveur
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'react-native': 'commonjs react-native',
        'expo': 'commonjs expo',
      });
    }
    
    // Ignorer les warnings de modules non trouvés pour React Native
    config.ignoreWarnings = [
      { module: /node_modules\/react-native/ },
      { module: /node_modules\/expo/ },
    ];
    
    return config;
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;

