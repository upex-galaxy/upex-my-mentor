"use client";

import Link from "next/link";

interface ApiDocSelectorProps {
  currentApi: string;
}

export function ApiDocSelector({ currentApi }: ApiDocSelectorProps) {
  const apis = [
    {
      id: "nextjs",
      name: "Next.js API",
      description: "Custom business logic endpoints",
      href: "/api-docu",
    },
    {
      id: "supabase",
      name: "Supabase REST",
      description: "Auto-generated CRUD endpoints",
      href: "/api-docu?api=supabase",
    },
  ];

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">API Documentation</h1>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {apis.map((api) => (
              <Link
                key={api.id}
                href={api.href}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${
                    currentApi === api.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {api.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {currentApi === "nextjs" ? (
            <span>14 custom endpoints for business logic</span>
          ) : (
            <span>Auto-generated from database schema</span>
          )}
        </div>
      </div>
    </div>
  );
}
