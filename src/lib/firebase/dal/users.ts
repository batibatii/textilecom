"use server";

import { adminDb, adminAuth, FieldValue } from "../admin";
import type { Product } from "@/Types/productValidation";

export const createUser = async (email: string, userId: string) => {
  const userRef = adminDb.collection("users").doc(userId);

  const userData = {
    id: userId,
    email: email,
    role: "customer" as const,
    address: {
      line1: "",
      line2: "",
      city: "",
      postalCode: "",
      country: "",
    },
    billingAddress: {},
    theme: "light",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    discounts: [],
  };

  await userRef.set(userData);

  await adminAuth.setCustomUserClaims(userId, { role: "customer" });

  return userData;
};

export const getUserData = async (userId: string): Promise<Record<string, unknown> | null> => {
  const userRef = adminDb.collection("users").doc(userId);
  const userSnap = await userRef.get();

  if (userSnap.exists) {
    const data = userSnap.data();

    // Convert Firestore Timestamp to ISO string for serialization
    if (data?.createdAt && typeof data.createdAt.toDate === "function") {
      data.createdAt = data.createdAt.toDate().toISOString();
    }

    // Ensure the id field is always present and matches the document ID
    return {
      ...data,
      id: userId,
    };
  }
  return null;
};

export const updateLastLogin = async (userId: string) => {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({
      lastLoginAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating last login:", error);
    return { success: false, error };
  }
};

export const updateUserRole = async (
  userId: string,
  role: "customer" | "admin" | "superAdmin"
) => {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({ role });

    // Update custom claim in Firebase Auth
    await adminAuth.setCustomUserClaims(userId, { role });

    // Revoke all existing refresh tokens (invalidates all sessions)
    // This forces the user to re-authenticate with the new role
    await adminAuth.revokeRefreshTokens(userId);

    console.log(
      `User ${userId} role changed to ${role}. All sessions revoked.`
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return {
      success: false,
      error: {
        code: "user/update-role-failed",
        message: "Failed to update user role.",
      },
    };
  }
};

export const updateUserProfile = async (
  userId: string,
  profileData: {
    phoneCountryCode: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
  }
) => {
  try {
    const userRef = adminDb.collection("users").doc(userId);

    await userRef.set(
      {
        phoneCountryCode: profileData.phoneCountryCode,
        phoneNumber: profileData.phoneNumber,
        address: {
          line1: profileData.addressLine1,
          line2: profileData.addressLine2 || "",
          city: profileData.city,
          postalCode: profileData.postalCode,
          country: profileData.country,
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`User ${userId} profile updated successfully`);

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: {
        code: "user/update-profile-failed",
        message: "Failed to update user profile.",
      },
    };
  }
};

export const changeUserPassword = async (
  userId: string,
  newPassword: string
) => {
  try {
    await adminAuth.updateUser(userId, {
      password: newPassword,
    });

    console.log(`Password changed successfully for user ${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: {
        code: "user/change-password-failed",
        message: "Failed to change password.",
      },
    };
  }
};

export const getUserFavorites = async (userId: string) => {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { success: true, favorites: [] };
    }

    const userData = userDoc.data();
    const favoriteIds = userData?.favorites || [];

    if (favoriteIds.length === 0) {
      return { success: true, favorites: [] };
    }

    const productsRef = adminDb.collection("products");
    const favoriteProducts: Product[] = [];

    for (const productId of favoriteIds) {
      const productDoc = await productsRef.doc(productId).get();
      if (productDoc.exists) {
        favoriteProducts.push({
          id: productDoc.id,
          ...productDoc.data(),
        } as Product);
      }
    }

    return { success: true, favorites: favoriteProducts };
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return {
      success: false,
      favorites: [],
      error: {
        code: "user/fetch-favorites-failed",
        message: "Failed to fetch favorites.",
      },
    };
  }
};

export const addUserFavorite = async (userId: string, productId: string) => {
  try {
    const userRef = adminDb.collection("users").doc(userId);

    // Use arrayUnion to add productId atomically (avoids duplicates)
    // Use set with merge to create the field if it doesn't exist
    await userRef.set(
      {
        favorites: FieldValue.arrayUnion(productId),
      },
      { merge: true }
    );

    console.log(`Product ${productId} added to favorites for user ${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Error adding favorite:", error);
    return {
      success: false,
      error: {
        code: "user/add-favorite-failed",
        message: "Failed to add product to favorites.",
      },
    };
  }
};

export const removeUserFavorite = async (userId: string, productId: string) => {
  try {
    const userRef = adminDb.collection("users").doc(userId);

    // Use arrayRemove to remove productId atomically
    // Use set with merge to handle edge cases
    await userRef.set(
      {
        favorites: FieldValue.arrayRemove(productId),
      },
      { merge: true }
    );

    console.log(
      `Product ${productId} removed from favorites for user ${userId}`
    );

    return { success: true };
  } catch (error) {
    console.error("Error removing favorite:", error);
    return {
      success: false,
      error: {
        code: "user/remove-favorite-failed",
        message: "Failed to remove product from favorites.",
      },
    };
  }
};
