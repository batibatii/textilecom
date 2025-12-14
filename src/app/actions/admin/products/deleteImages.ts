"use server";

import { del } from "@vercel/blob";
import type { FirebaseError } from "@/lib/firebase/config";
import { verifyUserRole } from "@/lib/auth/roleCheck";

type ImageDeleteResult =
  | { success: true; deletedCount: number }
  | { success: false; error: FirebaseError };

export async function deleteProductImages(
  imageUrls: string[]
): Promise<ImageDeleteResult> {
  const roleCheck = await verifyUserRole(["admin", "superAdmin"]);
  if (!roleCheck.success) {
    return {
      success: false,
      error: {
        code: "auth/unauthorized",
        message: roleCheck.error || "Unauthorized",
      },
    };
  }

  try {
    if (!imageUrls || imageUrls.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    const deletePromises = imageUrls.map((url) => del(url));
    await Promise.all(deletePromises);

    return { success: true, deletedCount: imageUrls.length };
  } catch (error) {
    console.error("Image deletion error:", error);
    return {
      success: false,
      error: {
        code: "storage/delete-failed",
        message: "Failed to delete product images. Please try again.",
      },
    };
  }
}
