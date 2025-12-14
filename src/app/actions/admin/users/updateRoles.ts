"use server";

import { updateUserRole } from "@/lib/firebase/dal/users";
import { verifyUserRole } from "@/lib/auth/roleCheck";

export async function batchUpdateUserRoles(
  updates: Array<{ userId: string; role: "customer" | "admin" | "superAdmin" }>
): Promise<{
  success: boolean;
  results?: Array<{ userId: string; success: boolean }>;
  message?: string;
  error?: string;
}> {
  try {
    const roleCheck = await verifyUserRole(["admin", "superAdmin"]);
    if (!roleCheck.success) {
      return { success: false, error: roleCheck.error };
    }

    const results = [];
    for (const { userId: targetUserId, role: newRole } of updates) {
      const result = await updateUserRole(targetUserId, newRole);
      results.push({ userId: targetUserId, success: result.success });
    }

    const allSuccessful = results.every((r) => r.success);

    return {
      success: allSuccessful,
      results,
      message: allSuccessful ? "All roles updated" : "Some updates failed",
    };
  } catch (error) {
    console.error("Error updating roles:", error);
    return { success: false, error: "Failed to update roles" };
  }
}
