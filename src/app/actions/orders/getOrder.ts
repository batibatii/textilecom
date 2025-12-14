"use server";

import { adminDb, FieldPath } from "@/lib/firebase/admin";
import { Order, OrderSchema } from "@/Types/orderValidation";
import { getCurrentUserId } from "@/lib/auth/session";
import { toISOString } from "@/lib/utils/dateFormatter";

type GetOrderResult =
  | { success: true; order: Order }
  | { success: false; error: string };

export async function getOrderBySessionId(
  sessionId: string
): Promise<GetOrderResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const ordersSnapshot = await adminDb
      .collection("orders")
      .where("stripeSessionId", "==", sessionId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (ordersSnapshot.empty) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    const orderDoc = ordersSnapshot.docs[0];
    const rawData = orderDoc.data();
    const orderData = {
      id: orderDoc.id,
      ...rawData,
      createdAt: toISOString(rawData.createdAt) as string,
      updatedAt: toISOString(rawData.updatedAt) as string,
      paymentCompletedAt: toISOString(rawData.paymentCompletedAt) || undefined,
    };

    const validatedOrder = OrderSchema.parse(orderData);

    return {
      success: true,
      order: validatedOrder,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return {
      success: false,
      error: "Failed to fetch order",
    };
  }
}

export async function getOrderById(orderId: string): Promise<GetOrderResult> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Query with userId filter from the start to prevent timing attacks
    const orderSnapshot = await adminDb
      .collection("orders")
      .where(FieldPath.documentId(), "==", orderId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (orderSnapshot.empty) {
      // Same error whether order doesn't exist or user doesn't own it
      return {
        success: false,
        error: "Order not found",
      };
    }

    const orderDoc = orderSnapshot.docs[0];
    const rawData = orderDoc.data();

    const orderData = {
      id: orderDoc.id,
      ...rawData,
      createdAt: toISOString(rawData.createdAt) as string,
      updatedAt: toISOString(rawData.updatedAt) as string,
      paymentCompletedAt: toISOString(rawData.paymentCompletedAt) || undefined,
    };
    const validatedOrder = OrderSchema.parse(orderData);

    return {
      success: true,
      order: validatedOrder,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return {
      success: false,
      error: "Failed to fetch order",
    };
  }
}

export async function getUserOrders(): Promise<{
  success: boolean;
  orders?: Order[];
  error?: string;
}> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const ordersSnapshot = await adminDb
      .collection("orders")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const orders = ordersSnapshot.docs.map((doc) => {
      const rawData = doc.data();
      const data = {
        id: doc.id,
        ...rawData,
        createdAt: toISOString(rawData.createdAt) as string,
        updatedAt: toISOString(rawData.updatedAt) as string,
        paymentCompletedAt:
          toISOString(rawData.paymentCompletedAt) || undefined,
      };
      return OrderSchema.parse(data);
    });

    return {
      success: true,
      orders,
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return {
      success: false,
      error: "Failed to fetch orders",
    };
  }
}
