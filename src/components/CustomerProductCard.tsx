"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/Types/productValidation";
import Image from "next/image";
import { ProductDetailDialog } from "@/components/ProductDetailDialog";
import {
  getCurrencySymbol,
  getDisplayPrice,
  hasDiscount as checkHasDiscount,
  formatPrice,
} from "@/lib/productPrice";
import { useState } from "react";

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
                className="font-light text-[12px] md:text-[13px] tracking-wider md:font-extralight truncate cursor-pointer hover:underline"
                onClick={() => setDialogOpen(true)}
              >
                {product.title.toUpperCase()}
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#000000"
                viewBox="0 0 256 256"
                className="shrink-0 cursor-pointer active:translate-y-0.5"
              >
                <path d="M160,56H64A16,16,0,0,0,48,72V224a8,8,0,0,0,12.65,6.51L112,193.83l51.36,36.68A8,8,0,0,0,176,224V72A16,16,0,0,0,160,56Zm0,152.46-43.36-31a8,8,0,0,0-9.3,0L64,208.45V72h96ZM208,40V192a8,8,0,0,1-16,0V40H88a8,8,0,0,1,0-16H192A16,16,0,0,1,208,40Z"></path>
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
    </>
  );
}
