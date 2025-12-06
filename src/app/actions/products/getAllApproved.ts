"use server";

import { getAllProducts } from "@/lib/firebase/dal/products";
import type { FirebaseError } from "@/lib/firebase/config";
import { Product } from "@/Types/productValidation";
import { isApprovedProduct, sortByNewest } from "@/lib/utils/productFilters";

type AllApprovedProductsResult =
  | {
      success: true;
      products: Product[];
      total: number;
    }
  | { success: false; error: FirebaseError };

export async function getAllApprovedProducts(): Promise<AllApprovedProductsResult> {
  try {
    const allProducts = await getAllProducts();

    const approvedProducts = allProducts.filter(isApprovedProduct);

    const sortedProducts = sortByNewest(approvedProducts);

    return {
      success: true,
      products: sortedProducts as Product[],
      total: sortedProducts.length,
    };
  } catch (error) {
    console.error("Error fetching all approved products:", error);

    const firebaseError = error as FirebaseError;

    return {
      success: false,
      error: {
        code: firebaseError.code || "firestore/fetch-failed",
        message:
          firebaseError.message || "Failed to load products. Please try again.",
      },
    };
  }
}
