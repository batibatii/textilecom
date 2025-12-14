"use server";

import { adminDb } from "@/lib/firebase/admin";
import type { OrderTableData } from "@/Types/orderTableTypes";
import { toISOString } from "@/lib/utils/dateFormatter";
import { verifyUserRole } from "@/lib/auth/roleCheck";

export async function listOrders(): Promise<{
  success: boolean;
  orders?: OrderTableData[];
  error?: string;
}> {
  try {
    const roleCheck = await verifyUserRole(["admin", "superAdmin"]);
    if (!roleCheck.success) {
      return { success: false, error: roleCheck.error };
    }

    const ordersSnapshot = await adminDb
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    const orders: OrderTableData[] = ordersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        orderNumber: data.orderNumber || "",
        createdAt: toISOString(data.createdAt) || "",
        customerEmail: data.customerInfo?.email || "",
        status: data.status || "pending",
        total: data.totals?.total || 0,
        currency: data.totals?.currency || "USD",
      };
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}
