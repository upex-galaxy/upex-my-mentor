# Test Data Management

Comprehensive guide for managing test data in KATA framework with TypeScript + Playwright + Supabase.

---

## 1. Philosophy

**Core Principles:**
- **Isolation**: Each test creates its own data, no shared state
- **Uniqueness**: Use UUIDs/timestamps to prevent conflicts
- **Cleanup**: Always clean up after tests
- **Realism**: Data should mimic production scenarios
- **Repeatability**: Tests should produce consistent results

---

## 2. Data Sources

### 2.1 Faker Library

Use **@faker-js/faker** for generating realistic random data.

**Installation:**
```bash
npm install --save-dev @faker-js/faker
```

**Common Use Cases:**
- User names: `faker.person.fullName()`
- Emails: `faker.internet.email()`
- Passwords: `faker.internet.password({ length: 12 })`
- Addresses: `faker.location.streetAddress()`
- Dates: `faker.date.past()`
- UUIDs: `faker.string.uuid()`

**Integration with TestContext:**
```typescript
// components/testcontext.ts
import { faker } from '@faker-js/faker';

export class TestContext {
  faker = faker;

  generateUniqueEmail(): string {
    const timestamp = Date.now();
    return `test_${timestamp}_${faker.internet.email()}`;
  }

  generateUser(): UserData {
    return {
      name: faker.person.fullName(),
      email: this.generateUniqueEmail(),
      password: faker.internet.password({ length: 12 }),
    };
  }
}
```

### 2.2 Static Fixtures

Store reusable test data in `/tests/fixtures/` as JSON or TypeScript files.

**Use for:**
- Reference data (countries, categories, roles)
- Complex objects that don't need randomization
- Expected API responses for mocking

**Example:**
```json
// tests/fixtures/user_roles.json
{
  "admin": {
    "name": "Admin",
    "permissions": ["read", "write", "delete", "admin"]
  },
  "user": {
    "name": "User",
    "permissions": ["read"]
  }
}
```

### 2.3 Factories (Data Builders)

Create factory functions for complex objects in `/tests/utils/data_generators.ts`.

**Example:**
```typescript
// tests/utils/data_generators.ts
import { faker } from '@faker-js/faker';

export class DataFactory {
  static createUser(overrides?: Partial<User>): User {
    return {
      id: faker.number.int({ min: 1000, max: 9999 }),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      createdAt: faker.date.past().toISOString(),
      ...overrides, // Allow custom fields
    };
  }

  static createProduct(overrides?: Partial<Product>): Product {
    return {
      id: faker.number.int({ min: 100, max: 999 }),
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      stock: faker.number.int({ min: 0, max: 100 }),
      ...overrides,
    };
  }

  static createOrder(userId: number, products: Product[]): Order {
    return {
      id: faker.number.int({ min: 10000, max: 99999 }),
      userId,
      items: products.map(p => ({
        productId: p.id,
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: p.price,
      })),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }
}
```

### 2.4 Database Seeding (Supabase)

Use Supabase client to seed data directly in the database for integration tests.

**Setup:**
```typescript
// components/testcontext.ts
import { createClient } from '@supabase/supabase-js';

export class TestContext {
  supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY! // Use service key for admin access
  );

  async seedUser(userData: UserData): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw new Error(`Failed to seed user: ${error.message}`);
    return data;
  }

  async cleanupUser(userId: number): Promise<void> {
    await this.supabase.from('users').delete().eq('id', userId);
  }
}
```

---

## 3. Data Isolation Strategies

### 3.1 Unique Identifiers

Always generate unique identifiers to prevent test data conflicts.

**Strategies:**
- **UUIDs**: `faker.string.uuid()`
- **Timestamps**: `Date.now()`
- **Combination**: `test_${Date.now()}_${faker.string.alphanumeric(5)}`

**Example:**
```typescript
@atc('UPEX-100')
async createUserSuccessfully(data?: Partial<UserData>): Promise<User> {
  const uniqueEmail = `test_${Date.now()}_${faker.internet.email()}`;

  const userData = {
    name: faker.person.fullName(),
    email: uniqueEmail,
    password: faker.internet.password({ length: 12 }),
    ...data, // Allow overrides
  };

  const response = await this._post('/api/users', { data: userData });
  expect(response.status()).toBe(201);
  return await response.json();
}
```

### 3.2 Test Database Isolation

**Option 1: Separate Test Database**
- Use dedicated Supabase project for tests
- Configure via environment variables
- Reset database schema between test runs

**Option 2: Schema Isolation**
- Use different schema per test run
- PostgreSQL supports multiple schemas
- Cleanup schema after tests complete

**Option 3: Transaction Rollback (Advanced)**
- Wrap tests in database transactions
- Rollback after test completes
- Fast but complex to implement

**Recommended: Separate Test Database**
```env
# .env.test
SUPABASE_URL=https://test-project.supabase.co
SUPABASE_ANON_KEY=your_test_anon_key
SUPABASE_SERVICE_KEY=your_test_service_key
```

### 3.3 Parallel Execution Isolation

When running tests in parallel (Playwright workers), ensure data doesn't collide.

**Strategies:**
- **Worker ID in data**: Include Playwright worker ID in test data
- **Unique prefixes**: `worker_${workerIndex}_${timestamp}_${faker.uuid()}`
- **Database partitioning**: Assign user ID ranges per worker

**Example:**
```typescript
// playwright.config.ts
export default defineConfig({
  workers: 4, // Run 4 tests in parallel
  use: {
    testIdAttribute: 'data-testid',
  },
});

// In test:
test('create user', async ({ page }, testInfo) => {
  const workerId = testInfo.workerIndex;
  const uniqueEmail = `worker${workerId}_${Date.now()}@test.com`;
  // ...
});
```

---

## 4. Data Cleanup

### 4.1 Cleanup Strategies

**1. Inline Cleanup (Simple)**
```typescript
test('user flow', async ({ page }) => {
  const fixture = new TestFixture(page);

  // Create
  const user = await fixture.api.users.createUserSuccessfully({
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
  });

  try {
    // Test logic...
    await fixture.ui.login.loginSuccessfully(user.email, 'password');
    // ...
  } finally {
    // Cleanup (always runs)
    await fixture.api.users.deleteUser(user.id);
  }
});
```

**2. Fixture-Level Cleanup (Recommended)**
```typescript
// global-setup.ts
export default async function globalSetup() {
  // Track created resources
  global.createdUsers = [];
  global.createdOrders = [];
}

// TestContext
export class TestContext {
  private createdResources: { type: string; id: number }[] = [];

  trackResource(type: string, id: number) {
    this.createdResources.push({ type, id });
  }

  async cleanup() {
    for (const resource of this.createdResources.reverse()) {
      if (resource.type === 'user') {
        await this.supabase.from('users').delete().eq('id', resource.id);
      } else if (resource.type === 'order') {
        await this.supabase.from('orders').delete().eq('id', resource.id);
      }
    }
    this.createdResources = [];
  }
}

// In tests:
test.afterEach(async ({ page }) => {
  const fixture = new TestFixture(page);
  await fixture.context.cleanup();
});
```

**3. Scheduled Cleanup (Fallback)**
- Run nightly job to delete test data older than 24 hours
- Identify test data by email pattern (`test_*@example.com`)
- Use Supabase SQL function or external script

```sql
-- Supabase SQL function
CREATE OR REPLACE FUNCTION cleanup_test_data()
RETURNS void AS $$
BEGIN
  DELETE FROM users
  WHERE email LIKE 'test_%@%'
    AND created_at < NOW() - INTERVAL '24 hours';

  DELETE FROM orders
  WHERE created_at < NOW() - INTERVAL '24 hours'
    AND user_id NOT IN (SELECT id FROM users);
END;
$$ LANGUAGE plpgsql;
```

### 4.2 Cleanup Best Practices

✅ **DO:**
- Always clean up in `finally` blocks or `afterEach`
- Delete in reverse order of creation (child → parent)
- Log cleanup failures (don't throw errors)
- Use soft deletes if supported (mark as deleted, cleanup later)

❌ **DON'T:**
- Skip cleanup assuming tests are independent
- Clean up before assertions (use `finally`)
- Ignore cleanup failures silently
- Delete production data accidentally (verify environment!)

---

## 5. Sensitive Data Handling

### 5.1 Credentials Management

**Never hardcode credentials in tests!**

**Use environment variables:**
```env
# .env.test
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=SecureTestPassword123!
SUPABASE_SERVICE_KEY=ey...
ADMIN_API_KEY=sk_test_...
```

**Load in TestContext:**
```typescript
export class TestContext {
  config = {
    testUserEmail: process.env.TEST_USER_EMAIL!,
    testUserPassword: process.env.TEST_USER_PASSWORD!,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY!,
  };

  getTestCredentials() {
    return {
      email: this.config.testUserEmail,
      password: this.config.testUserPassword,
    };
  }
}
```

### 5.2 PII (Personally Identifiable Information)

**Rules for test data with PII:**
- Use fake data (Faker) for all PII fields
- Never use real emails, phone numbers, or addresses
- Prefix test emails clearly: `test_*@example.com`
- Use disposable email domains if needed: `@mailinator.com`, `@guerrillamail.com`

**Anonymization for production data (if needed):**
```typescript
// utils/data_anonymizer.ts
export function anonymizeUser(user: User): User {
  return {
    ...user,
    name: faker.person.fullName(),
    email: `anon_${user.id}@example.com`,
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
  };
}
```

### 5.3 Encryption

If storing test data with sensitive fields, encrypt them.

**Example with crypto:**
```typescript
import crypto from 'crypto';

export class TestContext {
  private encryptionKey = process.env.TEST_DATA_ENCRYPTION_KEY!;

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

---

## 6. Test Data Per Environment

### 6.1 Environment Configuration

**Separate config per environment:**
```
/config
├── test.env
├── staging.env
└── production.env (no tests run here!)
```

**Load based on NODE_ENV:**
```typescript
// components/testcontext.ts
export class TestContext {
  private env = process.env.NODE_ENV || 'test';
  private config = this.loadConfig(this.env);

  private loadConfig(env: string) {
    const configPath = `./config/${env}.env`;
    require('dotenv').config({ path: configPath });

    return {
      apiBaseUrl: process.env.API_BASE_URL!,
      supabaseUrl: process.env.SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_ANON_KEY!,
    };
  }
}
```

### 6.2 Data Requirements by Environment

| Environment | Data Strategy | Cleanup |
|-------------|--------------|---------|
| **Local** | Generate on-the-fly | Manual or afterEach |
| **CI (GitHub Actions)** | Generate on-the-fly + seeding | Automatic in teardown |
| **Staging** | Mix of generated + seed data | Nightly cleanup job |
| **Production** | NO TESTS RUN | N/A |

---

## 7. Data Factories vs Direct Creation

### When to Use Factories

✅ **Use factories when:**
- Creating complex objects with many fields
- Need realistic data with business logic
- Want to reuse data creation across tests
- Need variations of similar objects

### When to Create Directly

✅ **Create directly when:**
- Simple objects (2-3 fields)
- One-off data for specific test
- Customization needed that factory doesn't support

**Example comparison:**
```typescript
// Factory (reusable, complex)
const user = DataFactory.createUser({ role: 'admin' });

// Direct (simple, one-off)
const simpleUser = {
  email: `test_${Date.now()}@example.com`,
  password: 'Test123!',
};
```

---

## 8. Best Practices Summary

✅ **DO:**
- Use Faker for realistic random data
- Always include unique identifiers (UUIDs, timestamps)
- Clean up after every test
- Use factories for complex objects
- Load credentials from environment variables
- Test with realistic data volumes (pagination, performance)

❌ **DON'T:**
- Hardcode test data values
- Share data between tests
- Use real user data in tests
- Skip cleanup (causes test pollution)
- Create data without tracking for cleanup
- Run tests against production database

---

## 9. Tools & Libraries

| Tool | Purpose | Installation |
|------|---------|-------------|
| **@faker-js/faker** | Generate realistic random data | `npm install --save-dev @faker-js/faker` |
| **@supabase/supabase-js** | Interact with Supabase DB | `npm install @supabase/supabase-js` |
| **dotenv** | Load environment variables | `npm install dotenv` |
| **uuid** | Generate UUIDs (optional, Faker has it) | `npm install uuid` |

---

## 10. References

- **Faker Documentation**: https://fakerjs.dev/
- **Supabase JS Client**: https://supabase.com/docs/reference/javascript
- **Playwright Test Fixtures**: https://playwright.dev/docs/test-fixtures
- **Test Data Patterns**: https://martinfowler.com/bliki/TestDataBuilder.html
