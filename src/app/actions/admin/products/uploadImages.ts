"use server";

import { put } from "@vercel/blob";
import { ImageFileSchema } from "@/types/productValidation";
import type { FirebaseError } from "@/lib/firebase/config";

type ImageUploadResult =
  | { success: true; urls: string[] }
  | { success: false; error: FirebaseError };

export async function uploadImages(
  formData: FormData
): Promise<ImageUploadResult> {
  try {
    const imageFiles = formData.getAll("images") as File[];

    if (!imageFiles || imageFiles.length === 0) {
      return {
        success: false,
        error: {
          code: "storage/no-file",
          message: "No image files provided",
        },
      };
    }

    for (const imageFile of imageFiles) {
      const validation = ImageFileSchema.safeParse({
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
      });

      if (!validation.success) {
        const errorMessage =
          validation.error.issues[0]?.message || "Invalid file";
        return {
          success: false,
          error: {
            code: "storage/invalid-file",
            message: `${imageFile.name}: ${errorMessage}`,
          },
        };
      }
    }

    const uploadPromises = imageFiles.map((file) =>
      put(file.name, file, {
        access: "public",
        addRandomSuffix: true,
      })
    );

    const blobs = await Promise.all(uploadPromises);
    const urls = blobs.map((blob) => blob.url);

    return { success: true, urls };
  } catch (error) {
    console.error("Image upload error:", error);
    return {
      success: false,
      error: {
        code: "storage/upload-failed",
        message: "Failed to upload images. Please try again.",
      },
    };
  }
}
