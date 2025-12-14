"use server";

import { createProduct } from "@/lib/firebase/dal/products";
import { revalidateTag } from "next/cache";
import { verifyUserRole } from "@/lib/auth/roleCheck";

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
  sex: string;
  stock: number;
  discount?: number;
  createdBy: string;
}) {
  const roleCheck = await verifyUserRole(["admin", "superAdmin"]);
  if (!roleCheck.success) {
    return { success: false, error: roleCheck.error };
  }

  const result = await createProduct(productData);

  revalidateTag("products");

  return result;
}
