"use client";

import { useState, useMemo, useCallback } from "react";
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
import {
  sortProducts,
  searchProductsForAdmin,
} from "@/lib/utils/productFilters";
import { FilterSection } from "./filters/FilterSection";
import { ProductSorting } from "./filters/ProductSorting";
import { FilterBadges } from "./filters/FilterBadges";
import { MobileFilterDrawer } from "./filters/MobileFilterDrawer";
import { SearchInput } from "./filters/SearchInput";
import { Button } from "@/components/ui/button";
import { Filter, Grid2x2, Square } from "lucide-react";

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
    brands: [],
    categories: [],
    searchQuery: "",
  });
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [mobileViewMode, setMobileViewMode] = useState<"grid" | "list">("list");
  const router = useRouter();
  const productsPerPage = 12;

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((product) => {
      brands.add(product.brand);
    });
    return Array.from(brands).sort();
  }, [products]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    products.forEach((product) => {
      categories.add(product.category);
    });
    return Array.from(categories).sort();
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (filters.searchQuery) {
      result = searchProductsForAdmin(result, filters.searchQuery);
    }

    if (filters.brands.length > 0) {
      result = result.filter((product) =>
        filters.brands.includes(product.brand)
      );
    }

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

  const handleSearchChange = useCallback((newSearch: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: newSearch }));
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters: AdminProductFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  }, []);

  const handleRemoveFilter = useCallback(
    (type: "brands" | "categories", value: string) => {
      setFilters((prev) => ({
        ...prev,
        [type]: prev[type].filter((v) => v !== value),
      }));
      setCurrentPage(1);
    },
    []
  );

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
    const pages: (number | string)[] = [];

    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Add ellipsis after first if current is far from start
      if (currentPage > 2) {
        pages.push("...");
      }

      // Show current page if it's not first or last
      if (currentPage !== 1 && currentPage !== totalPages) {
        pages.push(currentPage);
      }

      // Add ellipsis before last if current is far from end
      if (currentPage < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handleProductUpdate = () => {
    router.refresh();
  };

  const renderPagination = () => (
    <Pagination className="justify-center md:justify-end md:pr-10 lg:pr-0">
      <PaginationContent className="gap-1">
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
        {getPageNumbers().map((page, index) => (
          <PaginationItem key={`${page}-${index}`}>
            {page === "..." ? (
              <span className="px-2 md:px-4 py-2">...</span>
            ) : (
              <PaginationLink
                onClick={() => setCurrentPage(page as number)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
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

  const activeFilterCount = filters.brands.length + filters.categories.length;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="hidden md:block w-64 space-y-4 sticky top-4 h-fit">
        <SearchInput
          value={filters.searchQuery || ""}
          onChange={handleSearchChange}
          placeholder="Search products..."
        />
        <div className="space-y-4 border rounded-none p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleFilterChange({ brands: [], categories: [] })
                }
                className="h-auto p-1 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          <FilterSection
            title="Brand"
            options={availableBrands}
            selected={filters.brands}
            onChange={(brands) => handleFilterChange({ ...filters, brands })}
          />
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
        <div className="md:hidden mb-4">
          <SearchInput
            value={filters.searchQuery || ""}
            onChange={handleSearchChange}
            placeholder="Search products..."
          />
        </div>

        <div className="md:hidden flex gap-2 mb-4">
          <MobileFilterDrawer
            filters={{
              brands: filters.brands,
              categories: filters.categories,
              sex: [],
            }}
            onChange={(newFilters) =>
              handleFilterChange({
                brands: newFilters.brands,
                categories: newFilters.categories,
              })
            }
            availableValues={{
              brands: availableBrands,
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

          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() =>
              setMobileViewMode(mobileViewMode === "grid" ? "list" : "grid")
            }
          >
            {mobileViewMode === "grid" ? (
              <Square className="w-4 h-4" />
            ) : (
              <Grid2x2 className="w-4 h-4" />
            )}
          </Button>
        </div>

        <FilterBadges
          filters={{
            brands: filters.brands,
            categories: filters.categories,
            sex: [],
          }}
          onRemove={(type, value) => {
            if (type === "brands" || type === "categories") {
              handleRemoveFilter(type, value);
            }
          }}
        />

        <div className="flex flex-col md:flex mb-3 gap-2 md:gap-0">
          <p className="text-sm text-muted-foreground md:whitespace-nowrap text-center md:text-start md:mt-2 pl-4">
            {filters.searchQuery && `Searching for "${filters.searchQuery}" - `}
            Showing {filteredAndSortedProducts.length} products
          </p>
          {totalPages > 1 && renderPagination()}
        </div>

        {currentProducts.length > 0 ? (
          <div
            className={`grid ${
              mobileViewMode === "grid" ? "grid-cols-2" : "grid-cols-1"
            } sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6`}
          >
            {currentProducts.map((product, index) => (
              <AdminProductCard
                key={product.id}
                product={product}
                onDelete={handleProductUpdate}
                onUpdate={handleProductUpdate}
                priority={index < 4}
                showMoveToDraft={showMoveToDraft}
                mobileViewMode={mobileViewMode}
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
              onClick={() => handleFilterChange({ brands: [], categories: [] })}
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
