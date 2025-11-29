"use server";

import { adminDb } from "@/lib/firebase/admin";
import { Order, OrderSchema } from "@/Types/orderValidation";
import { getCurrentUserId } from "@/lib/auth/session";

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
    const orderData = { id: orderDoc.id, ...orderDoc.data() };

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

    const orderDoc = await adminDb.collection("orders").doc(orderId).get();

    if (!orderDoc.exists) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    const rawData = orderDoc.data();

    if (rawData?.userId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const orderData = { id: orderDoc.id, ...rawData };
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
      const data = { id: doc.id, ...doc.data() };
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
