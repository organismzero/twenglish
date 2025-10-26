/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: isProd ? 'export' : undefined,
  basePath: isProd ? '/twenglish' : '',
  images: { unoptimized: true },
  trailingSlash: true,
}

export default nextConfig
