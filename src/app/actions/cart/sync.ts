"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import {
  getCartByUserId,
  saveCart,
  deleteCart,
  mergeCart,
} from "@/lib/firebase/dal/cart";
import type { CartItem } from "@/app/CartProvider";

const SESSION_COOKIE_NAME = "session";

async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    return decodedClaims.sub;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

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
