"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/Types/productValidation";
import Image from "next/image";
import { ProductDetailDialog } from "@/components/product/ProductDetailDialog";
import { PriceDisplay } from "@/components/product/PriceDisplay";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDialogState } from "@/hooks/useDialogState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface CustomerProductCardProps {
  product: Product;
  priority?: boolean;
}

export function CustomerProductCard({
  product,
  priority = false,
}: CustomerProductCardProps) {
  const productDialog = useDialogState();
  const loginDialog = useDialogState();
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();

  const isProductFavorited = isFavorited(product.id);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      loginDialog.openDialog();
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
      <Card className="overflow-hidden transition-shadow shadow-none border-none p-4 w-full max-w-md mx-auto">
        <div
          className="relative w-full aspect-3/4 bg-muted cursor-pointer"
          onClick={productDialog.openDialog}
        >
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-fit"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              loading={priority ? undefined : "lazy"}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No Image
            </div>
          )}
          {product.stock === 0 && (
            <Badge
              variant="destructive"
              className="absolute top-2 left-2 font-semibold"
            >
              OUT OF STOCK
            </Badge>
          )}
          {product.stock > 0 && product.stock <= 3 && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-amber-500 text-white hover:bg-amber-600 font-semibold"
            >
              LOW STOCK
            </Badge>
          )}
        </div>
        <div className="space-y-2 mt-2">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between gap-2 w-full">
              <CardTitle
                className="font-light text-[12px] md:text-[13px] tracking-wider md:font-extralight cursor-pointer hover:underline"
                onClick={productDialog.openDialog}
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
          <CardContent className="p-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PriceDisplay
                  product={product}
                  priceSpanClassName="font-light text-[11px] md:text-[12px] md:font-extralight"
                  priceClassName="font-light text-[11px] md:text-[12px] md:font-extralight text-muted-foreground line-through"
                  discountClassName="text-[11px] md:text-[12px] font-semibold text-green-900 bg-green-50 px-2 py-0.5 rounded"
                />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <ProductDetailDialog
        product={product}
        open={productDialog.open}
        onOpenChange={productDialog.setOpen}
      />

      <Dialog open={loginDialog.open} onOpenChange={loginDialog.setOpen}>
        <DialogContent className="rounded-none p-6">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please log in to save products to your favorites.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={loginDialog.closeDialog}
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
