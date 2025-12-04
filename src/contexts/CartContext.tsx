"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { calculateSubtotal } from "@/lib/utils/productPrice";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import {
  loadUserCart,
  syncUserCart,
  clearUserCart,
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
  const [isClearing, setIsClearing] = useState(false);
  const isLoadingCartRef = useRef(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isInitialized || isClearing) return;

    async function handleAuthChange() {
      if (userId && userId !== previousUserId) {
        isLoadingCartRef.current = true;
        try {
          // Retry loading cart if session cookie isn't ready yet
          let userCart = await loadUserCart();
          let retries = 0;

          while (userCart === null && retries < 3) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            userCart = await loadUserCart();
            retries++;
          }

          if (userCart && userCart.length > 0) {
            setItems(userCart);
          } else {
            setItems([]);
          }
        } catch (error) {
          console.error("Error loading user cart:", error);
          setItems([]);
        } finally {
          isLoadingCartRef.current = false;
        }

        setPreviousUserId(userId);
      } else if (!userId && previousUserId) {
        // User logged out - clear cart
        setItems([]);
        setPreviousUserId(null);
      }
    }

    handleAuthChange();
  }, [userId, isInitialized, previousUserId, isClearing]);

  useEffect(() => {
    if (!isInitialized || isClearing || !userId || isLoadingCartRef.current) {
      return;
    }

    // Only sync to Firestore if user is logged in and not currently loading
    syncUserCart(items).catch((error) => {
      console.error("Failed to sync cart to Firestore:", error);
    });
  }, [items, isInitialized, userId, isClearing]);

  const addItem = useCallback((item: CartItem) => {
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
  }, []);

  const removeItem = useCallback((productId: string, size?: string) => {
    setItems((prevItems) =>
      prevItems.filter((i) => !(i.productId === productId && i.size === size))
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string | undefined, quantity: number) => {
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
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setIsClearing(true);
    setItems([]);
    if (userId) {
      clearUserCart().catch((error) => {
        console.error("Failed to clear cart in Firestore:", error);
      });
    }
    setTimeout(() => setIsClearing(false), 100);
  }, [userId]);

  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return calculateSubtotal(items);
  }, [items]);

  const value: CartContextType = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      getSubtotal,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      getSubtotal,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
