# TMS Integration (Test Management System)

Integration guide for syncing KATA test results with Xray Cloud or Jira Direct.

**Budget-Dependent**: This project supports **two TMS approaches** based on client budget:
1. **Xray Cloud** (Premium) - Full-featured TMS with advanced reporting
2. **Jira Direct** (Budget-Friendly) - Use Jira custom fields without Xray

---

## 1. Overview

### What is TMS Integration?

TMS Integration connects KATA's `@atc` decorators with test cases in Jira, enabling:
- **Automatic traceability**: Each ATC maps 1:1 to a Jira issue
- **Result synchronization**: Test results (PASS/FAIL) sync to Jira automatically
- **Granular reporting**: See which ATCs passed/failed, not just tests
- **Audit trail**: History of test executions in Jira comments

### Sync Flow

```
Test Execution (Playwright)
    ↓
ATCs execute with @atc('PROJECT-XXX') decorator
    ↓
Decorator captures results (PASS/FAIL/ERROR)
    ↓
Generate JSON Report (atc_results.json)
    ↓
Sync Script runs (tms_sync.ts)
    ↓
POST to Jira/Xray API
    ↓
Jira issues updated with test results
```

---

## 2. Option 1: Xray Cloud Integration (Premium)

### 2.1 Setup Requirements

**Prerequisites:**
- Jira Cloud instance
- Xray Cloud app installed from Atlassian Marketplace
- API credentials (Client ID + Client Secret)

**Cost**: ~$10-50/month depending on users

### 2.2 Configuration

**Step 1: Get Xray API Credentials**

1. Go to Xray Cloud → Settings → API Keys
2. Create new API Key
3. Copy **Client ID** and **Client Secret**

**Step 2: Configure Environment Variables**

```env
# .env (DO NOT commit to git)

# Enable auto-sync
AUTO_SYNC=true

# Xray Cloud credentials
XRAY_CLIENT_ID=your_client_id_here
XRAY_CLIENT_SECRET=your_client_secret_here
XRAY_PROJECT_KEY=UPEX
```

**Step 3: Install Dependencies**

```bash
npm install --save-dev axios
```

### 2.3 Implementation

**File: `tests/utils/decorators.ts`**

```typescript
import axios from 'axios';

// Store ATC results in-memory
const atcResults: Record<string, AtcResult[]> = {};

interface AtcResult {
  testId: string;
  methodName: string;
  status: 'PASS' | 'FAIL';
  error: string | null;
  executedAt: string;
}

/**
 * @atc decorator for marking methods as ATCs
 * Usage: @atc('PROJECT-XXX')
 */
export function atc(testId: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result: AtcResult = {
        testId,
        methodName: propertyName,
        status: 'FAIL',
        error: null,
        executedAt: new Date().toISOString(),
      };

      try {
        const returnValue = await originalMethod.apply(this, args);
        result.status = 'PASS';
        storeResult(testId, result);
        return returnValue;
      } catch (error: any) {
        result.error = error.message;
        storeResult(testId, result);
        throw error; // Re-throw to fail the test
      }
    };

    return descriptor;
  };
}

function storeResult(testId: string, result: AtcResult) {
  if (!atcResults[testId]) {
    atcResults[testId] = [];
  }
  atcResults[testId].push(result);
}

export function getAtcResults() {
  return atcResults;
}

export function clearAtcResults() {
  Object.keys(atcResults).forEach(key => delete atcResults[key]);
}
```

**File: `tests/utils/tms_sync.ts`**

```typescript
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { getAtcResults } from './decorators';

interface XrayTestExecution {
  testKey: string;
  status: 'PASSED' | 'FAILED';
  comment: string;
}

export async function syncToXray() {
  if (process.env.AUTO_SYNC !== 'true') {
    console.log('⏭️  TMS sync disabled. Set AUTO_SYNC=true to enable.');
    return;
  }

  const clientId = process.env.XRAY_CLIENT_ID;
  const clientSecret = process.env.XRAY_CLIENT_SECRET;
  const projectKey = process.env.XRAY_PROJECT_KEY || 'UPEX';

  if (!clientId || !clientSecret) {
    console.error('❌ Missing Xray credentials. Check XRAY_CLIENT_ID and XRAY_CLIENT_SECRET.');
    return;
  }

  try {
    // Step 1: Authenticate with Xray
    const authResponse = await axios.post('https://xray.cloud.getxray.app/api/v2/authenticate', {
      client_id: clientId,
      client_secret: clientSecret,
    });

    const token = authResponse.data;

    // Step 2: Prepare test execution payload
    const atcResults = getAtcResults();
    const tests: XrayTestExecution[] = [];

    for (const [testId, executions] of Object.entries(atcResults)) {
      // Determine final status (fail if any execution failed)
      const finalStatus = executions.every(e => e.status === 'PASS') ? 'PASSED' : 'FAILED';
      const lastExecution = executions[executions.length - 1];

      tests.push({
        testKey: testId,
        status: finalStatus,
        comment: `🤖 KATA ATC: ${lastExecution.methodName}\n` +
                 `📊 Executions: ${executions.length}\n` +
                 `⏱️ Last run: ${lastExecution.executedAt}\n` +
                 (lastExecution.error ? `\n❌ Error:\n${lastExecution.error}` : ''),
      });
    }

    const payload = {
      info: {
        project: projectKey,
        summary: `KATA Execution - ${process.env.BUILD_ID || new Date().toISOString()}`,
        description: 'Automated test execution via KATA Framework',
      },
      tests,
    };

    // Step 3: Import results to Xray
    const importResponse = await axios.post(
      'https://xray.cloud.getxray.app/api/v2/import/execution',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Results synced to Xray Cloud successfully`);
    console.log(`   Test Execution: ${importResponse.data.key}`);
    console.log(`   URL: https://your-domain.atlassian.net/browse/${importResponse.data.key}`);

  } catch (error: any) {
    console.error('❌ Xray sync failed:', error.response?.data || error.message);
  }
}
```

**Step 4: Hook into Playwright**

Add to `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';
import { syncToXray } from './tests/utils/tms_sync';

export default defineConfig({
  // ... other config

  globalTeardown: async () => {
    console.log('\n🔄 Syncing test results to TMS...');
    await syncToXray();
  },
});
```

---

## 3. Option 2: Jira Direct Integration (Budget-Friendly)

### 3.1 Setup Requirements

**Prerequisites:**
- Jira Cloud instance
- Jira API token
- Custom field in Jira for test status

**Cost**: Free (included with Jira)

### 3.2 Configuration

**Step 1: Create Custom Field in Jira**

1. Go to Jira → Settings → Issues → Custom Fields
2. Create new field:
   - Type: **Select List (single choice)**
   - Name: **Test Status**
   - Options: `PASS`, `FAIL`, `BLOCKED`, `NOT_RUN`
3. Note the custom field ID (e.g., `customfield_10100`)

**Step 2: Get Jira API Token**

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Create API Token
3. Copy token

**Step 3: Configure Environment Variables**

```env
# .env

# Enable auto-sync
AUTO_SYNC=true

# Jira Direct
JIRA_URL=https://your-domain.atlassian.net
JIRA_USER=your-email@example.com
JIRA_API_TOKEN=your_api_token_here
JIRA_TEST_STATUS_FIELD=customfield_10100
```

### 3.3 Implementation

**File: `tests/utils/tms_sync.ts` (Jira Direct version)**

```typescript
import axios from 'axios';
import { getAtcResults } from './decorators';

export async function syncToJiraDirect() {
  if (process.env.AUTO_SYNC !== 'true') {
    console.log('⏭️  TMS sync disabled.');
    return;
  }

  const jiraUrl = process.env.JIRA_URL;
  const jiraUser = process.env.JIRA_USER;
  const jiraToken = process.env.JIRA_API_TOKEN;
  const customFieldId = process.env.JIRA_TEST_STATUS_FIELD || 'customfield_10100';

  if (!jiraUrl || !jiraUser || !jiraToken) {
    console.error('❌ Missing Jira credentials.');
    return;
  }

  const atcResults = getAtcResults();
  const auth = Buffer.from(`${jiraUser}:${jiraToken}`).toString('base64');

  for (const [testId, executions] of Object.entries(atcResults)) {
    const finalStatus = executions.every(e => e.status === 'PASS') ? 'PASS' : 'FAIL';
    const lastExecution = executions[executions.length - 1];

    try {
      // Update custom field
      await axios.put(
        `${jiraUrl}/rest/api/3/issue/${testId}`,
        {
          fields: {
            [customFieldId]: { value: finalStatus },
          },
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Add comment
      await axios.post(
        `${jiraUrl}/rest/api/3/issue/${testId}/comment`,
        {
          body: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: `🤖 KATA Execution - ${finalStatus}\n`, marks: [{ type: 'strong' }] },
                ],
              },
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: `ATC: ${lastExecution.methodName}\n` },
                  { type: 'text', text: `Executions: ${executions.length}\n` },
                  { type: 'text', text: `Last run: ${lastExecution.executedAt}\n` },
                ],
              },
              ...(lastExecution.error ? [{
                type: 'codeBlock',
                content: [{ type: 'text', text: `Error:\n${lastExecution.error}` }],
              }] : []),
            ],
          },
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Updated ${testId} → ${finalStatus}`);

    } catch (error: any) {
      console.error(`❌ Failed to update ${testId}:`, error.response?.data || error.message);
    }
  }

  console.log('✅ All results synced to Jira Direct');
}
```

---

## 4. Choosing the Right Approach

| Feature | Xray Cloud | Jira Direct |
|---------|-----------|-------------|
| **Cost** | ~$10-50/month | Free |
| **Setup Complexity** | Medium | Low |
| **Reporting** | Advanced (test plans, dashboards, metrics) | Basic (custom field + comments) |
| **Traceability** | Excellent (bi-directional linking) | Good (manual linking) |
| **Test Execution History** | Full history with trends | Limited (via comments) |
| **Automation Support** | Native API | Generic Jira API |
| **Best For** | Teams with QA budget, need advanced reporting | Small teams, tight budget |

**Recommendation:**
- **Start with Jira Direct** for MVP/early stage
- **Upgrade to Xray** when team grows or reporting needs increase

---

## 5. Test ID Format

Both approaches use the same test ID format:

```typescript
@atc('PROJECT-XXX') // e.g., @atc('UPEX-123')
```

**Format**: `{PROJECT_KEY}-{ISSUE_NUMBER}`

**Examples:**
- `UPEX-123` - Maps to https://your-domain.atlassian.net/browse/UPEX-123
- `DEMO-456` - Maps to https://your-domain.atlassian.net/browse/DEMO-456

**Requirements:**
- Must match Jira issue key exactly
- Issue must exist in Jira before sync
- Issue can be any type (Story, Task, Test, etc.)

---

## 6. Creating Test Cases in Jira

### For Xray Cloud

1. Create issues with type **Test** (provided by Xray)
2. Write test steps in Xray format
3. Note the issue key (e.g., `UPEX-123`)
4. Use that key in `@atc('UPEX-123')`

### For Jira Direct

1. Create issues with type **Task** or **Story**
2. Add label `test-case` for filtering
3. Ensure custom field "Test Status" is available
4. Note the issue key (e.g., `UPEX-123`)
5. Use that key in `@atc('UPEX-123')`

---

## 7. Troubleshooting

### Issue: "401 Unauthorized"

**Cause**: Invalid credentials

**Solution**:
- Verify `XRAY_CLIENT_ID` / `JIRA_API_TOKEN` are correct
- Check credentials haven't expired
- Ensure API token has required permissions

### Issue: "Test key not found"

**Cause**: Test ID doesn't exist in Jira

**Solution**:
- Create the Jira issue first
- Verify issue key matches exactly (case-sensitive)
- Check project key is correct

### Issue: "Custom field not found" (Jira Direct)

**Cause**: Custom field ID is incorrect

**Solution**:
- Get correct field ID from Jira API:
  ```bash
  curl -u email@example.com:api_token \
    https://your-domain.atlassian.net/rest/api/3/field | grep -i "test status"
  ```
- Update `JIRA_TEST_STATUS_FIELD` in `.env`

### Issue: Sync is slow

**Cause**: Sequential API calls

**Solution**:
- Implement parallel requests with `Promise.all()`
- Batch requests if API supports it
- Cache authentication tokens

---

## 8. Best Practices

✅ **DO:**
- Create Jira issues before writing ATCs
- Use meaningful test IDs that map to requirements
- Add comments in Jira with execution context (build ID, environment)
- Run sync in CI/CD, not locally (avoid noise)
- Monitor sync failures (set up alerts)

❌ **DON'T:**
- Hardcode test IDs in multiple places
- Sync from local runs (pollutes Jira)
- Skip error handling in sync scripts
- Use generic test IDs (`TEST-001`, `TEST-002`)
- Sync without authentication

---

## 9. CI/CD Integration

In GitHub Actions, enable sync only on `main` branch:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test

- name: Sync results to Jira
  if: github.ref == 'refs/heads/main'
  env:
    AUTO_SYNC: true
    XRAY_CLIENT_ID: ${{ secrets.XRAY_CLIENT_ID }}
    XRAY_CLIENT_SECRET: ${{ secrets.XRAY_CLIENT_SECRET }}
    BUILD_ID: ${{ github.run_id }}
  run: npm run test:sync
```

---

## 10. References

- **Xray Cloud API**: https://docs.getxray.app/display/XRAYCLOUD/REST+API
- **Jira Cloud API**: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- **Xray Pricing**: https://marketplace.atlassian.com/apps/1211769/xray-test-management-for-jira
- **Jira API Tokens**: https://id.atlassian.com/manage-profile/security/api-tokens
