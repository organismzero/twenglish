/** @type {import('next').NextConfig} */
const rawBase = (process.env.NEXT_PUBLIC_BASE_PATH || '').trim()
const normalizedBase = rawBase
  ? `/${rawBase.replace(/^\/+/, '').replace(/\/+$/, '')}`
  : ''
const basePath = normalizedBase === '/' ? '' : normalizedBase

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
}

export default nextConfig
