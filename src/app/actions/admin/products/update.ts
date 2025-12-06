"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidateTag } from "next/cache";
import type { FirebaseError } from "@/lib/firebase/config";
import { syncProductToStripe } from "@/lib/stripe/products";
import { Product } from "@/Types/productValidation";
import { convertTaxRateToMultiplier } from "@/lib/utils/taxRate";

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
    sex: string;
    stock: number;
    discount: { rate: number } | null;
    images: string[];
    updatedAt: string;
  }
) {
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

    const currentProduct = productDoc.data() as Product;

    const dataToUpdate = {
      ...updatedData,
      taxRate: convertTaxRateToMultiplier(updatedData.taxRate),
    };

    await productRef.update(dataToUpdate);

    if (!currentProduct.draft) {
      const updatedProduct: Product = {
        ...currentProduct,
        ...dataToUpdate,
        id: productId,
      } as Product;

      const stripeResult = await syncProductToStripe(updatedProduct);

      if (stripeResult.success) {
        await productRef.update({
          stripeProductId: stripeResult.stripeProductId,
          stripePriceId: stripeResult.stripePriceId,
        });
      } else {
        console.error(
          "Failed to sync product changes to Stripe:",
          stripeResult.error
        );
      }

      revalidateTag("products");

      return {
        success: true,
        stripeSynced: stripeResult.success,
        stripeError: stripeResult.error,
      };
    }

    revalidateTag("products");

    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    const firebaseError = error as FirebaseError;

    return {
      success: false,
      error: {
        code: firebaseError.code || "firestore/update-failed",
        message:
          firebaseError.message ||
          "Failed to update product. Please try again.",
      },
    };
  }
}
