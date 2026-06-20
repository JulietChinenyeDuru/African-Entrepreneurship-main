/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias['canvas'] = false
    }
    config.resolve.extensionAlias = {
      '.js': ['.js', '.mjs'],
    }
    return config
  },
  experimental: {
    serverComponentsExternalPackages: ['pdfjs-dist'],
  },
}
module.exports = nextConfig
