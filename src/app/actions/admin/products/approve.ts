"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidateTag } from "next/cache";
import type { FirebaseError } from "@/lib/firebase/config";

export async function approveProduct(productId: string) {
  try {
    const productRef = adminDb.collection("products").doc(productId);

    await productRef.update({
      draft: false,
      updatedAt: new Date().toISOString(),
    });

    revalidateTag('products');

    return { success: true };
  } catch (error) {
    console.error("Error approving product:", error);
    const firebaseError = error as FirebaseError;

    return {
      success: false,
      error: {
        code: firebaseError.code || "firestore/approve-failed",
        message: firebaseError.message || "Failed to approve product. Please try again.",
      },
    };
  }
}
