/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración experimental básica
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs', 'nodemailer', 'resend'],
  },
  
  // Habilitar SWC minifier para mejor rendimiento
  swcMinify: true,
  
  // Configuración de imágenes
  images: {
    domains: ['drive.google.com', 'resend.dev'],
  },
  
  // Optimizaciones adicionales
  compiler: {
    // Remover console.logs en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuración de headers para mejor performance
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 