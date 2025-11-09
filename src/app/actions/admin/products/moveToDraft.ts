"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidateTag } from "next/cache";
import type { FirebaseError } from "@/lib/firebase/config";

export async function moveToDraft(productId: string) {
  try {
    const productRef = adminDb.collection("products").doc(productId);

    await productRef.update({
      draft: true,
      updatedAt: new Date().toISOString(),
    });

    revalidateTag('products');

    return { success: true };
  } catch (error) {
    console.error("Error moving product to draft:", error);
    const firebaseError = error as FirebaseError;

    return {
      success: false,
      error: {
        code: firebaseError.code || "firestore/move-to-draft-failed",
        message: firebaseError.message || "Failed to move product to draft. Please try again.",
      },
    };
  }
}
