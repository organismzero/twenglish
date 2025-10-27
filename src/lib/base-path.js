/**
 * Base path helpers keep GitHub Pages deployments working under `/twilingual`.
 * Next.js inlines `process.env.NODE_ENV` so this stays tree-shakeable.
 * @type {string}
 */
export const BASE_PATH = process.env.NODE_ENV === 'production' ? '/twilingual' : ''

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
