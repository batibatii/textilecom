"use server";

import { deleteProduct } from "@/lib/firebase";
import { revalidateTag } from "next/cache";

export async function deleteProductWithRevalidation(
  productId: string,
  imageUrls: string[]
) {
  const result = await deleteProduct(productId, imageUrls);

  // Revalidate products cache
  revalidateTag('products');

  return result;
}
