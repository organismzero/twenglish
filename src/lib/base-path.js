/**
 * Base path helpers keep GitHub Pages deployments working whether the site is
 * served from the domain root or a subdirectory. Configure via
 * `NEXT_PUBLIC_BASE_PATH` (e.g., `/repo-name`). Next.js inlines public env vars
 * at build time so this stays tree-shakeable.
 * @type {string}
 */
const rawBase = (process.env.NEXT_PUBLIC_BASE_PATH || '').trim()
const sanitizedBase = rawBase
  ? `/${rawBase.replace(/^\/+/, '').replace(/\/+$/, '')}`
  : ''

export const BASE_PATH = sanitizedBase === '/' ? '' : sanitizedBase

const rawSite = (process.env.NEXT_PUBLIC_SITE_URL || '').trim()
const normalizedSite = rawSite ? rawSite.replace(/\/+$/, '') : ''

/**
 * Resolve the origin (protocol + host) the app should use for OAuth callbacks.
 * @returns {string}
 */
export function getSiteOrigin() {
  if (normalizedSite) return normalizedSite
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return ''
}

/**
 * Prefix any relative path with the configured base path.
 * @param {string} path Relative path starting with or without '/'.
 * @returns {string} Path safe for both local dev and GitHub Pages.
 */
export function withBasePath(path = '') {
  const normalized = path.startsWith('/') ? path : '/' + path
  if (!BASE_PATH) return normalized
  const prefix = BASE_PATH.endsWith('/') ? BASE_PATH.slice(0, -1) : BASE_PATH
  return prefix + normalized
}
