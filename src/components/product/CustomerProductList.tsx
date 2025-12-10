"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "@/Types/productValidation";
import { ProductFilters, SortOption } from "@/Types/filterTypes";
import { CustomerProductCard } from "@/components/product/CustomerProductCard";
import { CustomerProductCardSkeleton } from "@/components/product/skeletons/CustomerProductCardSkeleton";
import { ProductFilters as ProductFiltersComponent } from "./filters/ProductFilters";
import { ProductSorting } from "./filters/ProductSorting";
import { FilterBadges } from "./filters/FilterBadges";
import { MobileFilterDrawer } from "./filters/MobileFilterDrawer";
import { SearchInput } from "./filters/SearchInput";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { getFilteredProducts } from "@/app/actions/products/getFiltered";
import { useAsyncData } from "@/hooks/useAsyncData";

interface CustomerProductListProps {
  initialProducts: Product[];
  totalProducts: number;
  filterOptions: {
    brands: string[];
    categories: string[];
    sex: string[];
  };
}

const ITEMS_PER_PAGE = 12;

export function CustomerProductList({
  initialProducts,
  totalProducts,
  filterOptions,
}: CustomerProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hasMore, setHasMore] = useState(
    initialProducts.length < totalProducts
  );
  const [total, setTotal] = useState(totalProducts);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProductFilters>({
    brands: [],
    categories: [],
    sex: [],
    searchQuery: "",
  });
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const observerTarget = useRef<HTMLDivElement>(null);
  const fetchOperation = useAsyncData();

  const fetchProducts = async (offset: number, append: boolean = false) => {
    await fetchOperation.execute(async () => {
      const result = await getFilteredProducts(
        filters,
        sortBy,
        ITEMS_PER_PAGE,
        offset
      );

      if (result.success) {
        setProducts((prev) => {
          if (append) {
            // Deduplicate products by ID when appending
            const existingIds = new Set(prev.map((p) => p.id));
            const newProducts = result.products.filter(
              (p) => !existingIds.has(p.id)
            );
            return [...prev, ...newProducts];
          }
          return result.products;
        });
        setHasMore(result.hasMore);
        setTotal(result.total);
      } else {
        throw new Error(result.error.message);
      }
    });
  };

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      searchQuery,
    }));
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts(0, false);
  }, [filters, sortBy]);

  const loadMore = () => {
    if (!fetchOperation.loading && hasMore) {
      fetchProducts(products.length, true);
    }
  };

  // Intersection observer for infinite scroll
  useEffect(() => {
    const currentTarget = observerTarget.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !fetchOperation.loading) {
          loadMore();
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
  }, [hasMore, fetchOperation.loading, products.length]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemoveFilter = (
    type: "brands" | "categories" | "sex",
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((v) => v !== value),
    }));
  };

  const activeFilterCount =
    filters.brands.length + filters.categories.length + filters.sex.length;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="hidden md:block w-64 space-y-4 sticky top-4 h-fit">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search products..."
        />
        <ProductFiltersComponent
          filters={filters}
          onChange={setFilters}
          availableValues={filterOptions}
        />
        <ProductSorting sortBy={sortBy} onChange={setSortBy} />
      </aside>

      <div className="flex-1">
        <div className="md:hidden mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products..."
          />
        </div>

        <div className="md:hidden flex gap-2 mb-4">
          <MobileFilterDrawer
            filters={filters}
            onChange={setFilters}
            availableValues={filterOptions}
          >
            <Button variant="outline" size="sm" className="rounded-none">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </MobileFilterDrawer>

          <div className="flex-1">
            <ProductSorting sortBy={sortBy} onChange={setSortBy} />
          </div>
        </div>

        <FilterBadges filters={filters} onRemove={handleRemoveFilter} />

        <p className="text-sm text-muted-foreground mb-4">
          {searchQuery && `Searching for "${searchQuery}" - `}
          Showing {products.length} of {total} products
        </p>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, index) => (
                <CustomerProductCard
                  key={`${product.id}-${index}`}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>

            {fetchOperation.loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <CustomerProductCardSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            )}

            {hasMore && !fetchOperation.loading && (
              <div ref={observerTarget} className="h-20" />
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
          </>
        ) : fetchOperation.loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <CustomerProductCardSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              No products match your filters
            </p>
            <Button
              variant="outline"
              onClick={() =>
                setFilters({ brands: [], categories: [], sex: [] })
              }
              className="rounded-none"
            >
              Clear all filters
            </Button>
          </div>
        )}

        {fetchOperation.error && (
          <div className="flex justify-center items-center py-8">
            <p className="text-destructive text-center">
              {fetchOperation.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
