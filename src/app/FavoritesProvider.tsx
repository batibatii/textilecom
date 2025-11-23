"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { addFavorite } from "@/app/actions/user/addFavorite";
import { removeFavorite } from "@/app/actions/user/removeFavorite";
import { getUserData } from "@/lib/firebase/dal/users";

interface FavoritesContextType {
  favorites: string[];
  addToFavorites: (productId: string) => Promise<boolean>;
  removeFromFavorites: (productId: string) => Promise<boolean>;
  isFavorited: (productId: string) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function loadFavorites() {
      if (!userId) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await getUserData(userId);
        setFavorites(userData?.favorites || []);
      } catch (error) {
        console.error("Error loading favorites:", error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [userId]);

  const addToFavorites = async (productId: string): Promise<boolean> => {
    if (!userId) {
      return false;
    }

    // Optimistic update - add immediately to UI
    setFavorites((prev) => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });

    try {
      const result = await addFavorite(productId);

      if (!result.success) {
        // Revert on error
        setFavorites((prev) => prev.filter((id) => id !== productId));
        console.error("Failed to add favorite:", result.error);
        return false;
      }

      return true;
    } catch (error) {
      setFavorites((prev) => prev.filter((id) => id !== productId));
      console.error("Error adding to favorites:", error);
      return false;
    }
  };

  const removeFromFavorites = async (productId: string): Promise<boolean> => {
    if (!userId) {
      return false;
    }

    // Optimistic update - remove immediately from UI
    const previousFavorites = favorites;
    setFavorites((prev) => prev.filter((id) => id !== productId));

    try {
      const result = await removeFavorite(productId);

      if (!result.success) {
        setFavorites(previousFavorites);
        console.error("Failed to remove favorite:", result.error);
        return false;
      }

      return true;
    } catch (error) {
      setFavorites(previousFavorites);
      console.error("Error removing from favorites:", error);
      return false;
    }
  };

  const isFavorited = (productId: string): boolean => {
    return favorites.includes(productId);
  };

  const value: FavoritesContextType = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
    loading,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
