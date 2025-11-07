"use server";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { revalidateTag } from "next/cache";

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
  const productRef = doc(db, "products", productId);
  await updateDoc(productRef, updatedData);

  revalidateTag('products');

  return { success: true };
}
