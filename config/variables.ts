/**
 * Environment configuration for test automation
 * KATA Layer 1: TestContext foundation
 */

export const env = {
  isCI: !!process.env.CI,
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',

  // Timeouts (in milliseconds)
  defaultTimeout: 30_000,
  navigationTimeout: 60_000,

  // Test user credentials (from environment)
  testUser: {
    email: process.env.TEST_USER_EMAIL || '',
    password: process.env.TEST_USER_PASSWORD || '',
  },
} as const;
