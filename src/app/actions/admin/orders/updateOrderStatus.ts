"use server";

import { adminDb } from "@/lib/firebase/admin";
import { verifyUserRole } from "@/lib/auth/roleCheck";
import { z } from "zod";

const AdminOrderStatusSchema = z.enum(["processing", "completed"]);

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const roleCheck = await verifyUserRole(["admin", "superAdmin"]);
    if (!roleCheck.success) {
      return { success: false, error: roleCheck.error };
    }

    const statusValidation = AdminOrderStatusSchema.safeParse(newStatus);
    if (!statusValidation.success) {
      return {
        success: false,
        error: "Invalid status. Only 'processing' and 'completed' are allowed.",
      };
    }

    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return { success: false, error: "Order not found" };
    }

    await orderRef.update({
      status: statusValidation.data,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}
