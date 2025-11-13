"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { calculateSubtotal } from "@/lib/productPrice";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  loadUserCart,
  syncUserCart,
  mergeUserCart,
} from "@/app/actions/cart/sync";

export interface CartItem {
  productId: string;
  title: string;
  brand: string;
  price: {
    amount: number;
    currency: string;
  };
  discount: { rate: number } | null;
  size?: string;
  quantity: number;
  image: string;
  stripePriceId: string;
  taxRate: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (
    productId: string,
    size: string | undefined,
    quantity: number
  ) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [previousUserId, setPreviousUserId] = useState<string | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem("shopping-cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    async function handleAuthChange() {
      if (userId && userId !== previousUserId) {
        try {
          const localCart = items.length > 0 ? items : [];

          // Merge local cart with user's Firestore cart
          const mergedCart = await mergeUserCart(localCart);

          if (mergedCart) {
            setItems(mergedCart);
            localStorage.setItem("shopping-cart", JSON.stringify(mergedCart));
          } else {
            const userCart = await loadUserCart();
            if (userCart && userCart.length > 0) {
              setItems(userCart);
              localStorage.setItem("shopping-cart", JSON.stringify(userCart));
            }
          }
        } catch (error) {
          console.error("Error loading/merging user cart:", error);
        }

        setPreviousUserId(userId);
      } else if (!userId && previousUserId) {
        setItems([]);
        localStorage.removeItem("shopping-cart");
        setPreviousUserId(null);
      }
    }

    handleAuthChange();
  }, [userId, isInitialized, previousUserId]);

  useEffect(() => {
    if (!isInitialized) return;

    localStorage.setItem("shopping-cart", JSON.stringify(items));

    if (userId) {
      syncUserCart(items).catch((error) => {
        console.error("Failed to sync cart to Firestore:", error);
      });
    }
  }, [items, isInitialized, userId]);

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i.productId === item.productId && i.size === item.size
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
        };
        return updatedItems;
      } else {
        return [...prevItems, item];
      }
    });
  };

  const removeItem = (productId: string, size?: string) => {
    setItems((prevItems) =>
      prevItems.filter((i) => !(i.productId === productId && i.size === size))
    );
  };

  const updateQuantity = (
    productId: string,
    size: string | undefined,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("shopping-cart");
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return calculateSubtotal(items);
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
