"use server";

import { adminDb } from "@/lib/firebase/admin";
import { verifyUserRole } from "@/lib/auth/roleCheck";
import type { Order } from "@/Types/orderValidation";

export async function getOrderById(orderId: string): Promise<{
  success: boolean;
  order?: Order;
  error?: string;
}> {
  try {
    const roleCheck = await verifyUserRole(["admin", "superAdmin"]);
    if (!roleCheck.success) {
      return { success: false, error: roleCheck.error };
    }

    const orderDoc = await adminDb.collection("orders").doc(orderId).get();

    if (!orderDoc.exists) {
      return { success: false, error: "Order not found" };
    }

    const orderData = orderDoc.data();
    const order: Order = {
      id: orderDoc.id,
      userId: orderData?.userId || "",
      orderNumber: orderData?.orderNumber || "",
      stripeSessionId: orderData?.stripeSessionId || "",
      stripePaymentIntentId: orderData?.stripePaymentIntentId || "",
      status: orderData?.status || "pending",
      items: orderData?.items || [],
      totals: orderData?.totals || {
        subtotal: 0,
        tax: 0,
        total: 0,
        currency: "USD",
      },
      customerInfo: orderData?.customerInfo || { email: "" },
      createdAt:
        orderData?.createdAt?.toDate?.()?.toISOString() ||
        new Date().toISOString(),
      updatedAt:
        orderData?.updatedAt?.toDate?.()?.toISOString() ||
        new Date().toISOString(),
      paymentCompletedAt: orderData?.paymentCompletedAt
        ?.toDate?.()
        ?.toISOString(),
      metadata: orderData?.metadata,
    };

    return { success: true, order };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}
