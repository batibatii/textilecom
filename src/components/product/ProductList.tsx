"use client";

import { useState, useMemo } from "react";
import { Product } from "@/Types/productValidation";
import { AdminProductCard } from "@/components/product/AdminProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { AdminProductFilters, SortOption } from "@/Types/adminFilterTypes";
import { sortProducts } from "@/lib/utils/productFilters";
import { FilterSection } from "./filters/FilterSection";
import { ProductSorting } from "./filters/ProductSorting";
import { FilterBadges } from "./filters/FilterBadges";
import { MobileFilterDrawer } from "./filters/MobileFilterDrawer";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface ProductListProps {
  products: Product[];
  showMoveToDraft?: boolean;
}

export function ProductList({
  products,
  showMoveToDraft = false,
}: ProductListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AdminProductFilters>({
    categories: [],
  });
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const router = useRouter();
  const productsPerPage = 12;

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    products.forEach((product) => {
      categories.add(product.category);
    });
    return Array.from(categories).sort();
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (filters.categories.length > 0) {
      result = result.filter((product) =>
        filters.categories.includes(product.category)
      );
    }

    result = sortProducts(result, sortBy);

    return result;
  }, [products, filters, sortBy]);

  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / productsPerPage
  );
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  const handleFilterChange = (newFilters: AdminProductFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleRemoveFilter = (
    type: keyof AdminProductFilters,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((v) => v !== value),
    }));
    setCurrentPage(1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleProductUpdate = () => {
    router.refresh();
  };

  const renderPagination = () => (
    <Pagination className="justify-end sm:pr-10 md:pr-0 ">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrevious}
            className={
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
        {getPageNumbers().map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => setCurrentPage(page)}
              isActive={currentPage === page}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  const activeFilterCount = filters.categories.length;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="hidden md:block w-64 space-y-4 sticky top-4 h-fit">
        <div className="space-y-4 border rounded-none p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange({ categories: [] })}
                className="h-auto p-1 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          <FilterSection
            title="Category"
            options={availableCategories}
            selected={filters.categories}
            onChange={(categories) =>
              handleFilterChange({ ...filters, categories })
            }
          />
        </div>
        <ProductSorting sortBy={sortBy} onChange={handleSortChange} />
      </aside>

      <div className="flex-1">
        <div className="md:hidden flex gap-2 mb-4">
          <MobileFilterDrawer
            filters={{
              brands: [],
              categories: filters.categories,
              sex: [],
            }}
            onChange={(newFilters) =>
              handleFilterChange({ categories: newFilters.categories })
            }
            availableValues={{
              brands: [],
              categories: availableCategories,
              sex: [],
            }}
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
            <ProductSorting sortBy={sortBy} onChange={handleSortChange} />
          </div>
        </div>

        <FilterBadges
          filters={{
            brands: [],
            categories: filters.categories,
            sex: [],
          }}
          onRemove={(type, value) => {
            if (type === "categories") {
              handleRemoveFilter("categories", value);
            }
          }}
        />

        <div className="flex mb-5">
          <p className="text-sm text-muted-foreground whitespace-nowrap mt-2">
            Showing {filteredAndSortedProducts.length} products
          </p>
          {totalPages > 1 && renderPagination()}
        </div>

        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20">
            {currentProducts.map((product, index) => (
              <AdminProductCard
                key={product.id}
                product={product}
                onDelete={handleProductUpdate}
                onUpdate={handleProductUpdate}
                priority={index < 4}
                showMoveToDraft={showMoveToDraft}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              No products match your filters
            </p>
            <Button
              variant="outline"
              onClick={() => handleFilterChange({ categories: [] })}
              className="rounded-none"
            >
              Clear all filters
            </Button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-5 lg:hidden">{renderPagination()}</div>
        )}
      </div>
    </div>
  );
}
