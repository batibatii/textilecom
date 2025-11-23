"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/Types/productValidation";
import Image from "next/image";
import { ProductDetailDialog } from "@/components/product/ProductDetailDialog";
import {
  getCurrencySymbol,
  getDisplayPrice,
  hasDiscount as checkHasDiscount,
  formatPrice,
} from "@/lib/productPrice";
import { useState } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CustomerProductCardProps {
  product: Product;
  priority?: boolean;
}

export function CustomerProductCard({
  product,
  priority = false,
}: CustomerProductCardProps) {
  const displayPrice = getDisplayPrice(product);
  const hasDiscount = checkHasDiscount(product);
  const currencySymbol = getCurrencySymbol(product.price.currency);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();

  const isProductFavorited = isFavorited(product.id);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      setLoginDialogOpen(true);
      return;
    }

    if (isProductFavorited) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites(product.id);
    }
  };

  return (
    <>
      <Card className="overflow-hidden transition-shadow shadow-none border-none p-0 pb-4 w-full max-w-md mx-auto">
        <div
          className="relative w-full aspect-3/4 bg-muted cursor-pointer"
          onClick={() => setDialogOpen(true)}
        >
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No Image
            </div>
          )}
        </div>
        <div className="">
          <CardHeader className="pt-2 pl-0 pr-0">
            <div className="flex items-center justify-between gap-2 w-full">
              <CardTitle
                className="font-light text-[12px] md:text-[13px] tracking-wider md:font-extralight cursor-pointer hover:underline"
                onClick={() => setDialogOpen(true)}
              >
                {product.title.toUpperCase()}
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill={isProductFavorited ? "#000000" : "none"}
                viewBox="0 0 256 256"
                className="shrink-0 cursor-pointer active:translate-y-0.5 transition-all hover:scale-110"
                onClick={handleToggleFavorite}
                stroke="#000000"
                strokeWidth={isProductFavorited ? "0" : "16"}
              >
                <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"></path>
              </svg>
            </div>
          </CardHeader>
          <CardContent className="pb-4 pl-0 pr-0 pt-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {hasDiscount && (
                  <span className="font-light text-[11px] md:text-[12px] md:font-extralight text-muted-foreground line-through">
                    {formatPrice(product.price.amount, product.price.currency)}
                  </span>
                )}
                <span className="font-light text-[11px] md:text-[12px] md:font-extralight">
                  {currencySymbol}
                  {displayPrice}
                </span>
              </div>
              {hasDiscount && (
                <span className="text-[11px] md:text-[12px] font-semibold text-green-900 bg-green-50 px-2 py-0.5 rounded">
                  -{product?.discount?.rate}%
                </span>
              )}
            </div>
          </CardContent>
        </div>
      </Card>

      <ProductDetailDialog
        product={product}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="rounded-none">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please log in to save products to your favorites.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setLoginDialogOpen(false)}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Link href="/user/signup">
              <Button className="rounded-none">Log In</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
