"use server";

import { createProduct } from "@/lib/firebase";
import { revalidateTag } from "next/cache";

export async function createProductWithRevalidation(productData: {
  title: string;
  description: string;
  brand: string;
  serialNumber: string;
  price: number;
  currency: string;
  taxRate: string;
  images: string[];
  category: string;
  stock: number;
  discount?: number;
  createdBy: string;
}) {
  const result = await createProduct(productData);

  // Revalidate products cache
  revalidateTag('products');

  return result;
}
