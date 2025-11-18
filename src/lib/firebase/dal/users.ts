"use server";

import { adminDb, adminAuth } from "../admin";

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
    discounts: [],
  };

  await userRef.set(userData);

  await adminAuth.setCustomUserClaims(userId, { role: "customer" });

  return userData;
};

export const getUserData = async (userId: string) => {
  const userRef = adminDb.collection("users").doc(userId);
  const userSnap = await userRef.get();

  if (userSnap.exists) {
    const data = userSnap.data();

    // Convert Firestore Timestamp to ISO string for serialization
    if (data?.createdAt && typeof data.createdAt.toDate === 'function') {
      data.createdAt = data.createdAt.toDate().toISOString();
    }

    return data;
  }
  return null;
};

export const updateUserRole = async (
  userId: string,
  role: "customer" | "admin" | "superAdmin"
) => {
  try {
    // Update role in Firestore
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.update({ role });

    // Update custom claim in Firebase Auth
    await adminAuth.setCustomUserClaims(userId, { role });

    // Revoke all existing refresh tokens (invalidates all sessions)
    // This forces the user to re-authenticate with the new role
    await adminAuth.revokeRefreshTokens(userId);

    console.log(`User ${userId} role changed to ${role}. All sessions revoked.`);

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
