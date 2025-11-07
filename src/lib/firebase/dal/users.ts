"use server";

import { adminDb } from "../admin";

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
