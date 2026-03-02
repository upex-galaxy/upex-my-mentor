"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Key, Cookie, FileText, Copy, Check, Terminal } from "lucide-react";

interface AuthInfoPanelProps {
  apiType: string;
}

// Supabase configuration for docs
const SUPABASE_PROJECT_ID = "ionevzckjyxtpmyenbxc";
const SUPABASE_AUTH_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1/token?grant_type=password`;

export function AuthInfoPanel({ apiType }: AuthInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const isNextJs = apiType === "nextjs";

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const CopyButton = ({ text, itemId }: { text: string; itemId: string }) => (
    <button
      onClick={() => copyToClipboard(text, itemId)}
      className="ml-2 p-1 hover:bg-muted rounded transition-colors"
      title="Copy to clipboard"
    >
      {copiedItem === itemId ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 flex items-center justify-between text-sm hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isNextJs ? (
              <Cookie className="h-4 w-4 text-blue-500" />
            ) : (
              <Key className="h-4 w-4 text-green-500" />
            )}
            <span className="font-medium">
              {isNextJs ? "Cookie & Bearer Token Authentication" : "API Key + JWT Authentication"}
            </span>
            <span className="text-muted-foreground">
              - Click for quick reference
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {isExpanded && (
          <div className="pb-4 space-y-4">
            {isNextJs ? (
              <>
                {/* Authentication Flow Diagram */}
                <div className="bg-background border rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-purple-500" />
                    Bearer Token Authentication Flow (Postman/Insomnia/curl)
                  </h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`┌─────────────────┐        ┌──────────────────────┐        ┌─────────────────┐
│   Your Client   │        │   Supabase Auth      │        │  Next.js API    │
│  (Postman/curl) │        │                      │        │                 │
└────────┬────────┘        └──────────┬───────────┘        └────────┬────────┘
         │                            │                             │
         │ 1. POST /auth/v1/token     │                             │
         │   email + password         │                             │
         │──────────────────────────>│                             │
         │                            │                             │
         │     { access_token: "..." }│                             │
         │<──────────────────────────│                             │
         │                            │                             │
         │ 2. GET /api/[endpoint]     │                             │
         │   Authorization: Bearer <token>                          │
         │─────────────────────────────────────────────────────────>│
         │                            │                             │
         │                    { data: ... }                         │
         │<─────────────────────────────────────────────────────────│`}
                  </pre>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Step 1: Get Token */}
                  <div className="bg-background border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                      Get Bearer Token
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      POST to Supabase Auth to get your access_token:
                    </p>

                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-1">URL:</p>
                        <div className="flex items-center">
                          <code className="bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
                            {SUPABASE_AUTH_URL}
                          </code>
                          <CopyButton text={SUPABASE_AUTH_URL} itemId="auth-url" />
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Headers:</p>
                        <div className="flex items-center">
                          <code className="bg-muted px-2 py-1 rounded flex-1">
                            apikey: {"<SUPABASE_ANON_KEY>"}
                          </code>
                          <CopyButton text="apikey: " itemId="apikey-header" />
                        </div>
                        <div className="flex items-center mt-1">
                          <code className="bg-muted px-2 py-1 rounded flex-1">
                            Content-Type: application/json
                          </code>
                          <CopyButton text="Content-Type: application/json" itemId="content-type" />
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Body (JSON):</p>
                        <div className="flex items-center">
                          <code className="bg-muted px-2 py-1 rounded flex-1 whitespace-pre">
{`{"email": "user@example.com", "password": "your-password"}`}
                          </code>
                          <CopyButton
                            text='{"email": "user@example.com", "password": "your-password"}'
                            itemId="body-json"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Use Token */}
                  <div className="bg-background border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                      Use Bearer Token
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Add the access_token to your API requests:
                    </p>

                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-1">Header:</p>
                        <div className="flex items-center">
                          <code className="bg-muted px-2 py-1 rounded flex-1">
                            Authorization: Bearer {"<access_token>"}
                          </code>
                          <CopyButton text="Authorization: Bearer " itemId="bearer-header" />
                        </div>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded p-2 mt-3">
                        <p className="text-amber-700 dark:text-amber-400">
                          <strong>Note:</strong> Token expires in 1 hour (3600s).
                          Use <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">refresh_token</code> with <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">grant_type=refresh_token</code> to renew.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* cURL Example */}
                <div className="bg-background border rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-green-500" />
                    cURL Example
                  </h4>
                  <div className="flex items-start">
                    <pre className="text-xs bg-muted p-3 rounded flex-1 overflow-x-auto">
{`# 1. Get token
curl -X POST "${SUPABASE_AUTH_URL}" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"password"}'

# 2. Use token
curl "http://localhost:3000/api/users/me/communication-channels" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`}
                    </pre>
                    <CopyButton
                      text={`# 1. Get token
curl -X POST "${SUPABASE_AUTH_URL}" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"password"}'

# 2. Use token
curl "http://localhost:3000/api/users/me/communication-channels" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`}
                      itemId="curl-example"
                    />
                  </div>
                </div>

                {/* Supported Endpoints */}
                <div className="bg-background border rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Key className="h-4 w-4 text-blue-500" />
                    Bearer Token Supported Endpoints
                  </h4>
                  <div className="grid md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1 font-medium">Protected (require auth):</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li><code className="bg-muted px-1 rounded">GET/PUT /api/users/me/communication-channels</code></li>
                        <li><code className="bg-muted px-1 rounded">POST /api/bookings/[id]/cancel</code></li>
                        <li><code className="bg-muted px-1 rounded">GET /api/bookings/[id]/video-link</code></li>
                        <li><code className="bg-muted px-1 rounded">PATCH /api/bookings/[id]/meeting-link</code></li>
                        <li><code className="bg-muted px-1 rounded">POST /api/checkout/session</code></li>
                        <li><code className="bg-muted px-1 rounded">GET/POST /api/stripe/connect/*</code></li>
                        <li><code className="bg-muted px-1 rounded">GET /api/messages/unread-count</code></li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1 font-medium">Public (no auth needed):</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li><code className="bg-muted px-1 rounded">GET /api/mentors</code></li>
                        <li><code className="bg-muted px-1 rounded">GET /api/mentors/[id]/availability</code></li>
                        <li><code className="bg-muted px-1 rounded">GET /api/users/[id]/communication-channels</code></li>
                        <li><code className="bg-muted px-1 rounded">GET /api/health</code></li>
                        <li><code className="bg-muted px-1 rounded">GET /api/openapi</code></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Alternative Auth Methods */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-background border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Cookie className="h-4 w-4 text-blue-500" />
                      Browser (Cookie Auth)
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Supabase session cookies are sent automatically from the browser.
                    </p>
                    <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                      Cookie: sb-{SUPABASE_PROJECT_ID}-auth-token=...
                    </code>
                  </div>
                  <div className="bg-background border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Key className="h-4 w-4 text-amber-500" />
                      Special Endpoints
                    </h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>Cron jobs:</strong> Authorization: Bearer CRON_SECRET</p>
                      <p><strong>Testing:</strong> X-API-Key: dev-api-key</p>
                      <p><strong>Webhooks:</strong> Stripe-Signature header</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-background border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Key className="h-4 w-4 text-green-500" />
                      Required Headers
                    </h4>
                    <div className="text-xs space-y-2">
                      <div>
                        <p className="text-muted-foreground mb-1">Always required:</p>
                        <code className="bg-muted px-2 py-1 rounded block">
                          apikey: {"<SUPABASE_ANON_KEY>"}
                        </code>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">For authenticated requests:</p>
                        <code className="bg-muted px-2 py-1 rounded block">
                          Authorization: Bearer {"<JWT_TOKEN>"}
                        </code>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      Getting the JWT
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Login via Supabase Auth, then extract the access_token from the session.
                      See <code className="bg-muted px-1 rounded">docs/api-testing/authentication-guide.md</code> for details.
                    </p>
                  </div>
                </div>
              </>
            )}
            <div className="text-xs text-muted-foreground border-t pt-3 mt-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>
                For detailed guides, Postman collections, and Playwright integration, see{" "}
                <code className="bg-muted px-1 rounded">docs/api-testing/</code>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
