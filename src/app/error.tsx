"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        {error.message && (
          <div className="bg-muted/50 p-4 rounded text-sm text-left">
            <p className="font-semibold mb-1">Error Details:</p>
            <p className="text-muted-foreground wrap-break-word">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="rounded-none w-full sm:w-auto">
            TRY AGAIN
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="rounded-none w-full">
              RETURN TO HOME
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
