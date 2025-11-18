import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe/client";
import { CheckoutSchema } from "@/Types/checkoutValidation";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = CheckoutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { items } = validationResult.data;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => ({
        price: item.stripePriceId,
        quantity: item.quantity,
      })
    );

    const headersList = await headers();
    const origin = headersList.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=true`,
      metadata: {
        orderItemCount: items.length.toString(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        sessionUrl: session.url,
        sessionId: session.id,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Checkout API error:", err);

    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
