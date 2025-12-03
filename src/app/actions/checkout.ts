"use server";

import { verifySession } from "@/app/actions/auth/session";
import { adminDb } from "@/lib/firebase/admin";
import { stripe } from "@/lib/stripe/client";
import { headers } from "next/headers";
import type { CheckoutItem } from "@/Types/checkoutValidation";
import type Stripe from "stripe";

type CheckoutResult =
  | { success: true; sessionUrl: string; sessionId: string }
  | { success: false; error: string };

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

    const userId = session.user.uid;

    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const userData = userDoc.data();

    if (
      !userData?.address ||
      !userData.address.line1 ||
      !userData.address.city ||
      !userData.address.postalCode ||
      !userData.address.country
    ) {
      return {
        success: false,
        error:
          "Please add your shipping address in your profile before checkout",
      };
    }

    // Create Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((item) => ({
        price: item.stripePriceId,
        quantity: item.quantity,
      }));

    // Get origin for redirect URLs
    const headersList = await headers();
    const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=true`,
      metadata: {
        orderItemCount: items.length.toString(),
        userId: userId,
        cartItems: JSON.stringify(
          items.map((item) => ({
            productId: item.productId,
            size: item.size,
            stripePriceId: item.stripePriceId,
          }))
        ),
      },
    });

    if (!stripeSession.url) {
      return {
        success: false,
        error: "Failed to create checkout session",
      };
    }

    return {
      success: true,
      sessionUrl: stripeSession.url,
      sessionId: stripeSession.id,
    };
  } catch (error) {
    console.error("Checkout action error:", error);
    return {
      success: false,
      error: "An error occurred while processing your request",
    };
  }
}
