"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidateTag } from "next/cache";
import type { FirebaseError } from "@/lib/firebase/config";
import { stripe } from "@/lib/stripe/client";

export async function moveToDraft(productId: string) {
  try {
    const productRef = adminDb.collection("products").doc(productId);

    // Get product data to check if it has a Stripe product
    const productDoc = await productRef.get();
    if (!productDoc.exists) {
      return {
        success: false,
        error: {
          code: "product/not-found",
          message: "Product not found",
        },
      };
    }

    const productData = productDoc.data();
    const stripeProductId = productData?.stripeProductId;

    // Update Firebase to draft
    await productRef.update({
      draft: true,
      updatedAt: new Date().toISOString(),
    });

    if (stripeProductId) {
      try {
        await stripe.products.update(stripeProductId, {
          active: false,
        });
      } catch (stripeError) {
        console.error(
          "Failed to update Stripe product to inactive:",
          stripeError
        );
        console.log(
          "Product moved to draft in Firebase but Stripe update failed. Manual sync may be required."
        );
      }
    }

    revalidateTag("products");

    return { success: true };
  } catch (error) {
    console.error("Error moving product to draft:", error);
    const firebaseError = error as FirebaseError;

    return {
      success: false,
      error: {
        code: firebaseError.code || "firestore/move-to-draft-failed",
        message:
          firebaseError.message ||
          "Failed to move product to draft. Please try again.",
      },
    };
  }
}
