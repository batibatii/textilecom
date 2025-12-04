"use server";

import { adminDb } from "@/lib/firebase/admin";
import { OrderSchema, type Order } from "@/Types/orderValidation";
import { verifyUserRole } from "@/lib/auth/roleCheck";

export async function getOrdersForUser(userId: string): Promise<{
  success: boolean;
  orders?: Order[];
  error?: string;
}> {
  try {
    const roleCheck = await verifyUserRole(["admin", "superAdmin"]);
    if (!roleCheck.success) {
      return { success: false, error: roleCheck.error };
    }

    const ordersSnapshot = await adminDb
      .collection("orders")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const orders = ordersSnapshot.docs.map((doc) => {
      const data = { id: doc.id, ...doc.data() };
      return OrderSchema.parse(data);
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}
