"use server";

import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUserId } from "@/lib/auth/session";

type Role = "customer" | "admin" | "superAdmin";

interface RoleCheckResult {
  success: boolean;
  userId?: string;
  role?: Role;
  error?: string;
}

export async function verifyUserRole(
  allowedRoles: Role[]
): Promise<RoleCheckResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const currentUserDoc = await adminDb.collection("users").doc(userId).get();
    const currentUserData = currentUserDoc.data();
    const role = currentUserData?.role as Role | undefined;

    if (!role || !allowedRoles.includes(role)) {
      return { success: false, error: "Insufficient permissions" };
    }

    return { success: true, userId, role };
  } catch (error) {
    console.error("Error verifying user role:", error);
    return { success: false, error: "Failed to verify user role" };
  }
}
