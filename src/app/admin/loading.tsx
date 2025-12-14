"use client";

import { TailChase } from "ldrs/react";

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-center items-center h-screen">
        <TailChase size="40" speed="1.75" color="black" />
      </div>
    </main>
  );
}
