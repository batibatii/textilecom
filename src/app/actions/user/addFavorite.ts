"use server";

import { addUserFavorite } from "@/lib/firebase/dal/users";
import { getCurrentUserId } from "@/lib/auth/session";

export async function addFavorite(productId: string) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: {
          code: "auth/not-authenticated",
          message: "You must be logged in to add favorites.",
        },
      };
    }

    const result = await addUserFavorite(userId, productId);
    return result;
  } catch (error) {
    console.error("Error adding favorite:", error);
    return {
      success: false,
      error: {
        code: "favorites/add-failed",
        message: "Failed to add product to favorites.",
      },
    };
  }
}
