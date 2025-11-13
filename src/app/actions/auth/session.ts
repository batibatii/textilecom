"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import type { FirebaseError } from "@/lib/firebase/config";

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds (faster role change)

type SessionResult =
  | { success: true }
  | { success: false; error: FirebaseError };

type VerifySessionResult =
  | {
      success: true;
      user: {
        uid: string;
        email: string;
        role: "admin" | "customer" | "superAdmin";
      };
    }
  | { success: false; error: FirebaseError };

export async function createSession(idToken: string): Promise<SessionResult> {
  try {
    // Verify the ID token and create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION,
    });

    console.log(
      "[Session] Session cookie created, length:",
      sessionCookie.length
    );
    console.log(
      "[Session] Session cookie preview:",
      sessionCookie.substring(0, 50) + "..."
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: SESSION_DURATION / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    console.log("[Session] ✅ Session cookie set successfully");

    return { success: true };
  } catch (error) {
    console.error("Session creation error:", error);
    const firebaseError = error as FirebaseError;
    return {
      success: false,
      error: {
        code: firebaseError.code || "auth/session-creation-failed",
        message:
          firebaseError.message ||
          "Failed to create session. Please try again.",
      },
    };
  }
}

export async function removeSession(): Promise<SessionResult> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return { success: true };
  } catch (error) {
    console.error("Session removal error:", error);
    const firebaseError = error as FirebaseError;
    return {
      success: false,
      error: {
        code: firebaseError.code || "auth/session-removal-failed",
        message: firebaseError.message || "Failed to remove session.",
      },
    };
  }
}

export async function verifySession(): Promise<VerifySessionResult> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return {
        success: false,
        error: {
          code: "auth/no-session",
          message: "No active session found.",
        },
      };
    }

    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    // Role is stored in custom claims - no Firestore query needed!
    const role = decodedClaims.role || "customer";

    return {
      success: true,
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email || "",
        role: role as "admin" | "customer" | "superAdmin",
      },
    };
  } catch (error) {
    console.error("Session verification error:", error);
    const firebaseError = error as FirebaseError;
    return {
      success: false,
      error: {
        code: firebaseError.code || "auth/session-verification-failed",
        message: firebaseError.message || "Failed to verify session.",
      },
    };
  }
}
