/**
 * OpenAPI Schemas Index
 *
 * This file imports all schema modules to ensure they are registered
 * with the OpenAPI registry before generating the document.
 *
 * Import order matters - common schemas must be loaded first.
 */

// Common schemas (must be first)
export * from './common'

// Feature-specific schemas
export * from './checkout'
export * from './bookings'
export * from './stripe'
export * from './mentors'
export * from './messages'
export * from './users'
export * from './system'
