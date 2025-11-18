"use server";

import { adminDb } from "../admin";
import type { CartItem } from "@/app/CartProvider";

const CARTS_COLLECTION = "carts";

export interface CartDocument {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export async function getCartByUserId(
  userId: string
): Promise<CartItem[] | null> {
  try {
    const cartRef = adminDb.collection(CARTS_COLLECTION).doc(userId);
    const cartSnap = await cartRef.get();

    if (cartSnap.exists) {
      const data = cartSnap.data() as CartDocument;
      return data.items || [];
    }

    return null;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}

export async function saveCart(
  userId: string,
  items: CartItem[]
): Promise<void> {
  try {
    const cartRef = adminDb.collection(CARTS_COLLECTION).doc(userId);
    const cartData: CartDocument = {
      userId,
      items,
      updatedAt: new Date().toISOString(),
    };

    await cartRef.set(cartData, { merge: true });
  } catch (error) {
    console.error("Error saving cart:", error);
    throw error;
  }
}

export async function deleteCart(userId: string): Promise<void> {
  try {
    const cartRef = adminDb.collection(CARTS_COLLECTION).doc(userId);
    await cartRef.delete();
  } catch (error) {
    console.error("Error deleting cart:", error);
    throw error;
  }
}

export async function mergeCart(
  userId: string,
  localItems: CartItem[]
): Promise<CartItem[]> {
  try {
    const existingItems = await getCartByUserId(userId);

    if (!existingItems || existingItems.length === 0) {
      // No existing cart, just save local items
      if (localItems.length > 0) {
        await saveCart(userId, localItems);
      }
      return localItems;
    }

    if (localItems.length === 0) {
      return existingItems;
    }

    const mergedItems = [...existingItems];

    localItems.forEach((localItem) => {
      const existingIndex = mergedItems.findIndex(
        (item) =>
          item.productId === localItem.productId && item.size === localItem.size
      );

      if (existingIndex > -1) {
        mergedItems[existingIndex].quantity += localItem.quantity;
      } else {
        mergedItems.push(localItem);
      }
    });

    await saveCart(userId, mergedItems);
    return mergedItems;
  } catch (error) {
    console.error("Error merging cart:", error);
    throw error;
  }
}
