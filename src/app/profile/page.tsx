"use client";

import { useAuth } from "@/app/AuthProvider";
import { ProfileContainer } from "@/components/ProfileContainer";
import { TailChase } from "ldrs/react";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center">
        <TailChase size="40" speed="1.75" color="black" />
      </div>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col mt-16 md:mt-20 items-center px-4 py-6 md:py-8">
      <ProfileContainer user={user} />
    </main>
  );
}
