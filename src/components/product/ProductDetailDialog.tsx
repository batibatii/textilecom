"use client";

import { Product } from "@/Types/productValidation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { H5 } from "@/components/ui/headings";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { useState } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useDialogState } from "@/hooks/useDialogState";
import { SuccessAlert } from "@/components/alert/SuccessAlert";
import { PriceDisplay } from "@/components/product/PriceDisplay";

interface ProductDetailDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
}: ProductDetailDialogProps) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorited } = useFavorites();
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [quantity, setQuantity] = useState<number>(1);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const loginDialog = useDialogState();
  const unavailableDialog = useDialogState();

  const isProductFavorited = isFavorited(product.id);

  const needsSizeSelection = !["Accessories", "Shoes", "Socks"].includes(
    product.category
  );

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

  const handleAddToCart = () => {
    if (!product.stripePriceId) {
      unavailableDialog.openDialog();
      return;
    }

    const cartItem: CartItem = {
      productId: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      discount: product.discount || null,
      quantity: quantity,
      image:
        product.images && product.images.length > 0 ? product.images[0] : "",
      stripePriceId: product.stripePriceId,
      taxRate: product.taxRate,
    };

    if (needsSizeSelection) {
      cartItem.size = selectedSize;
    }

    addItem(cartItem);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    setQuantity(1);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl w-full max-h-[90vh] rounded-none overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="relative w-full aspect-3/4 bg-muted overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-fit"
                  sizes="(max-width: 768px) 100vw, 50vw"
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

            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                <div>
                  <DialogTitle className="text-xl md:text-2xl font-light tracking-wide">
                    {product.title.toUpperCase()}
                  </DialogTitle>

                  <p className="text-sm text-muted-foreground">
                    {product.serialNumber}
                  </p>
                </div>

                <p className="text-base font-medium">{product.brand}</p>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <PriceDisplay product={product} />
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    {needsSizeSelection && <H5>Select Size</H5>}
                    <div className="flex gap-2">
                      {needsSizeSelection ? (
                        ["S", "M", "L", "XXL"].map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`w-12 h-12 border transition-colors flex items-center justify-center text-sm font-medium cursor-pointer ${
                              selectedSize === size
                                ? "border-gray-900 border-2 bg-gray-100"
                                : "border-gray-300 hover:border-gray-900"
                            }`}
                          >
                            {size}
                          </button>
                        ))
                      ) : (
                        <button className="px-4 h-12 border border-gray-900  transition-colors flex items-center justify-center text-sm font-medium cursor-pointer">
                          One Size
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="w-10 h-10 border border-gray-300 hover:border-gray-900 transition-colors flex items-center justify-center text-lg font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="text-base font-medium min-w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 border border-gray-300 hover:border-gray-900 transition-colors flex items-center justify-center text-lg font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 space-y-3">
                <SuccessAlert
                  message={
                    showSuccess ? "Added to cart successfully!" : undefined
                  }
                  className="p-2 rounded-none"
                />
                <Button
                  onClick={handleAddToCart}
                  variant="default"
                  disabled={product.stock === 0}
                  className="w-full py-3 px-6 transition-colors h-12 font-medium text-base cursor-pointer active:translate-y-0.5 active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      <Dialog
        open={unavailableDialog.open}
        onOpenChange={unavailableDialog.setOpen}
      >
        <DialogContent className="rounded-none p-6">
          <DialogHeader>
            <DialogTitle>Product Unavailable</DialogTitle>
            <DialogDescription>
              This product is not available for purchase yet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              onClick={unavailableDialog.closeDialog}
              className="rounded-none"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
