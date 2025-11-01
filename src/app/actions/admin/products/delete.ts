"use server";

import { del } from "@vercel/blob";
import { FirebaseError } from "@/lib/firebase";

type ImageDeleteResult =
  | { success: true; deletedCount: number }
  | { success: false; error: FirebaseError };

export async function deleteProductImages(
  imageUrls: string[]
): Promise<ImageDeleteResult> {
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
