import { NextConfig } from 'next';
import TerserPlugin from 'terser-webpack-plugin';

const nextConfig: NextConfig = {
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  productionBrowserSourceMaps: false, // Desativa source maps em produção
  webpack: (config, { dev, isServer }) => {
    // Desativa source maps em desenvolvimento e produção
    if (!isServer) {
      config.devtool = false;
    }
    
    // Somente aplicar em produção e no cliente
    if (!dev && !isServer) {
      config.optimization.minimize = true;
      
      // Configuração do Terser para ofuscação avançada
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              comparisons: false,
              inline: 2,
              drop_console: true,
              drop_debugger: true,
            },
            mangle: {
              safari10: true,
              reserved: ['__NEXT_DATA__', '__NEXT_LOADED_PAGES__', '__NEXT_REGISTER_PAGE__']
            },
            output: {
              comments: false,
              ascii_only: true,
            },
          },
          parallel: true,
          extractComments: false,
        }),
      ];
    }
    return config;
  },
  async rewrites() {
    return [{
      source: "/Vip",
      destination: "/src/app/pages/vip/page.tsx",
    },
    {
      source: "/Privacy",
      destination: "/src/app/pages/privacy/page.tsx",
    },
    {
      source: "/Coins",
      destination: "/src/app/pages/coins/page.tsx",
    },
    ];
  },
};

export default nextConfig;