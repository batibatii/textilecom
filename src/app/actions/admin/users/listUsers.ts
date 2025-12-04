"use server";

import { adminDb } from "@/lib/firebase/admin";
import type { UserDashboardData } from "@/Types/userDashboardType";
import { toISOString } from "@/lib/utils/dateFormatter";
import { verifyUserRole } from "@/lib/auth/roleCheck";

export async function getAllUsersWithOrderCounts(): Promise<{
  success: boolean;
  users?: UserDashboardData[];
  error?: string;
}> {
  try {
    const roleCheck = await verifyUserRole(["admin", "superAdmin"]);
    if (!roleCheck.success) {
      return { success: false, error: roleCheck.error };
    }

    const usersSnapshot = await adminDb.collection("users").get();
    const users: UserDashboardData[] = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();

      const ordersSnapshot = await adminDb
        .collection("orders")
        .where("userId", "==", doc.id)
        .get();

      users.push({
        id: doc.id,
        email: userData.email || "",
        role: userData.role || "customer",
        createdAt: toISOString(userData.createdAt) || "",
        lastLoginAt: toISOString(userData.lastLoginAt),
        orderCount: ordersSnapshot.size,
      });
    }

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}
