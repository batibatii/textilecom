"use server";

import {
  addUserFavorite,
  removeUserFavorite,
  getUserData,
} from "@/lib/firebase/dal/users";
import { getCurrentUserId } from "@/lib/auth/session";

export async function toggleFavorite(productId: string) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: {
          code: "auth/not-authenticated",
          message: "You must be logged in to manage favorites.",
        },
      };
    }

    // Get current user data to check if product is already favorited
    const userData = await getUserData(userId);
    const currentFavorites = userData?.favorites || [];
    const isFavorited = currentFavorites.includes(productId);

    const result = isFavorited
      ? await removeUserFavorite(userId, productId)
      : await addUserFavorite(userId, productId);

    if (result.success) {
      return {
        success: true,
        isFavorited: !isFavorited, // Return new state
      };
    }

    return result;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return {
      success: false,
      error: {
        code: "favorites/toggle-failed",
        message: "Failed to update favorite status.",
      },
    };
  }
}
