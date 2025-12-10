"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidateTag } from "next/cache";
import type { FirebaseError } from "@/lib/firebase/config";
import { syncProductToStripe } from "@/lib/stripe/products";
import { Product } from "@/Types/productValidation";
import { verifyUserRole } from "@/lib/auth/roleCheck";

export async function approveProduct(productId: string) {
  const roleCheck = await verifyUserRole(["admin", "superAdmin"]);
  if (!roleCheck.success) {
    return {
      success: false,
      error: {
        code: "auth/unauthorized",
        message: roleCheck.error || "Unauthorized",
      },
    };
  }

  try {
    const productRef = adminDb.collection("products").doc(productId);

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

    const productData = productDoc.data() as Product;

    await productRef.update({
      draft: false,
      updatedAt: new Date().toISOString(),
    });

    const approvedProduct: Product = {
      ...productData,
      draft: false,
    };

    const stripeResult = await syncProductToStripe(approvedProduct);

    if (stripeResult.success) {
      // Update product with Stripe IDs
      await productRef.update({
        stripeProductId: stripeResult.stripeProductId,
        stripePriceId: stripeResult.stripePriceId,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Log error but don't fail the approval
      // Product is still approved, just not synced to Stripe yet
      console.error("Failed to sync product to Stripe:", stripeResult.error);
      console.log(
        "Product approved but not synced to Stripe. Manual sync may be required."
      );
    }

    revalidateTag("products");

    return {
      success: true,
      stripeSynced: stripeResult.success,
      stripeError: stripeResult.error,
    };
  } catch (error) {
    console.error("Error approving product:", error);
    const firebaseError = error as FirebaseError;

    return {
      success: false,
      error: {
        code: firebaseError.code || "firestore/approve-failed",
        message:
          firebaseError.message ||
          "Failed to approve product. Please try again.",
      },
    };
  }
}
