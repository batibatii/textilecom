"use client";

import { useEffect, useState } from "react";
import { Product } from "@/Types/productValidation";
import { getProducts } from "@/app/actions/admin/products/list";
import { ProductCard } from "@/components/ProductCard";
import { TailChase } from "ldrs/react";


export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(undefined);

    const result = await getProducts();

    if (result.success) {
      setProducts(result.products);
    } else {
      setError(result.error.message);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-background">
        <TailChase size="40" speed="1.75" color="black" />
        <span className="text-muted-foreground">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl text-center font-bold mt-8 mb-10">
          Product Management
        </h1>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-destructive font-semibold">
              Error loading products
            </p>
            <p className="text-muted-foreground text-sm max-w-md">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (products.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl text-center font-bold mt-8 mb-10">
          Product Management
        </h1>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground font-semibold">
              No products found
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              Start by creating your first product
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl text-center font-bold mt-8 mb-15">
        Product Management
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20  ">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={fetchProducts}
            onUpdate={fetchProducts}
          />
        ))}
      </div>
    </main>
  );
}
