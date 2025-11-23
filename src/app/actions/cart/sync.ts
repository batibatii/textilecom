"use server";

import {
  getCartByUserId,
  saveCart,
  deleteCart,
  mergeCart,
} from "@/lib/firebase/dal/cart";
import type { CartItem } from "@/app/CartProvider";
import { getCurrentUserId } from "@/lib/auth/session";

export async function loadUserCart(): Promise<CartItem[] | null> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return null;
    }

    return await getCartByUserId(userId);
  } catch (error) {
    console.error("Error loading user cart:", error);
    return null;
  }
}

export async function syncUserCart(items: CartItem[]): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return false;
    }

    await saveCart(userId, items);
    return true;
  } catch (error) {
    console.error("Error syncing user cart:", error);
    return false;
  }
}

export async function clearUserCart(): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return false;
    }

    await deleteCart(userId);
    return true;
  } catch (error) {
    console.error("Error clearing user cart:", error);
    return false;
  }
}

export async function mergeUserCart(
  localItems: CartItem[]
): Promise<CartItem[] | null> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return null;
    }

    return await mergeCart(userId, localItems);
  } catch (error) {
    console.error("Error merging user cart:", error);
    return null;
  }
}
