"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "session";

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    return decodedClaims.sub;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}
