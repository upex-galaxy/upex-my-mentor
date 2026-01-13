"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Key, Cookie, FileText } from "lucide-react";

interface AuthInfoPanelProps {
  apiType: string;
}

export function AuthInfoPanel({ apiType }: AuthInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isNextJs = apiType === "nextjs";

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
              {isNextJs ? "Cookie-based Authentication" : "API Key + JWT Authentication"}
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
          <div className="pb-4 grid md:grid-cols-2 gap-4">
            {isNextJs ? (
              <>
                <div className="bg-background border rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Cookie className="h-4 w-4 text-blue-500" />
                    Most Endpoints (Cookie Auth)
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Supabase session cookies are sent automatically from the browser.
                  </p>
                  <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                    Cookie: sb-ionevzckjyxtpmyenbxc-auth-token=...
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
              </>
            ) : (
              <>
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
              </>
            )}
            <div className="md:col-span-2 text-xs text-muted-foreground border-t pt-3 mt-2 flex items-center gap-2">
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
