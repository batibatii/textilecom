"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/Types/productValidation";
import Image from "next/image";

interface CustomerProductCardProps {
  product: Product;
  priority?: boolean;
}

const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    TRY: "₺",
  };
  return symbols[currency] || currency;
};

export function CustomerProductCard({
  product,
  priority = false,
}: CustomerProductCardProps) {
  const displayPrice = product.discount
    ? (product.price.amount * (1 - product.discount.rate / 100)).toFixed(2)
    : product.price.amount.toFixed(2);

  const hasDiscount = product.discount && product.discount.rate > 0;
  const currencySymbol = getCurrencySymbol(product.price.currency);

  return (
    <Card className="overflow-hidden transition-shadow shadow-none border-none p-0 pb-4 w-full max-w-md mx-auto">
      <div className="relative w-full aspect-3/4 bg-muted">
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
        <CardHeader className="pt-2 pl-0">
          <CardTitle className="font-light text-[12px] md:text-[13px] tracking-wider md:font-extralight w-full truncate">
            {product.title.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4 pl-0 pr-0 pt-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {hasDiscount && (
                <span className="font-light text-[11px] md:text-[12px] md:font-extralight text-muted-foreground line-through">
                  {currencySymbol}
                  {product.price.amount.toFixed(2)}
                </span>
              )}
              <span className="font-light text-[11px] md:text-[12px] md:font-extralight">
                {currencySymbol}
                {displayPrice}
              </span>
            </div>
            {hasDiscount && (
              <span className="text-[11px] md:text-[12px] font-medium text-green-900">
                -{product?.discount?.rate}%
              </span>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
