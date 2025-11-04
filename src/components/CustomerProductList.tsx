"use client";

import { Product } from "@/Types/productValidation";
import { CustomerProductCard } from "@/components/CustomerProductCard";

interface CustomerProductListProps {
  products: Product[];
}

export function CustomerProductList({ products }: CustomerProductListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20">
      {products.map((product, index) => (
        <CustomerProductCard
          key={product.id}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
