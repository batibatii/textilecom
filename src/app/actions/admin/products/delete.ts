"use server";

import { deleteProduct } from "@/lib/firebase/dal/products";
import { revalidateTag } from "next/cache";

export async function deleteProductWithRevalidation(
  productId: string,
  imageUrls: string[]
) {
  const result = await deleteProduct(productId, imageUrls);

  revalidateTag('products');

  return result;
}
