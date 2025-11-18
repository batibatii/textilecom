"use client";

import { useEffect, useState } from "react";
import type { User } from "@/app/AuthProvider";
import { getFavorites } from "@/app/actions/user/getFavorites";

interface FavoritesProps {
  user: User;
}

interface Product {
  id: string;
  [key: string]: unknown;
}

export function Favorites({ user }: FavoritesProps) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      const result = await getFavorites(user.id);
      if (result.success) {
        setFavorites(result.favorites);
      }
      setLoading(false);
    };

    loadFavorites();
  }, [user.id]);

  if (loading) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        Loading favorites...
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No favorites yet</p>
        <p className="text-xs text-muted-foreground mt-2">
          Start adding products to your favorites!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {favorites.length} favorite(s) found
      </p>
    </div>
  );
}
