"use server";

import { getAllProducts } from "@/lib/firebase/dal/products";
import type { FirebaseError } from "@/lib/firebase/config";
import { Product } from "@/Types/productValidation";

type ProductsFetchResult =
  | { success: true; products: Product[] }
  | { success: false; error: FirebaseError };

export async function getProducts(): Promise<ProductsFetchResult> {
  try {
    const products = await getAllProducts();

    return {
      success: true,
      products: products as Product[],
    };
  } catch (error) {
    console.error("Error fetching products:", error);

    const firebaseError = error as FirebaseError;

    return {
      success: false,
      error: {
        code: firebaseError.code || "firestore/fetch-failed",
        message: firebaseError.message || "Failed to fetch products. Please try again.",
      },
    };
  }
}

export async function getDraftProducts(): Promise<ProductsFetchResult> {
  try {
    const allProducts = await getAllProducts();
    const draftProducts = allProducts.filter(
      (product) => (product as { draft?: boolean }).draft === true
    );

    return {
      success: true,
      products: draftProducts as Product[],
    };
  } catch (error) {
    console.error("Error fetching draft products:", error);

    const firebaseError = error as FirebaseError;

    return {
      success: false,
      error: {
        code: firebaseError.code || "firestore/fetch-failed",
        message: firebaseError.message || "Failed to fetch draft products. Please try again.",
      },
    };
  }
}

export async function getApprovedProducts(): Promise<ProductsFetchResult> {
  try {
    const allProducts = await getAllProducts();
    const approvedProducts = allProducts.filter(
      (product) => (product as { draft?: boolean }).draft === false
    );

    return {
      success: true,
      products: approvedProducts as Product[],
    };
  } catch (error) {
    console.error("Error fetching approved products:", error);

    const firebaseError = error as FirebaseError;

    return {
      success: false,
      error: {
        code: firebaseError.code || "firestore/fetch-failed",
        message: firebaseError.message || "Failed to fetch approved products. Please try again.",
      },
    };
  }
}
