import { User as FirebaseUser } from "firebase/auth";
import { createSession, removeSession } from "@/app/actions/auth/session";

/**
 * Creates a session cookie by getting the user's ID token
 * and sending it to the server to create a session cookie
 */
export async function createUserSession(firebaseUser: FirebaseUser) {
  try {
    if (!firebaseUser) {
      throw new Error("No Firebase user provided");
    }
    const idToken = await firebaseUser.getIdToken();

    if (!idToken) {
      throw new Error("Failed to get ID token from Firebase user");
    }

    const result = await createSession(idToken);

    if (!result.success) {
      console.error("Session creation failed:", result.error);
    }

    return result;
  } catch (error) {
    console.error("Error creating user session:", error);
    return {
      success: false as const,
      error: {
        code: "auth/session-helper-failed",
        message:
          error instanceof Error ? error.message : "Failed to create session.",
      },
    };
  }
}

export async function removeUserSession() {
  try {
    const result = await removeSession();
    return result;
  } catch (error) {
    console.error("Error removing user session:", error);
    return {
      success: false as const,
      error: {
        code: "auth/session-removal-helper-failed",
        message: "Failed to remove session.",
      },
    };
  }
}
