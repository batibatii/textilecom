"use client";

import { useEffect, useState } from "react";
import type { User } from "@/contexts/AuthContext";
import type { Product } from "@/Types/productValidation";
import { getFavorites } from "@/app/actions/user/getFavorites";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  getCurrencySymbol,
  formatPrice,
  getDisplayPrice,
  hasDiscount as checkHasDiscount,
} from "@/lib/utils/productPrice";

interface FavoritesProps {
  user: User;
}

export function Favorites({ user }: FavoritesProps) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { removeFromFavorites } = useFavorites();
  const { addItem } = useCart();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  const handleRemove = async (productId: string) => {
    const success = await removeFromFavorites(productId);
    if (success) {
      setFavorites((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!product.stripePriceId) {
      alert("This product is not available for purchase yet.");
      return;
    }

    const needsSizeSelection = !["Accessories", "Shoes", "Socks"].includes(
      product.category
    );

    const cartItem: CartItem = {
      productId: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      discount: product.discount || null,
      quantity: 1,
      image:
        product.images && product.images.length > 0 ? product.images[0] : "",
      stripePriceId: product.stripePriceId,
      taxRate: product.taxRate,
    };

    if (needsSizeSelection) {
      cartItem.size = "M";
    }

    addItem(cartItem);
  };

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
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {favorites.length} favorite(s) found
      </p>

      <div className="flex flex-col md:flex-row gap-6 md:overflow-x-auto pb-4 md:flex-nowrap">
        {favorites.map((product) => {
          const displayPrice = getDisplayPrice(product);
          const hasDiscount = checkHasDiscount(product);
          const currencySymbol = getCurrencySymbol(product.price.currency);

          return (
            <Card
              key={product.id}
              className="overflow-hidden transition-shadow shadow-none p-0 w-full md:shrink-0 md:w-[320px]"
            >
              <div className="relative w-full h-80 md:h-[400px] bg-muted">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-light text-sm tracking-wider truncate">
                    {product.title.toUpperCase()}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {product.brand}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {hasDiscount && (
                    <span className="font-light text-xs text-muted-foreground line-through">
                      {formatPrice(
                        product.price.amount,
                        product.price.currency
                      )}
                    </span>
                  )}
                  <span className="font-light text-sm">
                    {currencySymbol}
                    {displayPrice}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs font-semibold text-green-900 bg-green-50 px-2 py-0.5 rounded">
                      -{product?.discount?.rate}%
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    variant="default"
                    className="w-full text-sm h-9"
                  >
                    ADD TO CART
                  </Button>
                  <Button
                    onClick={() => handleRemove(product.id)}
                    size="sm"
                    className="w-full text-sm h-9                   
                   bg-background text-foreground rounded-none border border-black hover:bg-destructive hover:text-background"
                  >
                    DELETE
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center py-4 md:hidden">
        <button
          onClick={scrollToTop}
          className="text-sm font-medium text-primary hover:underline cursor-pointer"
        >
          Go to Top ↑
        </button>
      </div>
    </div>
  );
}
