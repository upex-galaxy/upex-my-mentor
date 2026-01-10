// src/lib/urls.ts

/**
 * URLs oficiales de la aplicación por ambiente
 * Fuente única de verdad para todos los redirects y links
 *
 * Ambientes:
 * - development: localhost:3000 (servidor local)
 * - staging: rama 'staging' en Vercel (custom environment tipo preview)
 * - production: rama 'main' en Vercel
 */
export const APP_URLS = {
  development: 'http://localhost:3000',
  staging: 'https://staging-upexmymentor.vercel.app',
  production: 'https://upexmymentor.vercel.app',
} as const

export type AppEnvironment = keyof typeof APP_URLS

/**
 * Detecta el ambiente actual basándose en variables de Vercel/Node
 *
 * - VERCEL_ENV='production' → production
 * - VERCEL_ENV='preview' → staging (nuestro custom environment)
 * - Sin VERCEL_ENV → development (local)
 */
export function getEnvironment(): AppEnvironment {
  if (process.env.VERCEL_ENV === 'production') {
    return 'production'
  }

  if (process.env.VERCEL_ENV === 'preview') {
    return 'staging'
  }

  return 'development'
}

/**
 * Retorna la URL base de la aplicación para el ambiente actual
 *
 * Uso:
 * ```ts
 * const baseUrl = getBaseUrl()
 * // development: 'http://localhost:3000'
 * // staging: 'https://staging-upexmymentor.vercel.app'
 * // production: 'https://upexmymentor.vercel.app'
 * ```
 */
export function getBaseUrl(): string {
  const env = getEnvironment()
  return APP_URLS[env]
}

/**
 * Construye una URL completa a partir de un path
 *
 * Uso:
 * ```ts
 * buildUrl('/dashboard/payouts')
 * // → 'https://staging-upexmymentor.vercel.app/dashboard/payouts'
 * ```
 */
export function buildUrl(path: string): string {
  const baseUrl = getBaseUrl()
  // Asegurar que el path empiece con /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}
