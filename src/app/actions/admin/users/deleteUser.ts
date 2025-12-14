"use server";

import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { verifyUserRole } from "@/lib/auth/roleCheck";

export async function deleteUser(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const roleCheck = await verifyUserRole(["superAdmin"]);
    if (!roleCheck.success) {
      return { success: false, error: roleCheck.error };
    }

    if (roleCheck.userId === userId) {
      return { success: false, error: "Cannot delete your own account" };
    }

    await adminDb.collection("users").doc(userId).delete();

    await adminAuth.deleteUser(userId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
