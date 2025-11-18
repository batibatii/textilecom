"use server";

import { verifySession } from "@/app/actions/auth/session";
import { callApi } from "@/lib/apiHelper";
import type { CheckoutItem } from "@/Types/checkoutValidation";

type CheckoutResult =
  | { success: true; sessionUrl: string; sessionId: string }
  | { success: false; error: string };

type ApiCheckoutResponse = {
  success: boolean;
  sessionUrl?: string;
  sessionId?: string;
  error?: string;
};

export async function handleCheckout(
  items: CheckoutItem[]
): Promise<CheckoutResult> {
  try {
    const session = await verifySession();

    if (!session.success) {
      return {
        success: false,
        error: "Please sign in to checkout",
      };
    }

    const data = await callApi<ApiCheckoutResponse>("/api/stripe/checkout", {
      method: "POST",
      body: { items },
    });

    if (!data.success || !data.sessionUrl) {
      return {
        success: false,
        error: data.error || "Failed to create checkout session",
      };
    }

    return {
      success: true,
      sessionUrl: data.sessionUrl,
      sessionId: data.sessionId!,
    };
  } catch (error) {
    console.error("Checkout action error:", error);
    return {
      success: false,
      error: "An error occurred while processing your request",
    };
  }
}
