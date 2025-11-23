"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "@/Types/productValidation";
import { CustomerProductCard } from "@/components/product/CustomerProductCard";
import { CustomerProductCardSkeleton } from "@/components/product/skeletons/CustomerProductCardSkeleton";
import { getProductsInfinite } from "@/app/actions/products/infinite";

interface CustomerProductListProps {
  initialProducts: Product[];
  totalProducts: number;
}

export function CustomerProductList({
  initialProducts,
  totalProducts,
}: CustomerProductListProps) {
  // Deduplicate initial products just in case
  const uniqueInitialProducts = Array.from(
    new Map(initialProducts.map((product) => [product.id, product])).values()
  );

  const [products, setProducts] = useState<Product[]>(uniqueInitialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    uniqueInitialProducts.length < totalProducts
  );
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const currentTarget = observerTarget.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, products.length]);

  const loadMoreProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getProductsInfinite(12, products.length);

      if (result.success) {
        setProducts((prev) => {
          // Create a Map to track existing product IDs
          const existingIds = new Set(prev.map((p) => p.id));
          // Only add products that don't already exist
          const newProducts = result.products.filter(
            (p) => !existingIds.has(p.id)
          );
          return [...prev, ...newProducts];
        });
        setHasMore(result.hasMore);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError("Failed to load more products. Please try again.");
      console.error("Error loading more products:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20">
        {products.map((product, index) => (
          <CustomerProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}

        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <CustomerProductCardSkeleton key={`skeleton-${index}`} />
          ))}
      </div>

      {/* Intersection observer target */}
      {hasMore && <div ref={observerTarget} className="h-20" />}

      {error && (
        <div className="flex justify-center items-center py-8">
          <p className="text-destructive text-center">{error}</p>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="flex flex-col justify-center items-center py-8 gap-4">
          <p className="text-muted-foreground text-center">
            You&apos;ve reached the end!
          </p>
          <button
            onClick={scrollToTop}
            className="text-sm font-medium text-primary hover:underline md:hidden cursor-pointer"
          >
            Go to Top ↑
          </button>
        </div>
      )}
    </div>
  );
}
