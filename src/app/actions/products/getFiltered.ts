"use server";

import {
  getFilteredProductsFromDB,
  getAllProducts,
} from "@/lib/firebase/dal/products";
import type { FirebaseError } from "@/lib/firebase/config";
import { Product } from "@/Types/productValidation";
import { ProductFilters, SortOption } from "@/Types/filterTypes";
import { isApprovedProduct } from "@/lib/utils/productFilters";

type FilteredProductsResult =
  | {
      success: true;
      products: Product[];
      hasMore: boolean;
      total: number;
    }
  | { success: false; error: FirebaseError };

export async function getFilteredProducts(
  filters: ProductFilters,
  sortBy: SortOption,
  limit: number = 12,
  offset: number = 0
): Promise<FilteredProductsResult> {
  try {
    const result = await getFilteredProductsFromDB(
      filters,
      sortBy,
      limit,
      offset
    );

    return {
      success: true,
      products: result.products as Product[],
      hasMore: result.hasMore,
      total: result.total,
    };
  } catch (error) {
    console.error("Error fetching filtered products:", error);

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

export async function getFilterOptions(): Promise<{
  success: boolean;
  values?: { brands: string[]; categories: string[]; sex: string[] };
  error?: string;
}> {
  try {
    const allProducts = await getAllProducts();

    const approvedProducts = allProducts.filter(isApprovedProduct);

    const brands = new Set<string>();
    const categories = new Set<string>();
    const sexOptions = new Set<string>();

    approvedProducts.forEach((product) => {
      brands.add(product.brand);
      categories.add(product.category);
      sexOptions.add(product.sex);
    });

    return {
      success: true,
      values: {
        brands: Array.from(brands).sort(),
        categories: Array.from(categories).sort(),
        sex: Array.from(sexOptions).sort(),
      },
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return {
      success: false,
      error: "Failed to load filter options",
    };
  }
}
