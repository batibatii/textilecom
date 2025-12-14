"use server";

import { getProductsWithLimit } from "@/lib/firebase/dal/products";
import type { FirebaseError } from "@/lib/firebase/config";
import { Product } from "@/Types/productValidation";

type InfiniteProductsResult =
  | {
      success: true;
      products: Product[];
      hasMore: boolean;
      total: number;
    }
  | { success: false; error: FirebaseError };

export async function getProductsInfinite(
  limit: number = 12,
  offset: number = 0
): Promise<InfiniteProductsResult> {
  try {
    const result = await getProductsWithLimit(limit, offset);

    return {
      success: true,
      products: result.products as Product[],
      hasMore: result.hasMore,
      total: result.total,
    };
  } catch (error) {
    console.error("Error fetching products for infinite scroll:", error);

    const firebaseError = error as FirebaseError;

    return {
      success: false,
      error: {
        code: firebaseError.code || "firestore/fetch-failed",
        message:
          firebaseError.message ||
          "Failed to load more products. Please try again.",
      },
    };
  }
}
