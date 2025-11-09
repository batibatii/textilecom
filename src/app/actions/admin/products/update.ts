"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidateTag } from "next/cache";
import type { FirebaseError } from "@/lib/firebase/config";

export async function updateProduct(
  productId: string,
  updatedData: {
    title: string;
    description: string;
    brand: string;
    serialNumber: string;
    price: {
      amount: number;
      currency: string;
    };
    taxRate: string;
    category: string;
    stock: number;
    discount: { rate: number } | null;
    images: string[];
    updatedAt: string;
  }
) {
  try {
    const productRef = adminDb.collection("products").doc(productId);
    await productRef.update(updatedData);

    revalidateTag('products');

    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    const firebaseError = error as FirebaseError;

    return {
      success: false,
      error: {
        code: firebaseError.code || "firestore/update-failed",
        message: firebaseError.message || "Failed to update product. Please try again.",
      },
    };
  }
}
