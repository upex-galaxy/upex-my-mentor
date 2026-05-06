"use client";

import { useEffect, useState } from "react";

interface RedocViewerProps {
  specUrl: string;
}

declare global {
  interface Window {
    Redoc: {
      init: (
        specUrl: string,
        options: Record<string, unknown>,
        element: HTMLElement | null
      ) => void;
    };
  }
}

export function RedocViewer({ specUrl }: RedocViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js";
    script.async = true;

    script.onload = () => {
      if (window.Redoc) {
        window.Redoc.init(
          specUrl,
          {
            theme: {
              colors: {
                primary: {
                  main: "#8b5cf6",
                },
              },
              typography: {
                fontFamily: "system-ui, sans-serif",
                headings: {
                  fontFamily: "system-ui, sans-serif",
                },
              },
            },
            hideDownloadButton: false,
            expandResponses: "200,201",
            sortOperationsAlphabetically: true,
          },
          document.getElementById("redoc-container")
        );
        setIsLoading(false);
      }
    };

    script.onerror = () => {
      setError("Failed to load Redoc library");
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [specUrl]);

  if (error) {
    return (
      <div data-testid="redoc_error_state" className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 data-testid="redoc_error_title" className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <p data-testid="redoc_error_message" className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div data-testid="redoc_loading_state" className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading API documentation...</p>
          </div>
        </div>
      )}
      <div data-testid="redocViewer" id="redoc-container" className={isLoading ? "hidden" : ""} />
    </>
  );
}
