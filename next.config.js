/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para OneDrive compatibility
  experimental: {
    // Deshabilitar optimizaciones que causan problemas con OneDrive
    esmExternals: false,
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  // Configuración de webpack para OneDrive
  webpack: (config, { dev }) => {
    if (dev) {
      // Deshabilitar watch polling que causa problemas en OneDrive
      config.watchOptions = {
        poll: false,
        ignored: ['node_modules', '.next'],
      };
    }
    return config;
  },
  // Configuración de output para evitar symlinks
  output: 'standalone',
  // Deshabilitar SWC minifier que puede causar problemas
  swcMinify: false,
  images: {
    domains: ['drive.google.com'],
  },
}

module.exports = nextConfig 