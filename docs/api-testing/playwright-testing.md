# API Testing Automatizado con Playwright

Esta guía explica cómo implementar tests de API automatizados siguiendo la arquitectura KATA del proyecto.

---

## Arquitectura KATA para API Testing

### Estructura de Capas

```
Layer 5: Test Files (tests/integration/*.spec.ts)
    ↓
Layer 4: Fixture (ApiFixture - inyección de dependencias)
    ↓
Layer 3: API Components (BookingsApi, ReviewsApi, ProfilesApi)
    ↓
Layer 2: ApiBase (helpers HTTP genéricos)
    ↓
Layer 1: TestContext (configuración, logger, HTTP client)
```

### Estructura de Directorios

```
tests/
├── components/
│   ├── api/                    # Layer 3: API Components
│   │   ├── base/
│   │   │   └── api-base.ts     # Layer 2: Base class
│   │   ├── auth-api.ts         # Autenticación
│   │   ├── profiles-api.ts     # Perfiles
│   │   ├── bookings-api.ts     # Bookings
│   │   ├── reviews-api.ts      # Reviews
│   │   └── index.ts            # Exports
│   └── preconditions/
│       └── auth-precondition.ts
├── fixtures/
│   └── api-fixture.ts          # Layer 4: Fixture
├── integration/                 # Layer 5: Test files
│   ├── auth.spec.ts
│   ├── profiles.spec.ts
│   ├── bookings.spec.ts
│   └── reviews.spec.ts
├── data/
│   └── fixtures/
│       └── test-users.ts       # Datos de prueba
└── utils/
    └── test-context.ts         # Layer 1: Context
```

---

## Layer 1: Test Context

```typescript
// tests/utils/test-context.ts
import { APIRequestContext } from '@playwright/test'

export interface TestConfig {
  baseUrl: string
  apiUrl: string
  supabaseUrl: string
  supabaseAnonKey: string
  testUsers: {
    mentor: { email: string; password: string }
    student: { email: string; password: string }
  }
}

export const testConfig: TestConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3000/api',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  testUsers: {
    mentor: {
      email: process.env.TEST_MENTOR_EMAIL || 'mentor.demo@upexmymentor.com',
      password: process.env.TEST_MENTOR_PASSWORD || 'Demo123!'
    },
    student: {
      email: process.env.TEST_STUDENT_EMAIL || 'student.demo@upexmymentor.com',
      password: process.env.TEST_STUDENT_PASSWORD || 'Demo123!'
    }
  }
}

export class TestContext {
  constructor(
    public readonly request: APIRequestContext,
    public readonly config: TestConfig = testConfig
  ) {}

  log(message: string) {
    console.log(`[TEST] ${new Date().toISOString()} - ${message}`)
  }
}
```

---

## Layer 2: API Base

```typescript
// tests/components/api/base/api-base.ts
import { APIRequestContext, APIResponse, expect } from '@playwright/test'
import { TestContext, testConfig } from '../../../utils/test-context'

export interface ApiResponse<T = unknown> {
  status: number
  data: T
  headers: Record<string, string>
}

export class ApiBase {
  protected context: TestContext
  protected request: APIRequestContext
  protected baseUrl: string
  protected authToken: string | null = null

  constructor(context: TestContext) {
    this.context = context
    this.request = context.request
    this.baseUrl = context.config.supabaseUrl
  }

  setAuthToken(token: string) {
    this.authToken = token
  }

  clearAuthToken() {
    this.authToken = null
  }

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'apikey': testConfig.supabaseAnonKey,
      'Content-Type': 'application/json'
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    return headers
  }

  protected async get<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}/rest/v1${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const response = await this.request.get(url.toString(), {
      headers: this.getHeaders()
    })

    return this.parseResponse<T>(response)
  }

  protected async post<T>(
    endpoint: string,
    data: unknown,
    options?: { returnRepresentation?: boolean }
  ): Promise<ApiResponse<T>> {
    const headers = this.getHeaders()
    if (options?.returnRepresentation) {
      headers['Prefer'] = 'return=representation'
    }

    const response = await this.request.post(
      `${this.baseUrl}/rest/v1${endpoint}`,
      {
        headers,
        data
      }
    )

    return this.parseResponse<T>(response)
  }

  protected async patch<T>(
    endpoint: string,
    data: unknown,
    options?: { returnRepresentation?: boolean }
  ): Promise<ApiResponse<T>> {
    const headers = this.getHeaders()
    if (options?.returnRepresentation) {
      headers['Prefer'] = 'return=representation'
    }

    const response = await this.request.patch(
      `${this.baseUrl}/rest/v1${endpoint}`,
      {
        headers,
        data
      }
    )

    return this.parseResponse<T>(response)
  }

  protected async delete(endpoint: string): Promise<ApiResponse<void>> {
    const response = await this.request.delete(
      `${this.baseUrl}/rest/v1${endpoint}`,
      {
        headers: this.getHeaders()
      }
    )

    return {
      status: response.status(),
      data: undefined as void,
      headers: this.extractHeaders(response)
    }
  }

  private async parseResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
    let data: T
    try {
      data = await response.json()
    } catch {
      data = {} as T
    }

    return {
      status: response.status(),
      data,
      headers: this.extractHeaders(response)
    }
  }

  private extractHeaders(response: APIResponse): Record<string, string> {
    const headers: Record<string, string> = {}
    response.headersArray().forEach(({ name, value }) => {
      headers[name.toLowerCase()] = value
    })
    return headers
  }
}
```

---

## Layer 3: API Components

### Auth API

```typescript
// tests/components/api/auth-api.ts
import { expect } from '@playwright/test'
import { ApiBase } from './base/api-base'
import { TestContext, testConfig } from '../../utils/test-context'

interface LoginResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    user_metadata: {
      name: string
      role: string
    }
  }
}

interface AuthenticatedUser {
  token: string
  userId: string
  email: string
  name: string
  role: string
}

export class AuthApi extends ApiBase {
  constructor(context: TestContext) {
    super(context)
  }

  /**
   * @atc MYM-AUTH-001
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthenticatedUser> {
    this.context.log(`Logging in as ${email}`)

    const response = await this.request.post(
      `${this.baseUrl}/auth/v1/token?grant_type=password`,
      {
        headers: {
          'apikey': testConfig.supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        data: { email, password }
      }
    )

    // Fixed assertions
    expect(response.status()).toBe(200)

    const data: LoginResponse = await response.json()
    expect(data.access_token).toBeDefined()
    expect(data.user.id).toBeDefined()

    // Set token for subsequent requests
    this.setAuthToken(data.access_token)

    this.context.log(`✅ Logged in as ${data.user.user_metadata.name} (${data.user.user_metadata.role})`)

    return {
      token: data.access_token,
      userId: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata.name,
      role: data.user.user_metadata.role
    }
  }

  /**
   * @atc MYM-AUTH-002
   * Login as the demo student
   */
  async loginAsStudent(): Promise<AuthenticatedUser> {
    const { email, password } = testConfig.testUsers.student
    return this.login(email, password)
  }

  /**
   * @atc MYM-AUTH-003
   * Login as the demo mentor
   */
  async loginAsMentor(): Promise<AuthenticatedUser> {
    const { email, password } = testConfig.testUsers.mentor
    return this.login(email, password)
  }

  /**
   * @atc MYM-AUTH-004
   * Logout and clear authentication
   */
  async logout(): Promise<void> {
    this.clearAuthToken()
    this.context.log('✅ Logged out')
  }
}
```

### Profiles API

```typescript
// tests/components/api/profiles-api.ts
import { expect } from '@playwright/test'
import { ApiBase } from './base/api-base'
import { TestContext } from '../../utils/test-context'

interface Profile {
  id: string
  email: string
  name: string
  role: 'student' | 'mentor' | 'admin'
  photo_url?: string
  description?: string
  specialties?: string[]
  hourly_rate?: number
  average_rating?: number
}

export class ProfilesApi extends ApiBase {
  constructor(context: TestContext) {
    super(context)
  }

  /**
   * @atc MYM-PROF-001
   * Get all mentors (public)
   */
  async getMentors(): Promise<Profile[]> {
    this.context.log('Getting all mentors')

    const response = await this.get<Profile[]>('/profiles', {
      'role': 'eq.mentor',
      'select': 'id,name,email,photo_url,specialties,hourly_rate,average_rating'
    })

    // Fixed assertions
    expect(response.status).toBe(200)
    expect(Array.isArray(response.data)).toBe(true)

    this.context.log(`✅ Found ${response.data.length} mentors`)
    return response.data
  }

  /**
   * @atc MYM-PROF-002
   * Get profile by ID (requires auth for private profiles)
   */
  async getProfileById(id: string): Promise<Profile | null> {
    this.context.log(`Getting profile ${id}`)

    const response = await this.get<Profile[]>('/profiles', {
      'id': `eq.${id}`,
      'select': '*'
    })

    expect(response.status).toBe(200)

    if (response.data.length === 0) {
      this.context.log(`⚠️ Profile ${id} not found`)
      return null
    }

    this.context.log(`✅ Found profile: ${response.data[0].name}`)
    return response.data[0]
  }

  /**
   * @atc MYM-PROF-003
   * Update my profile (requires auth)
   */
  async updateMyProfile(
    userId: string,
    updates: Partial<Pick<Profile, 'name' | 'description' | 'photo_url'>>
  ): Promise<Profile> {
    this.context.log(`Updating profile ${userId}`)

    const response = await this.patch<Profile[]>(
      `/profiles?id=eq.${userId}`,
      updates,
      { returnRepresentation: true }
    )

    // Fixed assertions
    expect(response.status).toBe(200)
    expect(response.data.length).toBe(1)

    this.context.log(`✅ Profile updated: ${response.data[0].name}`)
    return response.data[0]
  }

  /**
   * @atc MYM-PROF-004
   * Attempt to update another user's profile (should fail via RLS)
   */
  async attemptUpdateOtherProfile(
    otherId: string,
    updates: Partial<Profile>
  ): Promise<{ success: boolean; data: Profile[] }> {
    this.context.log(`Attempting to update other profile ${otherId}`)

    const response = await this.patch<Profile[]>(
      `/profiles?id=eq.${otherId}`,
      updates,
      { returnRepresentation: true }
    )

    // RLS should return empty array (no rows affected)
    expect(response.status).toBe(200)

    const success = response.data.length > 0
    if (!success) {
      this.context.log(`✅ RLS blocked update to other profile (expected)`)
    } else {
      this.context.log(`❌ RLS did NOT block update (unexpected!)`)
    }

    return { success, data: response.data }
  }
}
```

### Bookings API

```typescript
// tests/components/api/bookings-api.ts
import { expect } from '@playwright/test'
import { ApiBase } from './base/api-base'
import { TestContext } from '../../utils/test-context'

type BookingStatus = 'provisional' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'

interface Booking {
  id: string
  student_id: string
  mentor_id: string
  session_date: string
  duration_minutes: number
  total_cost: number
  status: BookingStatus
  video_call_url?: string
  created_at: string
}

interface CreateBookingData {
  student_id: string
  mentor_id: string
  session_date: string
  duration_minutes: number
  total_cost: number
}

export class BookingsApi extends ApiBase {
  constructor(context: TestContext) {
    super(context)
  }

  /**
   * @atc MYM-BOOK-001
   * Get my bookings (as student or mentor)
   */
  async getMyBookings(userId: string): Promise<Booking[]> {
    this.context.log(`Getting bookings for user ${userId}`)

    const response = await this.get<Booking[]>('/bookings', {
      'or': `(student_id.eq.${userId},mentor_id.eq.${userId})`,
      'select': '*',
      'order': 'session_date.desc'
    })

    // Fixed assertions
    expect(response.status).toBe(200)
    expect(Array.isArray(response.data)).toBe(true)

    // Verify all bookings belong to this user
    response.data.forEach(booking => {
      const isMyBooking = booking.student_id === userId || booking.mentor_id === userId
      expect(isMyBooking).toBe(true)
    })

    this.context.log(`✅ Found ${response.data.length} bookings`)
    return response.data
  }

  /**
   * @atc MYM-BOOK-002
   * Create a new booking (as student)
   */
  async createBooking(data: CreateBookingData): Promise<Booking> {
    this.context.log(`Creating booking for student ${data.student_id} with mentor ${data.mentor_id}`)

    const response = await this.post<Booking[]>(
      '/bookings',
      { ...data, status: 'provisional' },
      { returnRepresentation: true }
    )

    // Fixed assertions
    expect(response.status).toBe(201)
    expect(response.data.length).toBe(1)
    expect(response.data[0].id).toBeDefined()
    expect(response.data[0].status).toBe('provisional')

    this.context.log(`✅ Booking created: ${response.data[0].id}`)
    return response.data[0]
  }

  /**
   * @atc MYM-BOOK-003
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus
  ): Promise<Booking> {
    this.context.log(`Updating booking ${bookingId} to status: ${status}`)

    const response = await this.patch<Booking[]>(
      `/bookings?id=eq.${bookingId}`,
      { status },
      { returnRepresentation: true }
    )

    expect(response.status).toBe(200)
    expect(response.data.length).toBe(1)
    expect(response.data[0].status).toBe(status)

    this.context.log(`✅ Booking status updated to: ${status}`)
    return response.data[0]
  }

  /**
   * @atc MYM-BOOK-004
   * Delete provisional booking
   */
  async deleteProvisionalBooking(bookingId: string): Promise<void> {
    this.context.log(`Deleting provisional booking ${bookingId}`)

    const response = await this.delete(`/bookings?id=eq.${bookingId}`)

    expect(response.status).toBe(204)
    this.context.log(`✅ Booking deleted`)
  }

  /**
   * @atc MYM-BOOK-005
   * Attempt to view other user's bookings (should return empty)
   */
  async attemptViewOtherBookings(otherUserId: string): Promise<Booking[]> {
    this.context.log(`Attempting to view bookings of user ${otherUserId}`)

    const response = await this.get<Booking[]>('/bookings', {
      'student_id': `eq.${otherUserId}`
    })

    expect(response.status).toBe(200)
    // RLS should filter out bookings that don't belong to authenticated user
    this.context.log(`Found ${response.data.length} bookings (expected: 0 if RLS works)`)

    return response.data
  }
}
```

### Reviews API

```typescript
// tests/components/api/reviews-api.ts
import { expect } from '@playwright/test'
import { ApiBase } from './base/api-base'
import { TestContext } from '../../utils/test-context'

interface Review {
  id: string
  mentor_id: string
  reviewer_id: string
  booking_id?: string
  rating: number
  comment: string
  created_at: string
}

interface CreateReviewData {
  mentor_id: string
  reviewer_id: string
  booking_id?: string
  rating: number
  comment: string
}

export class ReviewsApi extends ApiBase {
  constructor(context: TestContext) {
    super(context)
  }

  /**
   * @atc MYM-REV-001
   * Get reviews for a mentor (public)
   */
  async getMentorReviews(mentorId: string): Promise<Review[]> {
    this.context.log(`Getting reviews for mentor ${mentorId}`)

    const response = await this.get<Review[]>('/reviews', {
      'mentor_id': `eq.${mentorId}`,
      'select': '*',
      'order': 'created_at.desc'
    })

    expect(response.status).toBe(200)
    expect(Array.isArray(response.data)).toBe(true)

    this.context.log(`✅ Found ${response.data.length} reviews`)
    return response.data
  }

  /**
   * @atc MYM-REV-002
   * Create a review (as student)
   */
  async createReview(data: CreateReviewData): Promise<Review> {
    this.context.log(`Creating review for mentor ${data.mentor_id}`)

    // Validate rating range
    expect(data.rating).toBeGreaterThanOrEqual(1)
    expect(data.rating).toBeLessThanOrEqual(5)

    const response = await this.post<Review[]>(
      '/reviews',
      data,
      { returnRepresentation: true }
    )

    expect(response.status).toBe(201)
    expect(response.data.length).toBe(1)
    expect(response.data[0].rating).toBe(data.rating)

    this.context.log(`✅ Review created with rating: ${data.rating}/5`)
    return response.data[0]
  }

  /**
   * @atc MYM-REV-003
   * Calculate average rating for a mentor
   */
  async calculateMentorAverageRating(mentorId: string): Promise<number> {
    const reviews = await this.getMentorReviews(mentorId)

    if (reviews.length === 0) {
      return 0
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    const average = sum / reviews.length

    this.context.log(`✅ Average rating: ${average.toFixed(2)} from ${reviews.length} reviews`)
    return average
  }
}
```

---

## Layer 4: API Fixture

```typescript
// tests/fixtures/api-fixture.ts
import { test as base, APIRequestContext } from '@playwright/test'
import { TestContext, testConfig } from '../utils/test-context'
import { AuthApi } from '../components/api/auth-api'
import { ProfilesApi } from '../components/api/profiles-api'
import { BookingsApi } from '../components/api/bookings-api'
import { ReviewsApi } from '../components/api/reviews-api'

interface ApiFixture {
  context: TestContext
  auth: AuthApi
  profiles: ProfilesApi
  bookings: BookingsApi
  reviews: ReviewsApi
}

export const test = base.extend<ApiFixture>({
  context: async ({ request }, use) => {
    const context = new TestContext(request, testConfig)
    await use(context)
  },

  auth: async ({ context }, use) => {
    const auth = new AuthApi(context)
    await use(auth)
  },

  profiles: async ({ context }, use) => {
    const profiles = new ProfilesApi(context)
    await use(profiles)
  },

  bookings: async ({ context }, use) => {
    const bookings = new BookingsApi(context)
    await use(bookings)
  },

  reviews: async ({ context }, use) => {
    const reviews = new ReviewsApi(context)
    await use(reviews)
  }
})

export { expect } from '@playwright/test'
```

---

## Layer 5: Test Files

### Auth Tests

```typescript
// tests/integration/auth.spec.ts
import { test, expect } from '../fixtures/api-fixture'

test.describe('Authentication API', () => {
  test('MYM-AUTH-001: Login with valid credentials', async ({ auth }) => {
    const user = await auth.loginAsStudent()

    expect(user.token).toBeDefined()
    expect(user.email).toBe('student.demo@upexmymentor.com')
    expect(user.role).toBe('student')
  })

  test('MYM-AUTH-002: Login with invalid credentials should fail', async ({ auth }) => {
    await expect(
      auth.login('invalid@email.com', 'wrongpassword')
    ).rejects.toThrow()
  })

  test('MYM-AUTH-003: Login as mentor', async ({ auth }) => {
    const user = await auth.loginAsMentor()

    expect(user.role).toBe('mentor')
    expect(user.email).toBe('mentor.demo@upexmymentor.com')
  })
})
```

### Profiles Tests

```typescript
// tests/integration/profiles.spec.ts
import { test, expect } from '../fixtures/api-fixture'

test.describe('Profiles API', () => {
  test('MYM-PROF-001: Get all mentors (public)', async ({ profiles }) => {
    const mentors = await profiles.getMentors()

    expect(mentors.length).toBeGreaterThan(0)
    mentors.forEach(mentor => {
      expect(mentor.role).toBe('mentor')
      expect(mentor.name).toBeDefined()
    })
  })

  test('MYM-PROF-002: Get my profile (authenticated)', async ({ auth, profiles }) => {
    const user = await auth.loginAsStudent()

    // Share auth token with profiles API
    profiles.setAuthToken(user.token)

    const profile = await profiles.getProfileById(user.userId)

    expect(profile).not.toBeNull()
    expect(profile?.email).toBe(user.email)
  })

  test('MYM-PROF-003: Update my profile', async ({ auth, profiles }) => {
    const user = await auth.loginAsStudent()
    profiles.setAuthToken(user.token)

    const newDescription = `Updated at ${new Date().toISOString()}`
    const updated = await profiles.updateMyProfile(user.userId, {
      description: newDescription
    })

    expect(updated.description).toBe(newDescription)
  })

  test('MYM-PROF-004: Cannot update other user profile (RLS)', async ({ auth, profiles }) => {
    const student = await auth.loginAsStudent()
    profiles.setAuthToken(student.token)

    // Get a mentor's ID
    const mentors = await profiles.getMentors()
    const mentorId = mentors[0].id

    // Attempt to update mentor's profile as student
    const result = await profiles.attemptUpdateOtherProfile(mentorId, {
      description: 'Hacked!'
    })

    // RLS should prevent this
    expect(result.success).toBe(false)
  })
})
```

### Bookings Tests

```typescript
// tests/integration/bookings.spec.ts
import { test, expect } from '../fixtures/api-fixture'

test.describe('Bookings API', () => {
  test('MYM-BOOK-001: Get my bookings as student', async ({ auth, bookings }) => {
    const user = await auth.loginAsStudent()
    bookings.setAuthToken(user.token)

    const myBookings = await bookings.getMyBookings(user.userId)

    // All bookings should belong to this user
    myBookings.forEach(booking => {
      const isMyBooking = booking.student_id === user.userId || booking.mentor_id === user.userId
      expect(isMyBooking).toBe(true)
    })
  })

  test('MYM-BOOK-002: Create and delete provisional booking', async ({ auth, bookings, profiles }) => {
    const student = await auth.loginAsStudent()
    bookings.setAuthToken(student.token)

    // Get a mentor
    const mentors = await profiles.getMentors()
    const mentor = mentors[0]

    // Create booking
    const booking = await bookings.createBooking({
      student_id: student.userId,
      mentor_id: mentor.id,
      session_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      duration_minutes: 60,
      total_cost: mentor.hourly_rate || 50
    })

    expect(booking.status).toBe('provisional')

    // Cleanup: delete the provisional booking
    await bookings.deleteProvisionalBooking(booking.id)
  })

  test('MYM-BOOK-003: Cannot view other user bookings (RLS)', async ({ auth, bookings }) => {
    const student = await auth.loginAsStudent()
    bookings.setAuthToken(student.token)

    // Use a fake user ID
    const fakeUserId = '00000000-0000-0000-0000-000000000000'
    const otherBookings = await bookings.attemptViewOtherBookings(fakeUserId)

    // RLS should return empty array
    expect(otherBookings.length).toBe(0)
  })
})
```

### Reviews Tests

```typescript
// tests/integration/reviews.spec.ts
import { test, expect } from '../fixtures/api-fixture'

test.describe('Reviews API', () => {
  test('MYM-REV-001: Get mentor reviews (public)', async ({ profiles, reviews }) => {
    const mentors = await profiles.getMentors()
    const mentor = mentors[0]

    const mentorReviews = await reviews.getMentorReviews(mentor.id)

    mentorReviews.forEach(review => {
      expect(review.mentor_id).toBe(mentor.id)
      expect(review.rating).toBeGreaterThanOrEqual(1)
      expect(review.rating).toBeLessThanOrEqual(5)
    })
  })

  test('MYM-REV-002: Calculate mentor average rating', async ({ profiles, reviews }) => {
    const mentors = await profiles.getMentors()
    const mentorWithRating = mentors.find(m => (m.average_rating || 0) > 0)

    if (mentorWithRating) {
      const calculatedAvg = await reviews.calculateMentorAverageRating(mentorWithRating.id)

      // Should be close to the stored average
      expect(calculatedAvg).toBeGreaterThan(0)
    }
  })
})
```

---

## Ejecutar Tests

### Comandos

```bash
# Todos los tests de integración
bun run test:integration

# Test específico
bun run test tests/integration/auth.spec.ts

# Con UI mode (debug)
bun run test:debug

# Generar reporte
bun run test:report
```

### Variables de Entorno

Crea `.env.test`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ionevzckjyxtpmyenbxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
TEST_MENTOR_EMAIL=mentor.demo@upexmymentor.com
TEST_MENTOR_PASSWORD=Demo123!
TEST_STUDENT_EMAIL=student.demo@upexmymentor.com
TEST_STUDENT_PASSWORD=Demo123!
```

---

## Mejores Prácticas

### 1. Token Sharing Entre Components

```typescript
test('Flow completo', async ({ auth, bookings, reviews }) => {
  const user = await auth.loginAsStudent()

  // Compartir token con todos los components
  bookings.setAuthToken(user.token)
  reviews.setAuthToken(user.token)

  // Ahora ambos pueden hacer requests autenticados
})
```

### 2. Cleanup de Datos de Prueba

```typescript
test('Create and cleanup', async ({ auth, bookings }) => {
  const user = await auth.loginAsStudent()
  bookings.setAuthToken(user.token)

  const booking = await bookings.createBooking({ ... })

  // Test assertions...

  // Cleanup
  await bookings.deleteProvisionalBooking(booking.id)
})
```

### 3. Usar test.describe para Agrupar

```typescript
test.describe('Como Estudiante', () => {
  test.beforeEach(async ({ auth, bookings }) => {
    const user = await auth.loginAsStudent()
    bookings.setAuthToken(user.token)
  })

  test('puede ver sus bookings', async ({ bookings }) => {
    // Ya está autenticado
  })
})
```

---

## Resumen

| Capa | Responsabilidad |
|------|-----------------|
| **Layer 1** | Configuración y contexto global |
| **Layer 2** | Helpers HTTP genéricos (get, post, patch, delete) |
| **Layer 3** | ATCs específicos por dominio con fixed assertions |
| **Layer 4** | Fixture que inyecta dependencias |
| **Layer 5** | Tests que componen ATCs |

Esta arquitectura permite:
- Reutilización de código
- Trazabilidad a test cases en Jira
- Fixed assertions garantizan calidad
- Fácil mantenimiento y extensión
