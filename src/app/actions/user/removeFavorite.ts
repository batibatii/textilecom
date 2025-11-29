"use server";

import { removeUserFavorite } from "@/lib/firebase/dal/users";
import { getCurrentUserId } from "@/lib/auth/session";

export async function removeFavorite(productId: string) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: {
          code: "auth/not-authenticated",
          message: "You must be logged in to remove favorites.",
        },
      };
    }

    const result = await removeUserFavorite(userId, productId);
    return result;
  } catch (error) {
    console.error("Error removing favorite:", error);
    return {
      success: false,
      error: {
        code: "favorites/remove-failed",
        message: "Failed to remove product from favorites.",
      },
    };
  }
}
