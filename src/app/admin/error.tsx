"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superAdmin";

  useEffect(() => {
    console.error("Admin error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Admin Error</h1>
          <p className="text-muted-foreground">
            An error occurred in the admin panel. Please try again.
          </p>
        </div>

        {isAdmin && error.message && (
          <div className="bg-muted/50 p-4 rounded text-sm text-left">
            <p className="font-semibold mb-1">Error Details:</p>
            <p className="text-muted-foreground wrap-break-word">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="rounded-none w-full sm:w-auto">
            TRY AGAIN
          </Button>
          <Link href="/admin" className="w-full sm:w-auto">
            <Button variant="outline" className="rounded-none w-full">
              RETURN TO DASHBOARD
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
